import request from "supertest";
import app from "../src/api/app";
import cartClient from "../src/api/cartClient";

const apiKey = process.env.API_KEY ?? "dev-api-key";

describe("Cart API", () => {
  afterEach(() => {
    jest.useRealTimers();
    const basketsMap = (cartClient as any).baskets as Map<string, any>;
    basketsMap.clear?.();
  });

  it("creates a cart", async () => {
    const res = await request(app).post("/api/cart").set("x-api-key", apiKey);
    expect(res.status).toBe(201);
    expect(res.body.cartId).toBeDefined();
    expect(res.body.items).toEqual([]);
    expect(res.body.totals).toEqual({ subtotal: 0, itemCount: 0 });
  });

  it("adds item and returns updated cart", async () => {
    const cart = await request(app).post("/api/cart").set("x-api-key", apiKey);
    const res = await request(app)
      .post(`/api/cart/${cart.body.cartId}/items`)
      .set("x-api-key", apiKey)
      .send({ sku: "ITEM_123", quantity: 2 });

    expect(res.status).toBe(202);
    expect(res.body.items[0]).toMatchObject({
      sku: "ITEM_123",
      quantity: 2,
      totalPrice: 20,
    });
    expect(res.body.totals).toEqual({ subtotal: 20, itemCount: 2 });
  });

  it("updates quantity to zero and removes item", async () => {
    const cart = await request(app).post("/api/cart").set("x-api-key", apiKey);
    const addRes = await request(app)
      .post(`/api/cart/${cart.body.cartId}/items`)
      .set("x-api-key", apiKey)
      .send({ sku: "ITEM_ABC", quantity: 1 });

    const itemId = addRes.body.items[0].itemId;
    const updateRes = await request(app)
      .put(`/api/cart/${cart.body.cartId}/items/${itemId}`)
      .set("x-api-key", apiKey)
      .send({ quantity: 0 });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.items).toHaveLength(0);
    expect(updateRes.body.totals).toEqual({ subtotal: 0, itemCount: 0 });
  });

  it("returns validation error for invalid quantity", async () => {
    const cart = await request(app).post("/api/cart").set("x-api-key", apiKey);
    const res = await request(app)
      .post(`/api/cart/${cart.body.cartId}/items`)
      .set("x-api-key", apiKey)
      .send({ sku: "ITEM_123", quantity: -1 });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: "INVALID_QUANTITY",
      message: "Invalid quantity. It must be greater than zero",
    });
  });

  it("returns item not found on delete missing item", async () => {
    const cart = await request(app).post("/api/cart").set("x-api-key", apiKey);
    const res = await request(app)
      .delete(`/api/cart/${cart.body.cartId}/items/nonexistent`)
      .set("x-api-key", apiKey);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("ITEM_NOT_FOUND");
  });

  it("returns cart not found when expired", async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-01-01T00:00:00Z"));
    const originalExpiry = (cartClient as any).expiryMs;
    (cartClient as any).expiryMs = 1000;

    const cart = await request(app).post("/api/cart").set("x-api-key", apiKey);

    jest.advanceTimersByTime(1500);
    const res = await request(app)
      .get(`/api/cart/${cart.body.cartId}`)
      .set("x-api-key", apiKey);
    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: "CART_NOT_FOUND",
      message: "Cart not found or expired",
    });

    (cartClient as any).expiryMs = originalExpiry;
  });
});
