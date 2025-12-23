import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import {
  BasketExpiredError,
  BasketNotFoundError,
  InvalidItemQuantityError,
  ItemNotFoundError,
} from "../../errors/CartErrors";
import { logger } from "../../utils/logger";
import { ERROR_CODES, ERROR_MESSAGES } from "../../constants/errors";

/**
 * Central error handler that maps domain errors to HTTP responses and logs them.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    logger.error("Validation failed", {
      path: req.path,
      method: req.method,
      issues: err.issues,
    });
    return res.status(400).json({
      error: ERROR_CODES.INVALID_REQUEST,
      message: ERROR_MESSAGES.INVALID_REQUEST,
    });
  }

  if (err instanceof BasketNotFoundError || err instanceof BasketExpiredError) {
    logger.error("Cart missing or expired", {
      path: req.path,
      method: req.method,
    });
    return res.status(404).json({
      error: ERROR_CODES.CART_NOT_FOUND,
      message: ERROR_MESSAGES.CART_NOT_FOUND,
    });
  }

  if (err instanceof InvalidItemQuantityError) {
    logger.error("Invalid quantity", { path: req.path, method: req.method });
    return res.status(400).json({
      error: ERROR_CODES.INVALID_QUANTITY,
      message: ERROR_MESSAGES.INVALID_QUANTITY,
    });
  }

  if (err instanceof ItemNotFoundError) {
    logger.error("Item not found", { path: req.path, method: req.method });
    return res.status(404).json({
      error: ERROR_CODES.ITEM_NOT_FOUND,
      message: ERROR_MESSAGES.ITEM_NOT_FOUND,
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
      error: ERROR_CODES.INVALID_REQUEST,
      message: ERROR_MESSAGES.INVALID_REQUEST,
    });
  }
  next(err);
}
