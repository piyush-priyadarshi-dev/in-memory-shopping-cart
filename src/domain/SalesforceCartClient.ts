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
import { logger } from "../utils/logger";

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

/**
 * In-memory Shopping Cart with sliding expiry.
 */
export class SalesforceCartClient implements SalesforceCartClientInterface {
  private baskets = new Map<string, Basket>();
  private expiryMs: number;

  // To make cart expiry configurable. Also used for unit testing
  constructor(expiryMs: number = FIFTEEN_MINUTES_MS) {
    this.expiryMs = expiryMs;
  }

  /**
   * Allocates a new empty basket with zeroed totals and starts its sliding expiry timer.
   * @returns newly created basket state
   */
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

  /**
   * Retrieves a basket by id and refreshes its expiry window.
   * @param basketId basket identifier to fetch
   * @throws BasketNotFoundError when the id is unknown
   * @throws BasketExpiredError when the basket has expired
   */
  getBasket(basketId: string): Basket {
    const basket = this.ensureBasketAvailable(basketId);
    this.updateBasketAccessedAt(basket);
    return basket;
  }

  /**
   * Does all the validation, adds item to the cart and calculate the cart total.
   * @param basketId basket identifier to mutate
   * @param sku product SKU being added
   * @param quantity number of units to add (must be > 0)
   * @throws InvalidItemQuantityError when quantity is non-positive
   * @throws BasketNotFoundError | BasketExpiredError when the basket cannot be used
   */
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

  /**
   * Updates quantity for a specific basket item; quantity zero removes it.
   * @param basketId basket identifier to mutate
   * @param itemId id of the item inside the basket
   * @param quantity desired quantity (0 removes, >0 updates)
   * @throws InvalidItemQuantityError when quantity is negative
   * @throws ItemNotFoundError when the item does not exist
   * @throws BasketNotFoundError | BasketExpiredError when the basket cannot be used
   */
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

  /**
   * Removes an item from the basket, recalculating totals and expiry touch.
   * @param basketId basket identifier to mutate
   * @param itemId id of the item inside the basket
   * @throws ItemNotFoundError when the item does not exist
   * @throws BasketNotFoundError | BasketExpiredError when the basket cannot be used
   */
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
      logger.info("Deleted expired basket", { basketId });
      throw new BasketExpiredError(`Basket ${basketId} is expired`);
    }

    return basket;
  }

  // Returns true if the cart is expired and cannot be used anymore
  private isExpired(basket: Basket): boolean {
    return Date.now() - basket.lastAccessedAt > this.expiryMs;
  }

  // To increase the lifetime of basket
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
