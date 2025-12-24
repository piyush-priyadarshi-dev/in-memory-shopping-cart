import { Request, Response, NextFunction } from "express";
import {
  BasketExpiredError,
  BasketNotFoundError,
  InvalidItemQuantityError,
  ItemNotFoundError,
} from "../../errors/CartErrors";
import { logger } from "../../utils/logger";

/**
 * Central error handler that maps domain errors to HTTP responses and logs them.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof BasketNotFoundError || err instanceof BasketExpiredError) {
    logger.error("Cart missing or expired", {
      path: req.path,
      method: req.method,
    });
    return res.status(404).json({
      error: "CART_NOT_FOUND",
      message: "Cart not found or expired",
    });
  }

  if (err instanceof InvalidItemQuantityError) {
    logger.error("Invalid quantity", { path: req.path, method: req.method });
    return res.status(400).json({
      error: "INVALID_QUANTITY",
      message: "Invalid quantity. It must be greater than zero",
    });
  }

  if (err instanceof ItemNotFoundError) {
    logger.error("Item not found", { path: req.path, method: req.method });
    return res.status(404).json({
      error: "ITEM_NOT_FOUND",
      message: "Item does not exists in the cart",
    });
  }

  logger.error("Unexpected error", { path: req.path, method: req.method, err });
  return res
    .status(500)
    .json({ error: "INTERNAL_SERVER_ERROR", message: "Unexpected error" });
}

/**
 * Handles malformed JSON before reaching API handlers.
 */
export function handleJsonSyntaxError(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof SyntaxError) {
    logger.error("Malformed JSON payload");
    return res.status(400).json({
      error: "INVALID_REQUEST",
      message: "Malformed JSON payload",
    });
  }
  next(err);
}
