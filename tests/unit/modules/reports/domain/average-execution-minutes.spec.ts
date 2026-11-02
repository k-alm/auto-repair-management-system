import { describe, expect, it } from "vitest";
import { averageExecutionMinutes } from "@/modules/reports/domain/average-execution-minutes";

describe("averageExecutionMinutes", () => {
  it("returns null when there are no durations", () => {
    expect(averageExecutionMinutes([])).toBeNull();
  });

  it("returns the rounded average duration", () => {
    expect(averageExecutionMinutes([10, 21])).toBe(16);
  });
});
