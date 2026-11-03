import { describe, expect, it } from "vitest";
import {
  assertWorkOrderTransition,
  calculateQuoteTotal,
  workOrderStatuses,
} from "@/modules/work-orders/domain/work-order-rules";
import { WorkOrderStatus } from "@/modules/work-orders/domain/work-order-status";
import { ConflictError } from "@/shared/domain/errors";

describe("Work order rules", () => {
  it("supports the defined workflow statuses", () => {
    expect(workOrderStatuses).toContain(WorkOrderStatus.EM_EXECUCAO);
  });

  it("allows valid transitions", () => {
    expect(() =>
      assertWorkOrderTransition(WorkOrderStatus.RECEBIDA, WorkOrderStatus.EM_DIAGNOSTICO),
    ).not.toThrow();
  });

  it("rejects invalid and unknown transitions", () => {
    expect(() =>
      assertWorkOrderTransition(WorkOrderStatus.ENTREGUE, WorkOrderStatus.RECEBIDA),
    ).toThrow(ConflictError);
    expect(() => assertWorkOrderTransition("UNKNOWN", WorkOrderStatus.RECEBIDA)).toThrow(
      ConflictError,
    );
  });

  it("calculates service and quantity-based part totals exactly in cents", () => {
    expect(calculateQuoteTotal([{ price: "100.25" }], [{ price: "10.10", quantity: 3 }])).toBe(
      "130.55",
    );
  });
});
