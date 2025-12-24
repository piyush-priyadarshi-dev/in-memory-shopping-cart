import { SalesforceCartClient } from "../src/domain/SalesforceCartClient";
import {
  BasketExpiredError,
  InvalidItemQuantityError,
  ItemNotFoundError,
} from "../src/errors/CartErrors";

describe("SalesforceCartClient", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("creates empty basket with totals", () => {
    const client = new SalesforceCartClient();
    const basket = client.createBasket();

    expect(basket.items).toEqual([]);
    expect(basket.totals).toEqual({ subtotal: 0, itemCount: 0 });
  });

  it("adds and aggregates items by sku", () => {
    const client = new SalesforceCartClient();
    const basket = client.createBasket();

    const updated = client.addItem(basket.id, "ITEM_1", 2);
    const updatedAgain = client.addItem(basket.id, "ITEM_1", 1);

    expect(updatedAgain.items[0]).toMatchObject({
      sku: "ITEM_1",
      quantity: 3,
      totalPrice: 30,
    });
    expect(updatedAgain.totals).toEqual({ subtotal: 30, itemCount: 3 });
  });

  it("updates quantity and removes when zero", () => {
    const client = new SalesforceCartClient();
    const basket = client.createBasket();
    const withItem = client.addItem(basket.id, "ITEM_2", 1);
    const itemId = withItem.items[0].id;

    const updated = client.updateItemQuantity(basket.id, itemId, 3);
    expect(updated.items[0].quantity).toBe(3);

    const removed = client.updateItemQuantity(basket.id, itemId, 0);
    expect(removed.items).toHaveLength(0);
    expect(removed.totals).toEqual({ subtotal: 0, itemCount: 0 });
  });

  it("throws on invalid quantity", () => {
    const client = new SalesforceCartClient();
    const basket = client.createBasket();
    expect(() => client.addItem(basket.id, "ITEM_3", 0)).toThrow(
      InvalidItemQuantityError
    );
  });

  it("expires basket after inactivity using timers", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-01-01T00:00:00Z"));
    const client = new SalesforceCartClient(1000);
    const basket = client.createBasket();

    jest.advanceTimersByTime(1500);

    expect(() => client.getBasket(basket.id)).toThrow(BasketExpiredError);
  });

  it("extends expiry on access (sliding window)", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-01-01T00:00:00Z"));
    const client = new SalesforceCartClient(1000);
    const basket = client.createBasket();

    jest.advanceTimersByTime(800); // t=800
    expect(client.getBasket(basket.id)).toBeDefined(); // resets lastAccessedAt to 800

    jest.advanceTimersByTime(800); // t=1600, 800ms since last access -> should still be valid
    expect(client.getBasket(basket.id)).toBeDefined();

    jest.advanceTimersByTime(1200); // t=2800, 1200ms since last access -> should expire
    expect(() => client.getBasket(basket.id)).toThrow(BasketExpiredError);
  });

  it("throws when item not found", () => {
    const client = new SalesforceCartClient();
    const basket = client.createBasket();
    expect(() => client.removeItem(basket.id, "missing")).toThrow(
      ItemNotFoundError
    );
  });
});
