import { Request, Response, NextFunction } from "express";
import cartClient from "../cartClient";
import { mapBasketToResponse } from "./mapBasketToResponse";

/**
 * Creates a new basket and returns its initial state.
 */
export function createCart(_req: Request, res: Response, next: NextFunction) {
  try {
    const basket = cartClient.createBasket();
    res.status(201).json(mapBasketToResponse(basket));
  } catch (err) {
    next(err);
  }
}
