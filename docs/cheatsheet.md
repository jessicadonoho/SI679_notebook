---
title: "Cheat Sheet"
description: Copy-paste reference for the Express, TypeScript, MongoDB, and testing patterns used in SI 679.
outline: [2, 3]
---

# Cheat Sheet

A quick reference for writing course code. Each snippet is a pattern from the in-class code, and each section links to the page that explains it. Use the **On this page** menu (or <kbd>/</kbd> to search) to jump around.

## Project setup

*Explained in [Week 1](/weeks/week-01#setting-up-an-express-project) and [Week 2](/weeks/week-02#setting-up-typescript-express).*

```bash
mkdir my-api && cd my-api
npm init -y
npm pkg set type="module"                  # lets you use import/export
npm install express mongodb                # runtime dependencies
npm install -D typescript tsx vitest supertest mongodb-memory-server \
               @types/node@^22 @types/express @types/supertest
```

**`package.json` scripts**

```json
"scripts": {
  "dev": "tsx watch src/index.ts",
  "typecheck": "tsc --noEmit",
  "build": "tsc",
  "start": "node dist/index.js",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

| Command | Does |
|---|---|
| `npm run dev` | runs the server, restarts on save (**doesn't check types**) |
| `npm run typecheck` | checks types only |
| `npm test` | runs the tests once |

**`tsconfig.json`** (Week 3/4 version)

```json
{
  "compilerOptions": {
    "module": "nodenext", "target": "esnext", "lib": ["esnext"], "types": ["node"],
    "rootDir": "./src", "outDir": "./dist", "sourceMap": true,
    "strict": true, "verbatimModuleSyntax": true, "isolatedModules": true,
    "moduleDetection": "force", "skipLibCheck": true
  },
  "include": ["src"]
}
```

**`.gitignore`**: `node_modules` and `dist`.

**Folder layout** (Week 4):

```
src/
├── db/            talk to MongoDB
├── models/        types + converters
├── services/      application logic
├── controllers/   read req, call service, send res
├── routes/        endpoint → controller
├── middleware/    error handler, auth, logging…
├── __tests__/     *.test.ts
├── app.ts         builds + exports the app (no listen)
└── index.ts       connects db, then listens
```

## Server skeleton

*Explained in [Week 2: E2E testing](/weeks/week-02#e2e-testing-with-supertest).*

```ts
// src/app.ts: build the app, export it, never listen here
import express from 'express';
import { productRouter } from './routes/product-routes.js';   // note: .js, not .ts
import { errorHandler } from './middleware/error-handler.js';

const app = express();
app.use(express.json());                 // parse JSON bodies → req.body
app.use('/products', productRouter);     // mount routers
app.use(errorHandler);                   // LAST
export { app };
```

```ts
// src/index.ts: the only file that opens a port
import { app } from './app.js';
import { db } from './db/db.js';

const port = 6790;
await db.init();                         // connect BEFORE listening
app.listen(port, () => console.log(`Server running on port ${port}`));
```

## Routes

*Explained in [Week 1: routes](/weeks/week-01#routes-app-method-path-handler) and [Week 2: routers](/weeks/week-02#express-routers).*

```ts
import express from 'express';
import type { Request, Response } from 'express';

export const booksRouter = express.Router();      // mounted at /books in app.ts

booksRouter.get('/', (req: Request, res: Response) => { … });        // GET    /books
booksRouter.get('/:id', (req: Request, res: Response) => { … });     // GET    /books/42
booksRouter.post('/', (req: Request, res: Response) => { … });       // POST   /books
booksRouter.patch('/:id', (req: Request, res: Response) => { … });   // PATCH  /books/42
booksRouter.delete('/:id', (req: Request, res: Response) => { … });  // DELETE /books/42
```

- Inside a router, paths are **relative** to the mount point: `'/'`, not `'/books'`.
- **Order matters.** Put specific paths (`/badroute`) **above** `/:id`, or `/:id` will capture them.
- Handlers that `await` must be `async`: `async (req: Request, res: Response) => { … }`.

**Which method?**

| Want to… | Method | Path | Success code |
|---|---|---|---|
| list all | GET | `/products` | 200 |
| get one | GET | `/products/:id` | 200 (404 if missing) |
| create | POST | `/products` | **201** |
| change some fields | PATCH | `/products/:id` | 200 (404 if missing) |
| replace entirely | PUT | `/products/:id` | 200 |
| remove | DELETE | `/products/:id` | 200 or **204** (404 if missing) |
| sub-collection | GET / POST | `/customers/:id/orders` | 200 / 201 |

Use nouns, not verbs: `POST /products`, never `/createProduct` ([Week 4](/weeks/week-04#designing-endpoints-in-three-steps)).

## Reading the request (`req`)

*Explained in [Week 1: three ways data arrives](/weeks/week-01#three-ways-data-reaches-your-handler).*

| Data | URL / request | Read it with | Arrives as |
|---|---|---|---|
| **Route param** | `/products/6abb…` for route `/:id` | `req.params.id` | string (typed `string \| string[]`) |
| **Query string** | `/books?author=Tolkien&year=1937` | `req.query.author` | string, array, or `undefined` |
| **Body** | JSON sent with POST/PATCH | `req.body.title` | `any` (needs `express.json()`) |
| **Header** | `Authorization: Bearer SI679` | `req.headers.authorization` | string or `undefined` (keys lowercase) |
| Method / path | | `req.method`, `req.path` | string |

```ts
const { id } = req.params;                     // destructuring
const { title, author, year } = req.body;
const { keywords } = req.query;

const id = String(req.params.id);              // force string (Week 3)
const year = Number(req.query.year);           // query values are strings → convert
const category = typeof req.query.category === 'string' ? req.query.category : undefined;
```

## Sending the response (`res`)

*Explained in [Week 1: status codes](/weeks/week-01#status-codes) and [Week 2](/weeks/week-02#status-codes-you-ll-actually-use).*

```ts
res.send('plain text or HTML');                 // Content-Type: text/html
res.json({ id, title });                        // Content-Type: application/json
res.status(201).json({ id });                   // set status, then send
res.status(400).send('title is required');
res.status(404).json({ error: 'Not found' });
res.sendStatus(204);                            // status + default text, no body to write
```

**Exactly one response per request.** After an early response, `return`:

```ts
if (!product) {
  res.sendStatus(404);
  return;                                       // otherwise the next line sends again → crash
}
res.json(product);
```

**Status codes**

| Code | Meaning | When |
|---|---|---|
| 200 | OK | success |
| 201 | Created | POST made something |
| 204 | No Content | success, nothing to send (e.g. DELETE) |
| 400 | Bad Request | invalid input, malformed JSON, bad id format |
| 401 | Unauthorized | missing or invalid credentials (*unauthenticated*) |
| 403 | Forbidden | authenticated, but not allowed |
| 404 | Not Found | no such route, or no item with that id |
| 500 | Internal Server Error | your code broke (the error handler's default) |

## Validating input and ids

*Explained in [Week 1: status codes](/weeks/week-01#status-codes), [HW1 walkthrough](/weeks/week-02#homework-hw1-slicedrop), and [Page 0: `unknown`](/foundations#any-vs-unknown).*

```ts
// numeric id (Weeks 1–2)
if (isNaN(Number(req.params.id))) {
  res.status(400).send('id must be a number');
  return;
}

// MongoDB id: 24 hex characters (Week 3). new ObjectId() THROWS on anything else
if (!/^[0-9a-f]{24}$/.test(String(req.params.id))) {
  res.status(400).json({ error: 'invalid id' });
  return;
}

// required non-empty string
if (typeof title !== 'string' || title.trim() === '') { /* 400 */ }

// whole number ≥ 1
if (!Number.isInteger(quantity) || quantity < 1) { /* 400 */ }

// collect ALL problems, then respond once (HW1 style)
const problems: string[] = [];
if (!title) problems.push('title is required');
if (!author) problems.push('author is required');
if (problems.length > 0) {
  res.status(400).json({ errors: problems });
  return;
}
```

A well-formed id that surely doesn't exist (for 404 tests): `'a'.repeat(24)`.

## Middleware

*Explained in [Week 2: middleware](/weeks/week-02#middleware).*

```ts
import type { Request, Response, NextFunction } from 'express';

// Logging: always passes on
const logger = (req: Request, res: Response, next: NextFunction): void => {
  console.log(req.method, req.path);
  next();
};

// Auth: "Authorization: Bearer <token>"
const checkAuth = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token === 'SI679') {
    next();
  } else {
    res.status(401).json({ error: 'missing or invalid token' });
  }
};

