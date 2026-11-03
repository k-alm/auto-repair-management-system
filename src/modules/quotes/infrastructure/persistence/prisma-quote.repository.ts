import type { Prisma, PrismaClient } from "@prisma/client";
import { escapeHtml } from "@/shared/domain/html";
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
      if (order.status !== "EM_DIAGNOSTICO" || !order.quote || order.quote.status !== "PREPARED") {
        throw new QuoteNotReadyToSendError();
      }

      const updated = await tx.quote.updateMany({
        where: { id: order.quote.id, status: "PREPARED" },
        data: {
          status: "PENDING",
          tokenHash: input.tokenHash,
          authorizationId: input.authorizationId,
          expiresAt: input.expiresAt,
        },
      });
      if (updated.count !== 1)
        throw new QuoteDecisionConflictError("O orçamento já foi disponibilizado");

      const moved = await tx.workOrder.updateMany({
        where: { id: order.id, status: "EM_DIAGNOSTICO" },
        data: { status: "AGUARDANDO_APROVACAO" },
      });
      if (moved.count !== 1) throw new QuoteConcurrentUpdateError();

      const decisionUrl = `${input.publicApiUrl}/api/public/quotes/${order.quote.id}#${input.token}`;
      await queueNotification(tx, {
        recipient: order.customer.email,
        subject: `Orçamento para ordem de serviço`,
        text: `Olá, ${order.customer.name}. Total do orçamento: R$ ${order.quote.total}. Para aprovar ou rejeitar, acesse o link individual ${decisionUrl}. Válido até ${input.expiresAt.toISOString()}.`,
        html: `<p>Olá, ${escapeHtml(order.customer.name)}.</p><p>Total do orçamento: <strong>R$ ${order.quote.total}</strong></p><p><a href="${decisionUrl}">Aprovar ou rejeitar orçamento</a></p><p>Link válido até ${input.expiresAt.toISOString()} e utilizável uma única vez.</p>`,
      });
      return {
        id: order.quote.id,
        status: "PENDING",
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
    if (quote.status !== "PENDING" || !quote.expiresAt || !quote.authorizationId) {
      throw new QuoteDecisionConflictError();
    }
    if (quote.expiresAt <= input.now) {
      await this.expireQuote(tx, quote.id, input.tokenHash, quote.workOrderId);
      return { expired: true as const };
    }

    const changed = await tx.quote.updateMany({
      where: {
        id: quote.id,
        status: "PENDING",
        tokenHash: input.tokenHash,
        expiresAt: { gt: input.now },
      },
      data: { status: input.decision, respondedAt: input.now },
    });
    if (changed.count !== 1)
      throw new QuoteDecisionConflictError("O orçamento já recebeu uma decisão");

    const order = await tx.workOrder.findUnique({
      where: { id: quote.workOrderId },
      select: { id: true, status: true },
    });
    if (order?.status !== "AGUARDANDO_APROVACAO") throw new QuoteOrderConflictError();

    const workOrderStatus = input.decision === "APPROVED" ? "EM_EXECUCAO" : "CANCELADA";
    const updated = await tx.workOrder.updateMany({
      where: { id: order.id, status: "AGUARDANDO_APROVACAO" },
      data: {
        status: workOrderStatus,
        ...(workOrderStatus === "EM_EXECUCAO" && { startedAt: input.now }),
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

  private async expireQuote(
    tx: Transaction,
    quoteId: string,
    tokenHash: string,
    workOrderId: string,
  ) {
    const expired = await tx.quote.updateMany({
      where: { id: quoteId, status: "PENDING", tokenHash },
      data: { status: "EXPIRED" },
    });
    if (expired.count !== 1) return;

    await tx.workOrder.updateMany({
      where: { id: workOrderId, status: "AGUARDANDO_APROVACAO" },
      data: { status: "CANCELADA" },
    });
  }
}
