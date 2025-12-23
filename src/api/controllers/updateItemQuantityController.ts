import { Request, Response, NextFunction } from "express";
import { InvalidItemQuantityError } from "../../errors/CartErrors";
import cartClient from "../cartClient";
import { mapBasketToResponse } from "./mapBasketToResponse";

/**
 * Update item quantity, relying on the client to drop items when quantity hits zero.
 */
export function updateItemQuantity(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const quantity = Number(req.body?.quantity);
    if (Number.isNaN(quantity)) {
      throw new InvalidItemQuantityError(
        "Invalid quantity. It must be greater than zero"
      );
    }
    const basket = cartClient.updateItemQuantity(
      req.params.cartId,
      req.params.itemId,
      quantity
    );
    res.json(mapBasketToResponse(basket));
  } catch (err) {
    next(err);
  }
}
