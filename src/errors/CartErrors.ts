export class BasketNotFoundError extends Error {
  constructor(message = 'Basket not found') {
    super(message);
    this.name = 'BasketNotFoundError';
  }
}

export class BasketExpiredError extends Error {
  constructor(message = 'Basket expired') {
    super(message);
    this.name = 'BasketExpiredError';
  }
}

export class InvalidItemQuantityError extends Error {
  constructor(message = 'Invalid quantity') {
    super(message);
    this.name = 'InvalidItemQuantityError';
  }
}

export class ItemNotFoundError extends Error {
  constructor(message = 'Item not found') {
    super(message);
    this.name = 'ItemNotFoundError';
  }
}
