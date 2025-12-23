export type BasketItem = {
  id: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type BasketTotal = {
  subtotal: number;
  itemCount: number;
};

export type Basket = {
  id: string;
  items: BasketItem[];
  totals: BasketTotal;
  createdAt: number;
  lastAccessedAt: number;
};

export interface SalesforceCartClient {
  createBasket(): Basket;
  getBasket(basketId: string): Basket;
  addItem(basketId: string, sku: string, quantity: number): Basket;
  updateItemQuantity(
    basketId: string,
    itemId: string,
    quantity: number
  ): Basket;
  removeItem(basketId: string, itemId: string): Basket;
}
