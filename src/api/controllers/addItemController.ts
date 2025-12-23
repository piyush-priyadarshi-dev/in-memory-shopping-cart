import { Request, Response, NextFunction } from "express";
import { InvalidItemQuantityError } from "../../errors/CartErrors";
import cartClient from "../cartClient";
import { mapBasketToResponse } from "./mapBasketToResponse";

/**
 * Validates quantity and upserts item to the cart via SKU as identifier client.
 */
export function addItem(req: Request, res: Response, next: NextFunction) {
  try {
    const { sku } = req.body;
    const quantity = Number(req.body?.quantity);
    if (
      !sku ||
      typeof sku !== "string" ||
      Number.isNaN(quantity) ||
      quantity <= 0
    ) {
      throw new InvalidItemQuantityError(
        "Invalid quantity. It must be greater than zero"
      );
    }
    const basket = cartClient.addItem(req.params.cartId, sku, quantity);
    res.status(202).json(mapBasketToResponse(basket));
  } catch (err) {
    next(err);
  }
}
