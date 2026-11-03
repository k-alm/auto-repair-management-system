import { describe, expect, it } from "vitest";
import { createQuoteEmailContent } from "@/modules/quotes/infrastructure/notifications/create-quote-email-content";

describe("createQuoteEmailContent", () => {
  it("formats a two-digit day and month in both email bodies", () => {
    const email = createQuoteEmailContent({
      customerName: "Ana",
      total: "125.00",
      decisionUrl: "https://example.test/quote",
      expiresAt: new Date("2026-11-05T12:00:00.000Z"),
      timeZone: "America/Sao_Paulo",
    });

    expect(email.text).toContain("Válido até 05-11-2026.");
    expect(email.html).toContain("Link válido até 05-11-2026");
  });

  it("pads single-digit days and months", () => {
    const email = createQuoteEmailContent({
      customerName: "Ana",
      total: "125.00",
      decisionUrl: "https://example.test/quote",
      expiresAt: new Date("2026-01-05T12:00:00.000Z"),
      timeZone: "America/Sao_Paulo",
    });

    expect(email.text).toContain("Válido até 05-01-2026.");
    expect(email.html).toContain("Link válido até 05-01-2026");
  });

  it("formats the calendar day in the configured timezone", () => {
    const email = createQuoteEmailContent({
      customerName: "Ana",
      total: "125.00",
      decisionUrl: "https://example.test/quote",
      expiresAt: new Date("2026-02-05T01:00:00.000Z"),
      timeZone: "America/Sao_Paulo",
    });

    expect(email.text).toContain("Válido até 04-02-2026.");
    expect(email.html).toContain("Link válido até 04-02-2026");
  });

  it("escapes customer-controlled markup", () => {
    const email = createQuoteEmailContent({
      customerName: "<script>alert(1)</script>",
      total: "125.00",
      decisionUrl: "https://example.test/quote",
      expiresAt: new Date("2026-11-05T12:00:00.000Z"),
      timeZone: "America/Sao_Paulo",
    });

    expect(email.html).not.toContain("<script>");
    expect(email.text).toContain("<script>alert(1)</script>");
  });
});
