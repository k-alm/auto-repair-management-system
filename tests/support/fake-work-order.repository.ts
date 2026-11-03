import { QuoteStatus } from "@/modules/quotes/domain/quote-status";
import type {
  CreateWorkOrderData,
  WorkOrderDetails,
  WorkOrderPage,
  WorkOrderRepository,
} from "@/modules/work-orders/domain/work-order.repository";
import { WorkOrderStatus } from "@/modules/work-orders/domain/work-order-status";

export class FakeWorkOrderRepository implements WorkOrderRepository {
  readonly orderId = "00000000-0000-4000-8000-000000000001";
  createdInput: CreateWorkOrderData | null = null;
  details: WorkOrderDetails | null = null;
  transitionResult = {
    id: this.orderId,
    from: WorkOrderStatus.RECEBIDA,
    status: WorkOrderStatus.EM_DIAGNOSTICO,
  };

  async create(input: CreateWorkOrderData) {
    this.createdInput = input;
    return {
      id: this.orderId,
      status: WorkOrderStatus.RECEBIDA,
      createdAt: new Date("2026-01-01T10:00:00Z"),
      quote: {
        id: "00000000-0000-4000-8000-000000000002",
        status: QuoteStatus.PREPARED,
        total: "25.00",
      },
    };
  }

  async list(_input: {
    skip: number;
    take: number;
    status?: WorkOrderStatus;
  }): Promise<WorkOrderPage> {
    return { items: [], total: 0 };
  }

  async findById() {
    return this.details;
  }

  async transition(input: { id: string; to: WorkOrderStatus; now: Date }) {
    return { ...this.transitionResult, id: input.id, status: input.to };
  }
}
