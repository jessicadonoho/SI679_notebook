---
title: "FIXES.md · Week 4 in-class: REST layers"
editLink: false
---

# `FIXES.md`

From **Week 4 in-class: REST layers** · original: `si-679-f-26-week-04-nyt-jessicadonoho/FIXES.md` · [all files in this project](/code/week04-nyt/)

````md:line-numbers
# Fixes: get-product-by-id, through the layers

The error showed up in `product-controllers.ts`, but the bugs ran all the way
down through the service and db layers. Each fix is marked in the code with a
`// FIXED:` comment. Search for `FIXED:` to find them all.

Routes were fixed in a second pass, after you wrote the `/:id` route (see the
Routes section below).

## Controller: `src/controllers/product-controllers.ts`

| What was wrong | Fix |
| --- | --- |
| `getProductbyId` called **itself** instead of the service, so it recursed forever. The TS error was `Expected 2 arguments, but got 1`, because it called itself with 1 arg when it takes `(req, res)`. | It now calls `productService.getProductById(...)`. |
| It never sent a response, so the request would hang. | Sends `res.json(product)`. |
| No handling for "no such product". | Sends `404 NOT FOUND` when the service returns `null`. |
| It wasn't in `productControllers`, so routes couldn't use it. | Added to the export. |
| Named `getProductbyId` (lowercase b). | Renamed to `getProductById` to match the service. |

## Service: `src/services/product-service.ts`

| What was wrong | Fix |
| --- | --- |
| `import { getThroughID } from '../db/db.js'` was a compile error, because `db.ts` only exports the `db` object. | Removed the import. The code already uses `db.getThroughID`. |
| `db.getThroughID(db.PRODUCTS, id)` had its **arguments swapped**. The function signature is `(id, collectionName)`. | Changed to `db.getThroughID(id, db.PRODUCTS)`. |
| Return type was `Promise<Document \| null>`, but the function returns a `Product`. | Changed to `Promise<Product \| null>`. |
| Unused type imports `Db`, `Document`, `InsertOneResult`. | Removed. |

## DB: `src/db/db.ts` (in `getThroughID`)

| What was wrong | Fix |
| --- | --- |
| `await init;` had no parentheses, so `init` was never called. | Changed to `await init();`. |
| `new ObjectId(id)` **throws** on an id that isn't 24 hex characters (e.g. `/products/abc`), which became a 500 error. | Returns `null` when `!ObjectId.isValid(id)`, so the controller sends a 404. |

## How the request flows now

```
controller.getProductById(req, res)
  -> productService.getProductById(id)        returns Product | null
    -> db.getThroughID(id, db.PRODUCTS)       returns Document | null
```

## Verified

- `npm run typecheck` passes. Before the fixes it had 2 errors.
- I ran the controller against an in-memory MongoDB:
  - an existing id returns the product as JSON
  - a valid id that doesn't exist returns `404`
  - an invalid id like `abc` returns `404`, not a 500 crash

## Routes: `src/routes/product-routes.ts` (second pass)

You wrote:

```ts
productRouter.get('/:id', async (req: Request, res: Response) => {
    res.json(productControllers.getProductById(req.params.id))
});
```

| What was wrong | Fix |
| --- | --- |
| `Request`/`Response` weren't imported from express, so TypeScript used the built-in fetch types, which have no `.params`. | The wrapper is gone, so these types aren't needed. |
| The controller was called with only an id, but it takes `(req, res)`. | Express calls it with `(req, res)`. |
| The controller already sends its own response (JSON or 404), and it returns a Promise. `res.json(...)` around it would try to send a second response containing a Promise. | Pass the controller straight to the route. |

Now:

```ts
productRouter.get('/:id', productControllers.getProductById);
```

Verified over HTTP (supertest + in-memory MongoDB):

```
GET /products/<real id>                   200 {"id":..., "modelName":"X", "price":5}
GET /products/000000000000000000000000    404 {"error":"Not found: ..."}
GET /products/abc                         404 {"error":"Not found: ..."}
```
````
