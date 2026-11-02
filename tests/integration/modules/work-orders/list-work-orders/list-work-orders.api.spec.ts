import { afterEach, describe, expect, it } from "vitest";
import { createWorkOrderApiTestApp } from "../support/create-work-order-api-test-app";

describe("GET /api/work-orders", () => {
  let close: (() => Promise<void>) | undefined;
  afterEach(async () => close?.());

  it("returns a paginated work order collection", async () => {
    const { app } = await createWorkOrderApiTestApp();
    close = () => app.close();
    const response = await app.inject({
      method: "GET",
      url: "/api/work-orders?page=1&pageSize=10",
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ items: [], page: 1, pageSize: 10, total: 0 });
  });
});
