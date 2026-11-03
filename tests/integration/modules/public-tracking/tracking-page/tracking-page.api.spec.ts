import { afterEach, describe, expect, it } from "vitest";
import { createTrackingApiTestApp } from "../support/create-tracking-api-test-app";

describe("GET /api/public/work-orders/:id/track", () => {
  let close: (() => Promise<void>) | undefined;
  afterEach(async () => close?.());

  it("returns a no-store page protected by a nonce content policy", async () => {
    const { app } = await createTrackingApiTestApp();
    close = () => app.close();
    const response = await app.inject({
      method: "GET",
      url: "/api/public/work-orders/00000000-0000-4000-8000-000000000030/track",
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.headers["content-security-policy"]).toContain("nonce-");
  });
});
