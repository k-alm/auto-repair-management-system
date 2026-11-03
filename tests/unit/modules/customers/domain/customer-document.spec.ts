import { describe, expect, it } from "vitest";
import { InvalidCustomerDocumentError } from "@/modules/customers/domain/errors/customer-errors";
import { CustomerDocument } from "@/modules/customers/domain/value-objects/customer-document";

describe("CustomerDocument", () => {
  it("normalizes and accepts a valid CPF", () => {
    expect(CustomerDocument.create("529.982.247-25").value).toBe("52998224725");
  });

  it("accepts a valid CNPJ", () => {
    expect(CustomerDocument.create("11.222.333/0001-81").value).toBe("11222333000181");
  });

  it("rejects repeated digits", () => {
    expect(() => CustomerDocument.create("111.111.111-11")).toThrow(InvalidCustomerDocumentError);
  });

  it("rejects a document with invalid check digits", () => {
    expect(() => CustomerDocument.create("529.982.247-24")).toThrow(InvalidCustomerDocumentError);
  });
});
