# Overview

This document contains the architecture and abstraction rules for a think experience API that manages a telecom shopping cart using a non-peristent Salesforce cart context

The service will expose cart APIs to be consumed by clients, mimicking the SF Shopper Basket V2. We will call this service SafesforceCartClient.

We will not be making any calls to the Salesforce system.

# Tech stack

The service is implemented using:

- Node.js (v20+)
- TypeScript
- Express.js

# High Level Design

The flow of control is as follows:
Client (Web App/Mobile App) -> Experience API (Node) -> SalesforceCartClient (Node - ) -> In-memory storage

Points to consider

- No persistent database is used, everything reset on server restart.
- Cart state is owned by the SalesforceCartClient.

# Main Components

1. Experience APIs

- Gives API endpoints for client consumption
- Validates Request
- Calls the SalesforceCartClient internally for business logic
- Respond with appropriate HTTP Errors or responses with Cart Object

2. SalesforceCartClient (Test Double)

- Created and Manages the Basket state and data
- Handles add/update/remove items operations
- Expires the Cart in 15 minutes
- Does all the recalculations on each operation to return the most recent updated cart
- This must behaves realistically as the SF Basket does

3. In-Memory Basket Store

- Store basket in memory, and assign it a basketId, its primary key.
- track timestamp to enforce expiry
- No backgroup cleanup required at this stage. We can gracefully delete expired baskets.

# Data Model

#### BasketItem

```typescript
type BasketItem = {
  id: string; // UUID
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};
```

#### BasketTotal

```typescript
type BasketTotal = {
  subtotal: number;
  itemCount: number;
};
```

#### Basket

```typescript
type Basket = {
  id: string; // UUID // basketId
  items: BasketItem[];
  totals: BasketTotal;
  createdAt: number; // from Date object's epoch value
  lastAccessedAt: number; // from Date object's epoch value
};
```

### SalesforceCartClient Interface

This will be the strict structure for accessing the SalesforceCartClient

```typescript
interface SalesforceCartClient {
  createBasket(): Basket;

  getBasket(basketId: string): Basket;

  addItem(basketId: string, sku: number, quantity: number): Basket;

  updateItemQuantity(
    basketId: string,
    itemId: number,
    quantity: number
  ): Basket;

  removeItem(basketId: string, itemId: number): Basket;
}
```

#### Cart Expiry Behaviour

- Each basket has sliding expiry time, by default expiry time is 15 minutes.
- lastAccessedAt must be updated on each operation
- if a basket is accessed after its expiry, it must throw an error, and should delete the basket from the memory

# Error Handling

We will throw the following defined Errors if unable to perform an operation eg.

- BasketNotFoundError: Basket ID does not exists
- BasketExpiredError: Basket exists but expired
- InvalidItemQuantityError: Quantityis zero or negative
- ItemNotFoundError: Item Doesnt exists in the basket

# API Hardening

## Input Validations

We must introduce a request body validation at the API boundary before performing any write operations. It must follow the following rules

- Only required fields are accepted for each operations
- Any unexpected or additional fields are rejected
- Validation on API boundary must use Zod.

## Basic API Protection

To prevent unauthorised and accidental usage, we will introduce a authorisation using API key.
The API requests must expect an API key in the header, and will be validated at the middleware level.

## Rate Limiting

Introduce a simple in-memory API rate limiter for the incoming requests to prevent DoS attacks comgin from single ip within a set time window.

# Assumptions

- Price for each SKU will be pulled from a function which would return a fixed price, created just as a abstraction layer which can be later modified to have real time pricing.
- No promotion or taxes are applied. They must be handled on the product's end.
- Products are always in stock.
