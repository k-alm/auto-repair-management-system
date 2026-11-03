import { escapeHtml } from "@/shared/domain/html";
import { formatQuoteExpirationDate } from "./format-quote-expiration-date";

export function createQuoteEmailContent(input: {
  customerName: string;
  total: string;
  decisionUrl: string;
  expiresAt: Date;
  timeZone: string;
}) {
  const expirationDate = formatQuoteExpirationDate(input.expiresAt, input.timeZone);

  return {
    text: `Olá, ${input.customerName}. Total do orçamento: R$ ${input.total}. Para aprovar ou rejeitar, acesse o link individual ${input.decisionUrl}. Válido até ${expirationDate}.`,
    html: `<p>Olá, ${escapeHtml(input.customerName)}.</p><p>Total do orçamento: <strong>R$ ${input.total}</strong></p><p><a href="${input.decisionUrl}">Aprovar ou rejeitar orçamento</a></p><p>Link válido até ${expirationDate} e utilizável uma única vez.</p>`,
  };
}
