import type { Prisma, PrismaClient } from "@prisma/client";
import { env } from "@/config/env";
import { WorkOrderInsufficientPartStockError } from "@/modules/work-orders/domain/work-order.errors";
import { WorkOrderStatus } from "@/modules/work-orders/domain/work-order-status";
import { queueNotification } from "@/shared/infrastructure/queue-notification";
import {
  InvalidQuoteAuthorizationError,
  QuoteConcurrentUpdateError,
  QuoteDecisionConflictError,
  QuoteNotFoundError,
  QuoteNotReadyToSendError,
  QuoteOrderConflictError,
} from "../../domain/quote.errors";
import type {
  DecideQuoteInput,
  QuoteDecisionResult,
  QuoteDetails,
  QuoteRepository,
  SendQuoteInput,
} from "../../domain/quote.repository";
import {
  decideQuoteStatus,
  expireQuoteStatus,
  QuoteStatus,
  workOrderStatusForQuoteDecision,
} from "../../domain/quote-status";
import { createQuoteEmailContent } from "../notifications/create-quote-email-content";

type Transaction = Prisma.TransactionClient;

export class PrismaQuoteRepository implements QuoteRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findDetails(id: string): Promise<QuoteDetails | null> {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      select: {
        id: true,
        workOrderId: true,
        status: true,
        total: true,
        createdAt: true,
        expiresAt: true,
        respondedAt: true,
        workOrder: {
          select: {
            customer: { select: { name: true, document: true } },
            services: { select: { service: { select: { name: true } }, unitPrice: true } },
            parts: {
              select: {
                part: { select: { name: true, sku: true } },
                quantity: true,
                unitPrice: true,
              },
            },
          },
        },
      },
    });
    if (!quote) return null;
    return {
      ...quote,
      status: quote.status as QuoteStatus,
      total: quote.total.toString(),
      workOrder: {
        ...quote.workOrder,
        services: quote.workOrder.services.map(({ service, unitPrice }) => ({
          service,
          unitPrice: unitPrice.toString(),
        })),
        parts: quote.workOrder.parts.map(({ part, quantity, unitPrice }) => ({
          part,
          quantity,
          unitPrice: unitPrice.toString(),
        })),
      },
    };
  }

  async send(input: SendQuoteInput) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.workOrder.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          status: true,
          customer: { select: { name: true, email: true } },
          quote: { select: { id: true, status: true, total: true } },
        },
      });
      if (!order) throw new QuoteNotFoundError();
      if (
        order.status !== WorkOrderStatus.EM_DIAGNOSTICO ||
        !order.quote ||
        order.quote.status !== QuoteStatus.PREPARED
      ) {
        throw new QuoteNotReadyToSendError();
      }

      const updated = await tx.quote.updateMany({
        where: { id: order.quote.id, status: QuoteStatus.PREPARED },
        data: {
          status: QuoteStatus.PENDING,
          tokenHash: input.tokenHash,
          authorizationId: input.authorizationId,
          expiresAt: input.expiresAt,
        },
      });
      if (updated.count !== 1)
        throw new QuoteDecisionConflictError("O orçamento já foi disponibilizado");

      const moved = await tx.workOrder.updateMany({
        where: { id: order.id, status: WorkOrderStatus.EM_DIAGNOSTICO },
        data: { status: WorkOrderStatus.AGUARDANDO_APROVACAO },
      });
      if (moved.count !== 1) throw new QuoteConcurrentUpdateError();

      const decisionUrl = `${input.publicApiUrl}/api/public/quotes/${order.quote.id}#${input.token}`;
      const emailContent = createQuoteEmailContent({
        customerName: order.customer.name,
        total: order.quote.total.toString(),
        decisionUrl,
        expiresAt: input.expiresAt,
        timeZone: env.APP_TIME_ZONE,
      });
      await queueNotification(tx, {
        recipient: order.customer.email,
        subject: `Orçamento para ordem de serviço`,
        text: emailContent.text,
        html: emailContent.html,
      });
      return {
        id: order.quote.id,
        status: QuoteStatus.PENDING,
        total: order.quote.total.toString(),
        expiresAt: input.expiresAt,
      };
    });
  }

  async decide(input: DecideQuoteInput): Promise<QuoteDecisionResult> {
    return this.prisma.$transaction(async (tx) => this.decideWithinTransaction(tx, input));
  }

  private async decideWithinTransaction(tx: Transaction, input: DecideQuoteInput) {
    const quote = await tx.quote.findUnique({
      where: { id: input.id },
      select: {
        id: true,
        workOrderId: true,
        status: true,
        tokenHash: true,
        authorizationId: true,
        expiresAt: true,
      },
    });
    if (!quote || quote.tokenHash !== input.tokenHash) {
      throw new InvalidQuoteAuthorizationError();
    }
    if (!quote.expiresAt || !quote.authorizationId) {
      throw new QuoteDecisionConflictError();
    }
    const nextQuoteStatus = decideQuoteStatus(quote.status as QuoteStatus, input.decision);
    if (quote.expiresAt <= input.now) {
      await this.expireQuote(
        tx,
        quote.id,
        input.tokenHash,
        quote.workOrderId,
        quote.status as QuoteStatus,
      );
      return { expired: true as const };
    }

    const changed = await tx.quote.updateMany({
      where: {
        id: quote.id,
        status: QuoteStatus.PENDING,
        tokenHash: input.tokenHash,
        expiresAt: { gt: input.now },
      },
      data: { status: nextQuoteStatus, respondedAt: input.now },
    });
    if (changed.count !== 1)
      throw new QuoteDecisionConflictError("O orçamento já recebeu uma decisão");

    const order = await tx.workOrder.findUnique({
      where: { id: quote.workOrderId },
      select: { id: true, status: true },
    });
    if (order?.status !== WorkOrderStatus.AGUARDANDO_APROVACAO) {
      throw new QuoteOrderConflictError();
    }
    if (input.decision === QuoteStatus.APPROVED) {
      await this.consumeOrderParts(tx, order.id);
    }
    const workOrderStatus = workOrderStatusForQuoteDecision(input.decision);
    const updated = await tx.workOrder.updateMany({
      where: { id: order.id, status: WorkOrderStatus.AGUARDANDO_APROVACAO },
      data: {
        status: workOrderStatus,
        ...(workOrderStatus === WorkOrderStatus.EM_EXECUCAO && { startedAt: input.now }),
      },
    });
    if (updated.count !== 1) throw new QuoteConcurrentUpdateError();
    return {
      expired: false as const,
      authorizationId: quote.authorizationId,
      decision: input.decision,
      decidedAt: input.now,
      workOrderStatus,
    };
  }

  private async consumeOrderParts(tx: Transaction, workOrderId: string) {
    const parts = await tx.workOrderPart.findMany({
      where: { workOrderId },
      select: { partId: true, quantity: true },
      orderBy: { partId: "asc" },
    });

    for (const part of parts) {
      const updated = await tx.part.updateMany({
        where: {
          id: part.partId,
          stockQuantity: { gte: part.quantity },
        },
        data: { stockQuantity: { decrement: part.quantity } },
      });

      if (updated.count !== 1) throw new WorkOrderInsufficientPartStockError();
    }
  }

  private async expireQuote(
    tx: Transaction,
    quoteId: string,
    tokenHash: string,
    workOrderId: string,
    currentStatus: QuoteStatus,
  ) {
    const expired = await tx.quote.updateMany({
      where: { id: quoteId, status: QuoteStatus.PENDING, tokenHash },
      data: { status: expireQuoteStatus(currentStatus) },
    });
    if (expired.count !== 1) return;

    await tx.workOrder.updateMany({
      where: { id: workOrderId, status: WorkOrderStatus.AGUARDANDO_APROVACAO },
      data: { status: WorkOrderStatus.CANCELADA },
    });
  }
}
