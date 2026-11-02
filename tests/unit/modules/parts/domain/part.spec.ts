import { describe, expect, it } from "vitest";
import { Part } from "@/modules/parts/domain/entities/part";
import { InvalidPartPriceError } from "@/modules/parts/domain/part.errors";

describe("Part", () => {
  it("normalizes SKU and monetary precision", () => {
    const part = Part.create({
      name: "Filtro",
      description: null,
      sku: " FLT-1 ",
      price: "12.5",
      isActive: true,
    });

    expect(part.props.sku).toBe("FLT-1");
    expect(part.props.price).toBe("12.5");
  });

  it("rejects negative prices", () => {
    expect(() =>
      Part.create({
        name: "Filtro",
        description: null,
        sku: "FLT-2",
        price: "-1",
        isActive: true,
      }),
    ).toThrow(InvalidPartPriceError);
  });
});
