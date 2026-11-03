import { afterEach, describe, expect, it } from "vitest";
import { createCatalogApiTestApp } from "../support/create-catalog-api-test-app";

describe("Part stock endpoints", () => {
  let close: (() => Promise<void>) | undefined;
  afterEach(async () => close?.());

  it("updates and receives stock, returning the available balance", async () => {
    const { app } = await createCatalogApiTestApp();
    close = () => app.close();

    const created = await app.inject({
      method: "POST",
      url: "/api/parts",
      payload: {
        name: "Pastilha de freio",
        sku: "BRK-1",
        price: "120.00",
        stockQuantity: 4,
      },
    });
    const partId = created.json().id as string;

    const adjusted = await app.inject({
      method: "PATCH",
      url: `/api/parts/${partId}/stock`,
      payload: { stockQuantity: 2 },
    });
    expect(adjusted.statusCode).toBe(200);
    expect(adjusted.json()).toHaveProperty("stockQuantity", 2);

    const received = await app.inject({
      method: "POST",
      url: `/api/parts/${partId}/stock/entries`,
      payload: { quantity: 3 },
    });
    expect(received.statusCode).toBe(200);
    expect(received.json()).toHaveProperty("stockQuantity", 5);
  });

  it("rejects negative balances and zero-value entries", async () => {
    const { app } = await createCatalogApiTestApp();
    close = () => app.close();

    const negativeBalance = await app.inject({
      method: "PATCH",
      url: "/api/parts/00000000-0000-4000-8000-000000000001/stock",
      payload: { stockQuantity: -1 },
    });
    expect(negativeBalance.statusCode).toBe(422);

    const zeroEntry = await app.inject({
      method: "POST",
      url: "/api/parts/00000000-0000-4000-8000-000000000001/stock/entries",
      payload: { quantity: 0 },
    });
    expect(zeroEntry.statusCode).toBe(422);
  });
});
