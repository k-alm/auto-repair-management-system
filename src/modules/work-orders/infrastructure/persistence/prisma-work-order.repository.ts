import { Prisma, type PrismaClient } from "@prisma/client";
import { QuoteStatus } from "@/modules/quotes/domain/quote-status";
import { escapeHtml } from "@/shared/domain/html";
import { queueNotification } from "@/shared/infrastructure/queue-notification";
import {
  WorkOrderCatalogItemUnavailableError,
  WorkOrderConcurrentUpdateError,
  WorkOrderCustomerNotFoundError,
  WorkOrderInsufficientPartStockError,
  WorkOrderNotFoundError,
  WorkOrderVehicleOwnershipError,
} from "../../domain/work-order.errors";
import type {
  CreateWorkOrderData,
  WorkOrderDetails,
  WorkOrderPage,
  WorkOrderRepository,
} from "../../domain/work-order.repository";
import { calculateQuoteTotal } from "../../domain/work-order-rules";
import { WorkOrderStatus } from "../../domain/work-order-status";

export class PrismaWorkOrderRepository implements WorkOrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateWorkOrderData) {
    return this.prisma.$transaction(
      async (tx) => {
        const customer = await tx.customer.findFirst({
          where: { document: input.customerDocument, deletedAt: null },
          select: { id: true, name: true, email: true },
        });
        if (!customer) throw new WorkOrderCustomerNotFoundError();

        const vehicle = await tx.vehicle.findFirst({
          where: { id: input.vehicleId, customerId: customer.id, deletedAt: null },
          select: { id: true },
        });
        if (!vehicle) throw new WorkOrderVehicleOwnershipError();

        const [services, parts] = await Promise.all([
          tx.service.findMany({
            where: { id: { in: input.serviceIds }, isActive: true, deletedAt: null },
            select: { id: true, price: true },
          }),
          tx.part.findMany({
            where: {
              id: { in: input.parts.map(({ partId }) => partId) },
              isActive: true,
              deletedAt: null,
            },
            select: { id: true, price: true, stockQuantity: true },
          }),
        ]);
        if (services.length !== input.serviceIds.length) {
          throw new WorkOrderCatalogItemUnavailableError("Serviço");
        }
        if (parts.length !== input.parts.length) {
          throw new WorkOrderCatalogItemUnavailableError("Peça");
        }
        const quantities = new Map(input.parts.map((part) => [part.partId, part.quantity]));
        if (parts.some((part) => part.stockQuantity < (quantities.get(part.id) ?? 0))) {
          throw new WorkOrderInsufficientPartStockError();
        }

        const order = await tx.workOrder.create({
          data: {
            customerId: customer.id,
            vehicleId: vehicle.id,
            trackingTokenHash: input.trackingTokenHash,
            trackingTokenExpiresAt: input.trackingTokenExpiresAt,
          },
          select: { id: true, status: true, createdAt: true },
        });

        await tx.workOrderService.createMany({
          data: services.map((service) => ({
            workOrderId: order.id,
            serviceId: service.id,
            unitPrice: service.price,
          })),
        });
        await tx.workOrderPart.createMany({
          data: parts.map((part) => ({
            workOrderId: order.id,
            partId: part.id,
            quantity: quantities.get(part.id) ?? 0,
            unitPrice: part.price,
          })),
        });

        const total = new Prisma.Decimal(
          calculateQuoteTotal(
            services.map(({ price }) => ({ price: price.toString() })),
            parts.map(({ id, price }) => ({
              price: price.toString(),
              quantity: quantities.get(id) ?? 0,
            })),
          ),
        );
        const quote = await tx.quote.create({
          data: { workOrderId: order.id, total, status: QuoteStatus.PREPARED },
          select: { id: true, status: true, total: true },
        });
        const trackingLink = `${input.publicApiUrl}/api/public/work-orders/${order.id}/track#${input.trackingToken}`;
        await queueNotification(tx, {
          recipient: customer.email,
          subject: `Acompanhamento de ordem de serviço`,
          text: `Olá, ${customer.name}. Acompanhe sua ordem de serviço neste link pessoal: ${trackingLink}`,
          html: `<p>Olá, ${escapeHtml(customer.name)}.</p><p><a href="${trackingLink}">Acompanhar ordem de serviço</a></p><p>Esse link é pessoal. Não o compartilhe.</p>`,
        });

        return {
          ...order,
          quote: {
            ...quote,
            status: quote.status as QuoteStatus,
            total: quote.total.toString(),
          },
          status: order.status as WorkOrderStatus,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async list(input: {
    skip: number;
    take: number;
    status?: WorkOrderStatus;
  }): Promise<WorkOrderPage> {
    const where = { ...(input.status && { status: input.status }) };
    const [records, total] = await this.prisma.$transaction([
      this.prisma.workOrder.findMany({
        where,
        select: {
          id: true,
          status: true,
          createdAt: true,
          customer: { select: { id: true, name: true } },
          vehicle: { select: { id: true, plate: true, brand: true, model: true } },
          quote: { select: { id: true, status: true, total: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: input.skip,
        take: input.take,
      }),
      this.prisma.workOrder.count({ where }),
    ]);
    return {
      items: records.map((record) => ({
        ...record,
        status: record.status as WorkOrderStatus,
        quote: record.quote
          ? {
              ...record.quote,
              status: record.quote.status as QuoteStatus,
              total: record.quote.total.toString(),
            }
          : null,
      })),
      total,
    };
  }

  async findById(id: string): Promise<WorkOrderDetails | null> {
    const order = await this.prisma.workOrder.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        createdAt: true,
        startedAt: true,
        finishedAt: true,
        customer: { select: { id: true, name: true, document: true, email: true, phone: true } },
        vehicle: { select: { id: true, plate: true, brand: true, model: true, year: true } },
        services: { select: { service: { select: { id: true, name: true } }, unitPrice: true } },
        parts: {
          select: {
            part: { select: { id: true, name: true, sku: true } },
            quantity: true,
            unitPrice: true,
          },
        },
        quote: {
          select: { id: true, status: true, total: true, expiresAt: true, respondedAt: true },
        },
      },
    });
    if (!order) return null;
    return {
      ...order,
      status: order.status as WorkOrderStatus,
      services: order.services.map(({ service, unitPrice }) => ({
        service,
        unitPrice: unitPrice.toString(),
      })),
      parts: order.parts.map(({ part, quantity, unitPrice }) => ({
        part,
        quantity,
        unitPrice: unitPrice.toString(),
      })),
      quote: order.quote
        ? {
            ...order.quote,
            status: order.quote.status as QuoteStatus,
            total: order.quote.total.toString(),
          }
        : null,
    };
  }

  async transition(input: { id: string; to: WorkOrderStatus; now: Date }) {
    const order = await this.prisma.workOrder.findUnique({
      where: { id: input.id },
      select: { id: true, status: true },
    });
    if (!order) throw new WorkOrderNotFoundError();
    const result = await this.prisma.workOrder.updateMany({
      where: { id: input.id, status: order.status },
      data: {
        status: input.to,
        ...(input.to === WorkOrderStatus.FINALIZADA && { finishedAt: input.now }),
      },
    });
    if (result.count !== 1) throw new WorkOrderConcurrentUpdateError();
    return {
      id: order.id,
      from: order.status as WorkOrderStatus,
      status: input.to,
    };
  }
}
