### Note on tooling:

The assignment references Claude Code. As Claude Code is a paid service and I did not have access to it, I used the Codex extension in VS Code (ChatGPT) instead, which I already had access to via my GPT subscription.

The same spec-driven workflow was followed: I wrote the architecture and API specs first, then used the AI coding assistant to generate the implementation, reviewed it, and made manual adjustments where required.

## Main Prompt

```
You are a senior backend engineer.

Using the two specification files in this repository:

SPEC-A-architecture.md
SPEC-B-api.md

Implement a thin Experience API for a telecom shopping cart. Ensure the API includes basic operational hardening:
- Strict request validation at the API boundary
- Lightweight API protection to prevent misuse
- Basic rate limiting
- Environment-based configuration for runtime values


Considerations:
Node.js 20+
TypeScript
Minimal HTTP framework (Express or Fastify)
No real Salesforce calls
Implement SalesforceCartClient as an in-memory test double
No database
Support cart expiry as described in the specs

Please:
Create source code under src/
Create unit tests under tests/
Keep the implementation small and readable
Follow the API contracts exactly
Start by creating the basic project structure and core domain classes.
Do not add features that are not mentioned in the specs.
```

## Response

```
Built a minimal Express/TypeScript experience API and in-memory SalesforceCartClient per specs.

 - Added domain model, pricing stub, and error types; SalesforceCartClient now manages baskets in memory with sliding 15‑minute expiry, SKU aggregation, totals recalculation, and spec errors (src/domain, src/errors).
 - Exposed HTTP routes matching the contract with consistent error mapping and cart serialization (app.ts); server bootstrap added (server.ts).
 - Project scaffolding plus Jest/ts-jest setup captured in package.json, tsconfig.json, jest.config.cjs.
 - Unit and API tests cover cart behaviors, expiry handling, and HTTP responses (cartClient.test.ts, api.test.ts).
 - Tests not run (dependencies not installed in this environment). Next steps: 1) npm install, 2) npm test, 3) npm run dev to exercise the API.
 - Request validation implemented at the API boundary with strict schema enforcement
 - Basic API protection and rate limiting added via middleware
 - Environment-based configuration introduced for port, cart expiry, and API key

15 files changed +541 -2

Review
package.json +0 -1
app.ts +108 -0
SalesforceCartClient.ts +133 -0
pricing.ts +4 -0
types.ts +28 -0
CartErrors.ts +27 -0
server.ts +7 -0
api.test.ts +79 -0
cartClient.test.ts +63 -0
tsconfig.json +1 -1
validateRequest.ts +25 -0
apiKeyAuth.ts +18 -0
rateLimiter.ts +30 -0
cartSchemas.ts +6 -0
logger.ts +12 -0

```

# Review

The project folder structure was overall okay.
I first looked at the implementation of the API as this is the entry point. The first impression was not so good as it gave me all the API endpoints in a sinlge file. This may be good for a demo project but is not at all a stable architecture. It would be really difficult to scale and main this code. So i asked him to update this part

# Follow up prompts

## Prompt

```
You need to refactor this a bit, currently all the APIs are in a single file. Its not good for maintaining later and adding features in future.
Can you instead split them info multiple files,
having separate files for each route,
having controllers for request handling,
create a singleton CartClient which will be used by each endpoint.
and improve the way you are handling errors.
```

#### Response

```
Refactored API structure with controllers, routes, singleton cart client, and centralized error handling.

 - Added cartClient.ts as shared singleton SalesforceCartClient; all handlers use it.
 - Introduced controller layer (cartController.ts) to map HTTP to cart operations and response shapes.
 - Split routes into cartRoutes.ts and rewired app.ts to mount /api/cart router.
 - Centralized error handling and JSON syntax handling in errorHandler.ts for consistent responses.
 - pdated tests to import the singleton client via the new module (api.test.ts).
 - then npm test, and npm run dev to exercise endpoints.

6 files changed +149 -102

Review
app.ts +7 -101
cartClient.ts +4 -0
cartController.ts +70 -0
errorHandler.ts +48 -0
cartRoutes.ts +18 -0
api.test.ts +2 -1
```

#### Review

Though it had separated the implementation and splitted into their respected files, still there was only 1 controller file, which again looked a little Spaghetti. So ask again to split again.

## Prompt

```
can you go a little further and in the controllers, create a file for each API
```

#### Response

```
Split controllers into per-endpoint files and reused a shared mapper.

 - Removed monolithic controller and added dedicated controllers: createCartController.ts, getCartController.ts, addItemController.ts, updateItemQuantityController.ts, removeItemController.ts, all using the singleton cartClient.
 - Added mapBasketToResponse.ts to keep response shaping consistent.
 - Updated router wiring in cartRoutes.ts to import the new controllers.
 - Tests not run here (dependencies not installed). Next: npm install then npm test to verify.

8 files changed +91 -77

Review
addItemController.ts +18 -0
cartController.ts +0 -70
createCartController.ts +12 -0
getCartController.ts +12 -0
mapBasketToResponse.ts +15 -0
removeItemController.ts +12 -0
updateItemQuantityController.ts +17 -0
cartRoutes.ts +5 -7
```

#### Review

Although it was the same code as earlier, adding dedicated controllers and aplitting them into individual files looks good and isolated. Its is now easier to manage and maintain.

## Prompt

```
In the test suites, there was no test to verify the cartexpiry behaviour. Can you add some test cases to verify this functionality. You may use fake clock or fake timers to assert accessing the cart wherever required
```

#### Response

```
Added focused expiry tests using fake timers.

 - Domain tests now simulate time passing to assert expiry and sliding refresh, and reset timers after each (cartClient.test.ts).
 - API test suite uses fake timers to trigger expiry via the singleton client, and clears carts after each (api.test.ts).
Next: run npm test to verify.

2 files changed +36 -9


Review
api.test.ts +10 -4
cartClient.test.ts +26 -5
```

## Prompt

```
Need few changes on the code quality part. Please extract the commonly reused error codes/messages into a small constants file, and replace its usage everywhere. Also add a .env file and .env.example file to store secrets.
```

#### Response

```
Implemented the requested improvements:

- Constants: Centralized common error codes/messages in errors.ts.
- Dependencies: Added dotenv to package.json.

Tests weren’t modified; if you run them, ensure dependencies are installed (npm install).

10 files changed +89 -16

Review
package.json +4 -2
cartClient.ts +2 -1
errorHandler.ts +22 -8
validateRequest.ts +14 -0
cartRoutes.ts +5 -3
cartSchemas.ts +16 -0
.env.ts +5 -0
.env.example.ts +5
errors.ts +13 -0
server.ts +3 -2
```

# Note

The project created by the AI agent looks good from outside, but I had to review each and every line of the code myself, to look for some mistakes, incomplete implementation or any other missing contraints as the final responsibility of the code lies on the developer.

- Reviewed the generated code and simplified naming where required
- Refactored the initial single-file implementation into a multi-file structure
- Adjusted error handling and messages to match the API spec
- Reviewed and verified expiry behaviour manually and via tests
