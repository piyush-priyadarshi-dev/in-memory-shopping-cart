import { Request, Response, NextFunction } from "express";
import cartClient from "../cartClient";
import { Basket } from "../../domain/types";
import { mapBasketToResponse } from "./mapBasketToResponse";

export function getCart(req: Request, res: Response, next: NextFunction) {
  try {
    const basket = cartClient.getBasket(req.params.cartId);
    res.json(mapBasketToResponse(basket));
  } catch (err) {
    next(err);
  }
}
