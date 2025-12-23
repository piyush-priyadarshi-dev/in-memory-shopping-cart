import { Request, Response, NextFunction } from "express";
import cartClient from "../cartClient";
import { mapBasketToResponse } from "./mapBasketToResponse";

/**
 * Drop item from basket and recalculate basket totals.
 */
export function removeItem(req: Request, res: Response, next: NextFunction) {
  try {
    const basket = cartClient.removeItem(req.params.cartId, req.params.itemId);
    res.json(mapBasketToResponse(basket));
  } catch (err) {
    next(err);
  }
}
