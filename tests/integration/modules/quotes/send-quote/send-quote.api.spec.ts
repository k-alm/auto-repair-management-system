import { afterEach, describe, expect, it } from "vitest";
import { createQuoteApiTestApp } from "../support/create-quote-api-test-app";

describe("POST /api/work-orders/:id/quote/send", () => {
  let close: (() => Promise<void>) | undefined;
  afterEach(async () => close?.());

  it("returns the prepared quote after sending approval", async () => {
    const { app, repository } = await createQuoteApiTestApp();
    close = () => app.close();
    const response = await app.inject({
      method: "POST",
      url: "/api/work-orders/00000000-0000-4000-8000-000000000021/quote/send",
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      id: "00000000-0000-4000-8000-000000000004",
      status: "PENDING",
    });
    expect(repository.sentInput?.publicApiUrl).toBe("https://api.example.com");
  });
});
