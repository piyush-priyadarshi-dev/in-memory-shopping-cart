// Basket id does not exist in the in-memory store.
export class BasketNotFoundError extends Error {
  constructor(message = "Basket not found") {
    super(message);
    this.name = "BasketNotFoundError";
  }
}

// Basket exists but has exceeded its expiry window.
export class BasketExpiredError extends Error {
  constructor(message = "Basket expired") {
    super(message);
    this.name = "BasketExpiredError";
  }
}

// Quantity validation failed (zero or negative).
export class InvalidItemQuantityError extends Error {
  constructor(message = "Invalid quantity") {
    super(message);
    this.name = "InvalidItemQuantityError";
  }
}

// Item id not present within the basket.
export class ItemNotFoundError extends Error {
  constructor(message = "Item not found") {
    super(message);
    this.name = "ItemNotFoundError";
  }
}
