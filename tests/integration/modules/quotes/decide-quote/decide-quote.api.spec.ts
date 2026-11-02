import { afterEach, describe, expect, it } from "vitest";
import { createQuoteApiTestApp } from "../support/create-quote-api-test-app";

describe("POST /api/public/quotes/:id/decision", () => {
  let close: (() => Promise<void>) | undefined;
  afterEach(async () => close?.());

  it("passes decision and approval token to the use case", async () => {
    const { app, repository } = await createQuoteApiTestApp();
    close = () => app.close();
    const response = await app.inject({
      method: "POST",
      url: "/api/public/quotes/00000000-0000-4000-8000-000000000020/decision",
      headers: { "x-approval-token": "valid-approval-token" },
      payload: { decision: "APPROVED" },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ decision: "APPROVED", expired: false });
    expect(repository.decideInput).toMatchObject({ tokenHash: "hashed:valid-approval-token" });
  });
});
