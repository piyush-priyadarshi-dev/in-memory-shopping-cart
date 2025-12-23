import { Request, Response, NextFunction } from "express";
import cartClient from "../cartClient";
import { mapBasketToResponse } from "./mapBasketToResponse";

/**
 * Retrieves and returns the current basket if it is available and not expired.
 */
export function getCart(req: Request, res: Response, next: NextFunction) {
  try {
    const basket = cartClient.getBasket(req.params.cartId);
    res.json(mapBasketToResponse(basket));
  } catch (err) {
    next(err);
  }
}
