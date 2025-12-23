export const ERROR_CODES = {
  CART_NOT_FOUND: 'CART_NOT_FOUND',
  INVALID_QUANTITY: 'INVALID_QUANTITY',
  ITEM_NOT_FOUND: 'ITEM_NOT_FOUND',
  INVALID_REQUEST: 'INVALID_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
} as const;

export const ERROR_MESSAGES = {
  CART_NOT_FOUND: 'Cart not found or expired',
  INVALID_QUANTITY: 'Invalid quantity. It must be greater than zero',
  ITEM_NOT_FOUND: 'Item does not exists in the cart',
  INVALID_REQUEST: 'Invalid request payload',
  UNAUTHORIZED: 'Invalid API key',
  RATE_LIMIT_EXCEEDED: 'Too many requests'
} as const;