// Validation
const validateBook = (req: Request, res: Response, next: NextFunction): void => {
  const { title, author } = req.body;
  if (title && author) { next(); return; }
  res.status(400).send('title and author are required');
};
```

**Attaching it**

```ts
app.use(express.json());                                   // whole app
booksRouter.use(logger);                                   // whole router
booksRouter.delete('/:id', checkAuth, handler);            // one route
booksRouter.post('/', [checkAuth, validateBook], handler); // several, in order
```

**Rules:** call `next()` **or** send a response (never neither). Register it **before** the routes it should affect.

**Catch-all 404 + error handler** (end of `app.ts`, in this order)

```ts
// no route matched
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// something threw: FOUR params, registered LAST
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ error: 'malformed JSON' });     // client's fault
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on our end' });
});
```

## TypeScript for Express

*Explained in [Page 0](/foundations).*

```ts
import express from 'express';                        // value → normal import
import type { Request, Response, NextFunction } from 'express';   // types → import type
import { BookStatus, type Book } from './types.js';   // mixed

// handler signatures
(req: Request, res: Response): void                         // route handler
async (req: Request, res: Response): Promise<void>          // async route handler
(req: Request, res: Response, next: NextFunction): void     // middleware
(err: Error, req: Request, res: Response, next: NextFunction): void   // error handler
```

**Typing your data**

```ts
export interface NewOrder { customerName: string; items: OrderItem[]; }   // request body
export interface Order extends NewOrder { id: string; status: OrderStatus; createdAt: string; }
export type OrderStatus = 'pending' | 'in-progress' | 'completed';       // union → type

