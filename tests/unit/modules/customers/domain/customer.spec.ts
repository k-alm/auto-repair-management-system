import { describe, expect, it } from "vitest";
import { Customer } from "@/modules/customers/domain/entities/customer";

describe("Customer", () => {
  it("normalizes fields when creating a customer", () => {
    const customer = Customer.create({
      name: "  Ana Silva ",
      document: "529.982.247-25",
      email: "  ANA@EXAMPLE.COM ",
      phone: " (11) 99999-9999 ",
    });

    expect(customer.name).toBe("Ana Silva");
    expect(customer.document).toBe("52998224725");
    expect(customer.email).toBe("ana@example.com");
    expect(customer.phone).toBe("(11) 99999-9999");
    expect(customer.id).toBeTruthy();
  });
});
