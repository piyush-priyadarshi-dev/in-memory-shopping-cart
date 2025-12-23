import { v4 as uuid } from "uuid";
import {
  Basket,
  BasketItem,
  SalesforceCartClient as SalesforceCartClientInterface,
} from "./types";
import {
  BasketExpiredError,
  BasketNotFoundError,
  InvalidItemQuantityError,
  ItemNotFoundError,
} from "../errors/CartErrors";
import { getUnitPriceForSku } from "./pricing";

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

export class SalesforceCartClient implements SalesforceCartClientInterface {
  private baskets = new Map<string, Basket>();
  private expiryMs: number;

  constructor(expiryMs: number = FIFTEEN_MINUTES_MS) {
    this.expiryMs = expiryMs;
  }

  createBasket(): Basket {
    const now = Date.now();
    const basket: Basket = {
      id: uuid(),
      items: [],
      totals: { subtotal: 0, itemCount: 0 },
      createdAt: now,
      lastAccessedAt: now,
    };
    this.baskets.set(basket.id, basket);
    return basket;
  }

  getBasket(basketId: string): Basket {
    const basket = this.ensureBasketAvailable(basketId);
    this.updateBasketAccessedAt(basket);
    return basket;
  }

  addItem(basketId: string, sku: string, quantity: number): Basket {
    if (quantity <= 0) {
      throw new InvalidItemQuantityError("Quantity must be greater than zero");
    }
    const basket = this.ensureBasketAvailable(basketId);
    const unitPrice = getUnitPriceForSku(sku);
    const existing = basket.items.find((item) => item.sku === sku);

    if (existing) {
      existing.quantity += quantity;
      existing.totalPrice = existing.quantity * existing.unitPrice;
    } else {
      const newItem: BasketItem = {
        id: uuid(),
        sku,
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity,
      };
      basket.items.push(newItem);
    }

    basket.totals = this.calculateTotals(basket);
    this.updateBasketAccessedAt(basket);
    return basket;
  }

  updateItemQuantity(
    basketId: string,
    itemId: string,
    quantity: number
  ): Basket {
    if (quantity < 0) {
      throw new InvalidItemQuantityError("Quantity must be greater than zero");
    }
    const basket = this.ensureBasketAvailable(basketId);
    const item = basket.items.find((i) => i.id === itemId);
    if (!item) {
      throw new ItemNotFoundError("Item does not exist in the basket");
    }

    if (quantity === 0) {
      basket.items = basket.items.filter((i) => i.id !== itemId);
    } else {
      item.quantity = quantity;
      item.totalPrice = item.quantity * item.unitPrice;
    }

    basket.totals = this.calculateTotals(basket);
    this.updateBasketAccessedAt(basket);
    return basket;
  }

  removeItem(basketId: string, itemId: string): Basket {
    const basket = this.ensureBasketAvailable(basketId);
    const itemIndex = basket.items.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) {
      throw new ItemNotFoundError("Item does not exist in the basket");
    }

    basket.items.splice(itemIndex, 1);
    basket.totals = this.calculateTotals(basket);
    this.updateBasketAccessedAt(basket);
    return basket;
  }

  private ensureBasketAvailable(basketId: string): Basket {
    const basket = this.baskets.get(basketId);
    if (!basket) {
      throw new BasketNotFoundError(`Basket ${basketId} not found`);
    }

    if (this.isExpired(basket)) {
      this.baskets.delete(basketId);
      throw new BasketExpiredError(`Basket ${basketId} is expired`);
    }

    return basket;
  }

  private isExpired(basket: Basket): boolean {
    return Date.now() - basket.lastAccessedAt > this.expiryMs;
  }

  private updateBasketAccessedAt(basket: Basket): void {
    basket.lastAccessedAt = Date.now();
  }

  private calculateTotals(basket: Basket) {
    const subtotal = basket.items.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );
    const itemCount = basket.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    return { subtotal, itemCount };
  }
}
