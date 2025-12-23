import { Basket } from "../../domain/types";

/**
 * Returns the internal Basket model into the JSON as per API Contract.
 */
export function mapBasketToResponse(basket: Basket) {
  return {
    cartId: basket.id,
    items: basket.items.map((item) => ({
      itemId: item.id,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    })),
    totals: basket.totals,
  };
}
