import { InvalidCustomerDocumentError } from "../errors/customer-errors";

function isRepeatedDigits(value: string) {
  return /^(\d)\1+$/.test(value);
}

function calculateDigit(value: string, weights: number[]) {
  let sum = 0;
  for (const [index, digit] of [...value].entries()) {
    const weight = weights[index % weights.length];
    if (weight === undefined) throw new RangeError("Pesos de validação inválidos");
    sum += Number(digit) * weight;
  }
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

function isValidCpf(document: string) {
  if (document.length !== 11 || isRepeatedDigits(document)) return false;
  const first = calculateDigit(document.slice(0, 9), [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  const second = calculateDigit(
    `${document.slice(0, 9)}${first}`,
    [11, 10, 9, 8, 7, 6, 5, 4, 3, 2],
  );
  return document.endsWith(`${first}${second}`);
}

function isValidCnpj(document: string) {
  if (document.length !== 14 || isRepeatedDigits(document)) return false;
  const first = calculateDigit(document.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6]);
  const second = calculateDigit(`${document.slice(0, 12)}${first}`, [6, 5, 4, 3, 2, 9, 8, 7]);
  return document.endsWith(`${first}${second}`);
}

export class CustomerDocument {
  private constructor(readonly value: string) {}

  static create(input: string) {
    const value = input.replace(/\D/g, "");
    const valid = value.length === 11 ? isValidCpf(value) : isValidCnpj(value);
    if (!valid) throw new InvalidCustomerDocumentError();
    return new CustomerDocument(value);
  }
}
