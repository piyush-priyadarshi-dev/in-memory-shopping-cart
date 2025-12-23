import { Request, Response, NextFunction } from 'express';
import {
  BasketExpiredError,
  BasketNotFoundError,
  InvalidItemQuantityError,
  ItemNotFoundError
} from '../../errors/CartErrors';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof BasketNotFoundError || err instanceof BasketExpiredError) {
    return res.status(404).json({
      error: 'CART_NOT_FOUND',
      message: 'Cart not found or expired'
    });
  }

  if (err instanceof InvalidItemQuantityError) {
    return res.status(400).json({
      error: 'INVALID_QUANTITY',
      message: 'Invalid quantity. It must be greater than zero'
    });
  }

  if (err instanceof ItemNotFoundError) {
    return res.status(404).json({
      error: 'ITEM_NOT_FOUND',
      message: 'Item does not exists in the cart'
    });
  }

  console.error(err);
  return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Unexpected error' });
}

export function handleJsonSyntaxError(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof SyntaxError) {
    return res.status(400).json({
      error: 'INVALID_REQUEST',
      message: 'Malformed JSON payload'
    });
  }
  next(err);
}