export type Product = { id: string; name: string; price: number; quantity: number };
export type NewProduct = Omit<Product, 'id'>;          // POST body
export type ProductUpdate = Partial<NewProduct>;       // PATCH body
```

| Need | Use |
|---|---|
| plain object shape | `interface` or `type` (be consistent) |
| union / literal set / tuple | `type` |
| derived (`Partial`, `Omit`, `Pick`, `keyof`) | `type` |
| shape built on another shape | `interface … extends` |
| unvalidated input | `unknown`, not `any` |

## MongoDB

*Explained in [Week 3](/weeks/week-03).*

**Connect**

```ts
import { MongoClient, ObjectId } from 'mongodb';
import type { Db, Document } from 'mongodb';

let mongoClient: MongoClient | null = null;
let theDb: Db;

const init = async (uri = 'mongodb://127.0.0.1:27017', dbName = 'week4'): Promise<void> => {
  mongoClient = new MongoClient(uri);
  await mongoClient.connect();
  theDb = mongoClient.db(dbName);
};

const disconnect = async (): Promise<void> => {
  if (mongoClient) { await mongoClient.close(); mongoClient = null; }
};

const products = () => theDb.collection('products');
```

**CRUD**

| Do | Code | Returns |
|---|---|---|
| Create one | `await products().insertOne(doc)` | `{ insertedId }` |
| Create many | `await products().insertMany([a, b])` | `{ insertedCount, insertedIds }` |
| Read all | `await products().find().toArray()` | `Document[]` |
| Read matching | `await products().find({ price: { $lt: 5 } }).toArray()` | `Document[]` |
| Read one | `await products().findOne({ _id: new ObjectId(id) })` | `Document \| null` |
| Update one | `await products().updateOne({ _id: new ObjectId(id) }, { $set: changes })` | `{ matchedCount, modifiedCount }` |
| Delete one | `await products().deleteOne({ _id: new ObjectId(id) })` | `{ deletedCount }` |
| Delete all | `await products().deleteMany({})` | `{ deletedCount }` (tests only!) |

**Query operators**

| Operator | Means | Example |
|---|---|---|
| *(none)* | equals | `{ name: 'Duct Tape' }` |
| `$lt` / `$lte` | < / ≤ | `{ price: { $lt: 5 } }` |
| `$gt` / `$gte` | > / ≥ | `{ price: { $gte: 5 } }` |
| combined | range | `{ price: { $gte: 2, $lte: 10 } }` |
| `{}` | everything | `find({})` |

**Update operators**

```ts
{ $set: { price: 4.29 } }      // set/replace these fields only
{ $inc: { quantity: 10 } }     // add to a number
```

**Ids**

```ts
new ObjectId(id)               // string → ObjectId (throws if not 24 hex chars)
doc._id.toString()             // ObjectId → string
```

**404 checks**

```ts
const doc = await products().findOne({ _id: new ObjectId(id) });
if (!doc) → 404                                    // findOne gives null

