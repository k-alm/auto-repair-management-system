import { afterEach, describe, expect, it } from "vitest";
import { createQuoteApiTestApp } from "../support/create-quote-api-test-app";

describe("GET /api/public/quotes/:id", () => {
  let close: (() => Promise<void>) | undefined;
  afterEach(async () => close?.());

  it("returns a no-store approval page with a nonce policy", async () => {
    const { app } = await createQuoteApiTestApp();
    close = () => app.close();
    const response = await app.inject({
      method: "GET",
      url: "/api/public/quotes/00000000-0000-4000-8000-000000000020",
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.headers["content-security-policy"]).toContain("nonce-");
  });
});
