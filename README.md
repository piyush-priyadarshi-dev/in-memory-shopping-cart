# Telecom Cart Experience API

This project implements a thin experience API for managing a telecom shopping cart on top of a non-persistent Salesforce cart context.

The API exposes a subset of cart functionalities implemented by Salesforce Shopper Basket V2 as a test double, that goes by the name SalesForceCartClient. It uses a in-memory storage using Map Data Structure.

No Salesforce APIs or services are accessed.

# Tech Stack

- Node.js (v20+)
- TypeScript
- Express.js as HTTP framework
- Jest for unit testing

# Supported Functionalities

- Create Cart
- Get Cart
- Add Item to Cart
- Update Item Quantity in Cart
- Remove item from Cart

# Setup

```bash
npm install
```

# Run the server

```
npm run dev
```

# App Base URL

```bash
http://localhost:3000/api/cart
```

# Run tests

```bash
npm test
```

# Documentation

- Architecture: [SPEC-A-architecture.md](SPEC-A-architecture.md)
- API Contracts: [SPEC-B-api.md](SPEC-B-api.md)
- AI Prompts: [PROMPTS.md](PROMPTS.md)
- Postman Collection: [IMPORT JSON](postman_collection.json) or access it using the [link](https://red-firefly-292308.postman.co/workspace/AdmitSpot~a0955b4b-6b28-480d-ae10-bb16aa124702/collection/24728942-342d453f-08d5-419d-ba57-0470b2268fea?action=share&creator=24728942&active-environment=24728942-c4410823-6faa-4c16-981b-7dfc9049faea)