const { matchedCount } = await products().updateOne(…);
if (matchedCount === 0) → 404                      // matched, not modified

const { deletedCount } = await products().deleteOne(…);
if (deletedCount === 0) → 404
```

**Model converter** (keeps `_id` inside the model layer)

```ts
export const productFromDocument = (doc: Document): Product => ({
  id: doc._id.toString(),
  name: doc.name,
  price: doc.price,
  quantity: doc.quantity,
});
```

**Start the database**: `mongod --dbpath ~/data/mdata` (or check the connection in Compass). **Shell**: `mongosh` → `use week3db` → `db.products.find()`.

## One resource through all the layers

*Explained in [Week 4: layers](/weeks/week-04#a-layered-architecture).* A template for `GET /products/:id`:

```ts
// db/db.ts: MongoDB only
const findById = async (collection: string, id: string): Promise<Document | null> => {
  if (!mongoClient) await init();
  return await theDb.collection(collection).findOne({ _id: new ObjectId(id) });
};
export const db = { init, findById, PRODUCTS: 'products' };

// models/products.ts: types + converters
export type Product = { id: string; /* … */ };
export const productFromDocument = (doc: Document): Product => ({ id: doc._id.toString(), /* … */ });

// services/product-service.ts: logic; no req/res, no status codes
const getById = async (id: string): Promise<Product | null> => {
  const doc = await db.findById(db.PRODUCTS, id);
  return doc ? productFromDocument(doc) : null;
};
export const productService = { getById };

// controllers/product-controllers.ts: HTTP only
const getProduct = async (req: Request, res: Response): Promise<void> => {
  const product = await productService.getById(String(req.params.id));
  if (!product) { res.sendStatus(404); return; }
  res.json(product);
};
export const productControllers = { getProduct };

// routes/product-routes.ts: mapping only
productRouter.get('/:id', productControllers.getProduct);
```

## Testing (Vitest + Supertest + MongoMemoryServer)

*Explained in [Week 2](/weeks/week-02#e2e-testing-with-supertest), [Week 3](/weeks/week-03#vitest-matchers), and [Week 4](/weeks/week-04#testing-with-mongomemoryserver).*

```ts
// src/__tests__/products.test.ts
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../app.js';
import { db } from '../db/db.js';

let mongo: MongoMemoryServer;

