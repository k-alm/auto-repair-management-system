import { describe, expect, it } from "vitest";
import { Service } from "@/modules/services/domain/entities/service";

describe("Service", () => {
  it("normalizes names and monetary precision", () => {
    const service = Service.create({
      name: "  Troca de óleo ",
      description: null,
      price: "90",
      estimatedMinutes: 45,
      isActive: true,
    });

    expect(service.props.name).toBe("Troca de óleo");
    expect(service.props.price).toBe("90.00");
  });
});