beforeAll(async () => {                          // once: start throwaway db
  mongo = await MongoMemoryServer.create();
  await db.init(mongo.getUri(), 'test');
});

beforeEach(async () => {                         // every test: known state
  await db._clearCollection(db.PRODUCTS);
  await db.addToCollection(db.PRODUCTS, { name: 'Duct Tape', price: 5.99, quantity: 120 });
});

afterAll(async () => {                           // once: clean up
  await db.disconnect();
  await mongo.stop();
});

describe('GET /products', () => {
  it('lists products', async () => {
    const res = await request(app).get('/products');   // act
    expect(res.status).toBe(200);                      // assert
    expect(res.body).toHaveLength(1);
  });
});
```

**Supertest requests**

```ts
await request(app).get('/books?author=Tolkien');
await request(app).post('/books').set('Authorization', 'Bearer SI679').send({ title: 'Dune' });
await request(app).patch(`/products/${id}`).send({ price: 4.99 });
await request(app).delete(`/products/${'a'.repeat(24)}`);
// read back: res.status · res.body (JSON) · res.text (send() responses)
```

**Matchers**

| Matcher | Use for |
|---|---|
| `toBe(200)` | primitives (numbers, strings, booleans) |
| `toEqual({ … })` / `toEqual([…])` | objects and arrays (compares contents) |
| `toHaveLength(2)` | arrays, strings |
| `toContain('Braun')` | array includes a primitive |
| `toContainEqual({ … })` | array includes an object |
| `toMatch(/^[0-9a-f]{24}$/)` | string matches a pattern |
| `toBeUndefined()` / `toBeNull()` / `toBeDefined()` | absence / presence |
| `.not.…` | inverts any matcher (pair it with a positive one) |
| `await expect(p).rejects.toThrow()` | an async function throws |

**Without a database** (Week 2): reset in-memory state with `beforeEach(() => { _resetCatalog(); });`.

**`vitest.config.ts`** (needed for MongoMemoryServer):

```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { hookTimeout: 120_000, testTimeout: 20_000 } });
```

## Postman quick steps

1. **Method** dropdown → GET / POST / PATCH / DELETE, then the URL `http://localhost:6790/products`.
2. **Body** → **raw** → type **JSON** (not Text), then paste the JSON.
3. **Headers** → `Authorization` = `Bearer <token>`.
4. **Send**, then check the status and body. Copy ids from responses into later requests.

## When it breaks

| You see | Likely cause |
|---|---|
| `Cannot GET /x` / `Cannot POST /x` | no route for that method + path, or the router is mounted at a different prefix |
| `req.body` is `undefined` / fields empty | `express.json()` missing or registered after the route, or Postman body not set to JSON |
| request hangs forever | middleware didn't call `next()` or respond, or `mongod` isn't running (~30 s timeout) |
| `Cannot set headers after they are sent` | sent two responses: add `return` after early `res.…` |
| `Cannot use import statement outside a module` | `"type": "module"` missing in `package.json` |
| `Cannot find module './types'` | import needs the `.js` extension: `'./types.js'` |
| `'Request' is a type and must be imported using a type-only import` | use `import type { Request }` |
| `Cannot find name 'process'` | `"types": ["node"]` missing in `tsconfig.json` |
| `input must be a 24 character hex string…` → 500 | `new ObjectId()` got a malformed id: validate first |
| `findOne` by id returns `null` for a real id | searched with a string, not `new ObjectId(id)` |
| response shows `_id` instead of `id` | the service skipped `productFromDocument` |
| test passes once, fails on rerun | leftover data: use MongoMemoryServer + `beforeEach` clear |
| `Hook timed out in 10000ms` | `vitest.config.ts` missing (MongoMemoryServer needs longer) |
| `toBe` fails on identical objects | use `toEqual` |
| error handler never runs | registered before the routes, or has only 3 parameters |
| code with type errors runs anyway | `tsx` doesn't type-check: run `npm run typecheck` |
