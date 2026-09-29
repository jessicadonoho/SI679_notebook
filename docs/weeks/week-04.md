---
title: "Week 4: REST APIs & Layered Architecture"
description: REST principles, designing resource endpoints, the routes → controllers → services → models → db layers, and testing with Supertest + MongoMemoryServer.
---

# Week 4: REST APIs & Layered Architecture

**Lecture notes:** *Week 04: REST APIs* (Sept 29) · **In-class code:** [Week 4 NYT (REST layers)](/code/week04-nyt/)

::: info Where my Week 4 code stands
- **Built through every layer:** `GET /products`, `POST /products`, and `GET /products/:id` (Now You Try #1).
- **Tests:** `products.test.ts` runs against MongoMemoryServer. **4 pass, 1 fails.** The failing one is the "incomplete product" test from the extra NYT, and it's failing *correctly*: it caught a real bug in `POST` ([explained below](#nyt-incomplete-product-test)).
- **Not done in class:** Now You Try #2 (tests for `GET /products/:id`) and the `DELETE` stretch goals.

The [Now You Try guide](#now-you-try-guide) walks through all of these step by step.
:::

## Overview

You can already build routes that work. This week asks what makes an API **well designed**: easy for another developer to understand and use without reading your code, and easy for you to maintain as it grows. It gives two answers:

1. **REST**, a widely adopted set of principles for designing web APIs around *resources* and standard HTTP methods.
2. **A layered architecture.** The Week 3 app splits into six folders (`db`, `models`, `services`, `controllers`, `routes`, `middleware`), each with one job and each knowing only about the layer below it.

The second half of the lecture finishes what Week 3 started: automated tests with **Supertest** against a throwaway **MongoMemoryServer** database.

Why it matters: this folder structure and endpoint style is what most Express codebases (and HW2 onward) look like. Once you know it, you can open an unfamiliar API project and find things.

## Key concepts

### APIs and REST

An **API** (Application Programming Interface) is the set of requests a program accepts and the responses it promises to give back: a contract between your server and its clients. A **web API** is one whose requests arrive over HTTP.

**REST** (*REpresentational State Transfer*) is a style of designing web APIs, described by Roy Fielding in his 2000 dissertation. An API that follows its principles is called **RESTful**. The lecture lists six principles:

| Principle | Plain-language meaning |
|---|---|
| **Uniform interface** | every resource is used the same, predictable way: standard HTTP methods on consistently named URLs |
| **Client–server** | client and server are separate and can change independently (the [Week 1](/weeks/week-01#the-client-server-model) model) |
| **Stateless** | each request carries everything needed to handle it. The server doesn't remember earlier requests from the same client |
| **Cacheable** | responses say whether they can be reused (inconsistently done in practice) |
| **Layered system** | the system is built in layers that each only talk to their neighbor. This week's folder structure is one way to do that |
| **Code on demand** *(optional)* | the server may send code for the client to run. Rarely used |

REST won out over older approaches (SOAP, CORBA) because it matches how HTTP already works (stateless, client–server) and because the alternatives were large and painful.

### Resources and representations

A **resource** is any "thing" your API manages: a product, a customer, an order. Each has a **URI** (its address, like `/products/6abb…`).

The key idea in REST's name: the server never hands over the resource itself. It sends a **representation** of it, a snapshot in some format (JSON for us). The server keeps the actual thing. That's why the representation can differ from how the data is stored. The database has `_id: ObjectId(…)`, and the API sends `"id": "…"`.

::: sticky Real life: the real-estate listing
When you browse a house online, you get **photos, a floor plan, and a description**: a representation. The house stays where it is, and the listing doesn't have to match the builder's blueprints either (no one lists the plumbing diagram). Your API's JSON is the listing, and MongoDB holds the house.
:::

### Designing endpoints in three steps

An **endpoint** is one method + path combination your API supports, like `GET /products`. The lecture's design process, applied to a shop with products, customers, and orders:

1. **Entities and relationships.** What are the things, and how do they relate? A customer has many orders, and an order contains many products.
2. **Representations.** What JSON does each entity look like when it goes over the wire? The product is `{ id, modelName, modelNumber, manufacturer, color, price, quantity }`, and `id` is a string.
3. **Lay out endpoints.** Use **plural nouns** for collections, and let the **HTTP method** be the verb:

| Endpoint | GET | POST | PATCH | DELETE |
|---|---|---|---|---|
| `/products` | list all | create one | | |
| `/products/:id` | get one | | update given fields | delete it |
| `/customers` | list all | create one | | |
| `/customers/:id` | get one | | update given fields | delete it |
| `/customers/:id/orders` | that customer's orders | create an order for them | | |

Two rules of thumb from the notes: **nouns, not verbs** (`POST /products`, never `/createProduct`), and **don't just mirror your database structure**. Design around what clients need.

### HTTP methods, precisely

| Method | Meaning | Typical success code |
|---|---|---|
| **GET** | read; never changes anything | 200 |
| **POST** | create a new item in a collection | **201 Created** |
| **PUT** | replace an item completely with the body sent | 200 |
| **PATCH** | change only the fields sent | 200 |
| **DELETE** | remove an item | 200 with a body, or **204 No Content** |

**Idempotent** (a term from the Microsoft reading) means that sending the same request twice has the same effect as sending it once. GET, PUT, and DELETE are idempotent: deleting product 5 twice still leaves product 5 deleted. POST is not, because posting twice creates two products.

::: sticky Real life: the light switch vs. the doorbell
**PUT/DELETE** are like setting a light switch to OFF: flip it to OFF five times and the light is still just off (idempotent). **POST** is a doorbell: press it five times and it rings five times (five new products).
:::

### A layered architecture

A **layer** is a group of code with one responsibility that talks only to the layer directly below it. This is **separation of concerns**: each piece of code cares about one thing. The standard layout for an Express API:

| Layer (folder) | Job | Knows about |
|---|---|---|
| `index.ts` / `app.ts` | build the app and start the server | everything, to wire it together |
| **`middleware/`** | general processing for many routes (error handling, auth, logging) | Express |
| **`routes/`** | map each endpoint to a controller function, and nothing more | controllers |
| **`controllers/`** | handle the HTTP side: read `req`, call a service, choose the status code, send `res` | services, Express `Request`/`Response` |
| **`services/`** | application logic: what "get all products" or "add a product" actually means | db, models |
| **`models/`** | define what a resource *is* (types) and convert raw data into it | nothing (a pure definition) |
| **`db/`** | talk to the database: connect, find, insert | MongoDB |

The payoff: each layer can be understood, changed, and tested **on its own**. The lecture builds from the **bottom up** (db → model → service → controller → route → app), which works precisely because no layer needs anything above it.

::: sticky Real life: the restaurant
The **host** at the door (routes) only decides which table (controller) you go to. The **waiter** (controller) takes your order, talks to the kitchen, and brings back the plate. They're the only one who speaks "customer" (HTTP). The **kitchen** (service) knows how to make each dish but never talks to customers. The **recipe cards** (models) define what each dish is. The **pantry** (db) stores the ingredients. The chef doesn't care which table ordered, and the waiter doesn't need to know where the flour is kept.
:::

A useful test of the boundaries, from the Now You Try: when `GET /products/:id` doesn't find anything, who decides to send **404**? 404 is an HTTP idea, so it's the **controller**. The service just returns "a product or nothing" (`Product | null`).

### Model functions and `??`

The model layer has two converters:

- `productFromDocument(doc)` turns a MongoDB document into a `Product`, renaming `_id` (an `ObjectId`) to `id` (a string). Nothing above the model ever sees `_id`.
- `productFromFields(fields)` turns a partial set of fields (from a request) into a complete `Product`, filling in defaults.

`productFromFields` uses the **nullish coalescing operator `??`**: `a ?? b` gives `a`, unless `a` is `null` or `undefined`, in which case it gives `b`. So `fields.price ?? 0.0` means "the price they sent, or 0 if they didn't send one".

::: tip Extra context: `??` vs `||`
`||` also supplies defaults, but it replaces **every falsy value** (`0`, `''`, `false`). `fields.quantity || 10` would turn a deliberate `quantity: 0` into 10, while `fields.quantity ?? 10` keeps the 0. For defaults, `??` is almost always what you mean.
:::

### Testing with MongoMemoryServer

This picks up where [Week 3](/weeks/week-03#the-dirty-database-problem-and-mongomemoryserver) stopped. **Postman** vs. automated tests:

| | Postman | Vitest + Supertest + MongoMemoryServer |
|---|---|---|
| The server | a real one on port 6790 (`npm run dev`) | none: requests go straight to the `app` object |
| The database | your real `week4` database | a throwaway database that exists only during the run |
| The data | whatever you imported, still there tomorrow | whatever the test just put there |
| Who checks the answer | you, reading JSON | `expect` |
| When it runs | when you click Send | every `npm test` |

Two consequences the notes point out: tests don't need `mongod` or `npm run dev` running, and **`index.ts` is never tested**, since Supertest imports `app` directly. A missing `await db.init()` there would break the real server while every test still passed.

**Pointing the db layer at the test database.** `db.init` gets **default parameters**: values used when the caller passes nothing. The app calls `db.init()` and gets the real database, and a test calls `db.init(mongo.getUri(), 'test')`:

```ts
const init = async (uri: string = MONGO_URI, dbName: string = DB_NAME): Promise<void> => { … };
```

Two **test-only** functions (hence the `_` prefix convention) complete it: `disconnect()` and `_clearCollection(name)`.

**Seed through the db layer, not the route under test.** To test `GET /products`, the test inserts two coffee makers with `db.addToCollection` in `beforeEach`. If it used `POST /products` to set up, a bug in POST would make the GET test fail and send you looking in the wrong place.

**Arrange, act, assert.** Every test has the same shape: *arrange* the data (here done by `beforeEach`), *act* (send the request), *assert* (state what should be true).

Two more matchers join the Week 3 list: **`toMatch(/regex/)`** to check the *shape* of a value you can't predict (a generated id), and **`toBeUndefined()`** to check that something is absent (`product._id`). The notes add one caution: **negative assertions** like `.not.toContain('REVOTRA')` pass for many wrong reasons, including an empty array, so pair them with a positive one.

::: sticky Real life: resetting the stage between scenes
`beforeAll` is **building the theater set** once before the play: slow, done once. `beforeEach` is the stagehands **putting every prop back on its mark** between scenes: quick, done every time. You'd never rebuild the whole set between scenes, and you'd never skip resetting the props.
:::

## Code walkthrough

**Full source:** [`db/db.ts`](/code/week04-nyt/src/db/db-ts) · [`models/products.ts`](/code/week04-nyt/src/models/products-ts) · [`services/product-service.ts`](/code/week04-nyt/src/services/product-service-ts) · [`controllers/product-controllers.ts`](/code/week04-nyt/src/controllers/product-controllers-ts) · [`routes/product-routes.ts`](/code/week04-nyt/src/routes/product-routes-ts) · [`middleware/error-handler.ts`](/code/week04-nyt/src/middleware/error-handler-ts) · [`app.ts`](/code/week04-nyt/src/app-ts) · [`index.ts`](/code/week04-nyt/src/index-ts) · [`products.test.ts`](/code/week04-nyt/src/__tests__/products-test-ts)

Following one request, `POST /products`, **top to bottom** through the layers:

### Route: map the endpoint

```ts
// routes/product-routes.ts
export const productRouter = express.Router();
productRouter.get('/', productControllers.getProducts);
productRouter.post('/', productControllers.addProduct);   // that's the whole job
```

### Controller: speak HTTP

```ts
// controllers/product-controllers.ts
const addProduct = async (req: Request, res: Response): Promise<void> => {
  const postData = req.body;                          // read the request
  const { id } = await productService.add(postData);  // ask the service
  res.status(201).json({ id });                       // choose status + send
};
```

It responds with only the `id` because that's the one thing the client didn't already know: Mongo generated it.

### Service: application logic

```ts
// services/product-service.ts
const add = async (productInfo: ProductFields): Promise<Product> => {
  const { insertedId } = await db.addToCollection(db.PRODUCTS, productInfo);
  return productFromFields({ ...productInfo, id: insertedId.toString() });   // spread + override
};
```

The service knows about `db` and the model, but nothing about `Request`, `Response`, or status codes.

### Model: what a product *is*

```ts
// models/products.ts
export type Product = { id: string; modelName: string; /* … */ price: number; quantity: number };

export const productFromDocument = (productDocument: Document): Product => ({
  id: productDocument._id.toString(),       // ObjectId → string; _id never leaves this layer
  modelName: productDocument.modelName,
  /* … */
});

export type ProductFields = Partial<Product>;   // "some of the fields"

export const productFromFields = (fields: ProductFields): Product => ({
  id: fields.id ?? String(Date.now()),
  modelName: fields.modelName ?? '',
  /* … */
  price: fields.price ?? 0.0,
  quantity: fields.quantity ?? 0,
});
```

The notes chose `type` over `interface` here "for cleaner syntax", and `ProductFields` *has* to be a `type` because `Partial<Product>` is computed ([Page 0 decision guide](/foundations#decision-guide)).

### DB: talk to MongoDB

```ts
// db/db.ts
let mongoClient: MongoClient | null = null;   // null = "not connected yet"
let theDb: Db;

const addToCollection = async (collectionName: string, docData: Document): Promise<InsertOneResult> => {
  if (!mongoClient) {          // guard: connect on first use
    await init();
  }
  return await theDb.collection(collectionName).insertOne(docData);
};

export const db = { init, getAllInCollection, addToCollection, PRODUCTS };
```

- Exporting one `db` object (`db.init`, `db.PRODUCTS`) groups the layer's public surface, so everything not in it stays private to the file.
- `PRODUCTS = 'products'` is a named constant, so a typo like `'prodcuts'` can't silently create a new collection.
- The notes point out that returning `InsertOneResult` "leaks some Mongo knowledge up to the service layer". A stricter design would return just the new id.

### A second trip down the stack: `GET /products/:id`

Now You Try #1, as it ended up in my code. Each layer adds one small piece:

```ts
// routes/product-routes.ts: pass the controller itself; Express calls it with (req, res)
productRouter.get('/:id', productControllers.getProductById);

// controllers/product-controllers.ts: the only layer that knows about 404
const getProductById = async (req: Request, res: Response): Promise<void> => {
  const product = await productService.getProductById(String(req.params.id));
  if (!product) {
    res.status(404).send({ error: `Not found: no product with id of ${req.params.id}` });
    return;
  }
  res.json(product);
};

// services/product-service.ts: "a product or nothing", no HTTP
const getProductById = async (id: string): Promise<Product | null> => {
  const productDoc = await db.getThroughID(id, db.PRODUCTS);
  if (!productDoc) return null;
  return productFromDocument(productDoc);        // _id → id
};

// db/db.ts: MongoDB only
const getThroughID = async (id: string, collectionName: string): Promise<Document | null> => {
  if (!mongoClient) await init();
  if (!ObjectId.isValid(id)) return null;        // "abc" would make new ObjectId() throw
  return await theDb.collection(collectionName).findOne({ _id: new ObjectId(id) });
};
```

The **model** layer needed no change: `productFromDocument` already does the conversion.

### The test file

`src/__tests__/products.test.ts` follows the lecture's setup: MongoMemoryServer in `beforeAll`, clear and seed two coffee makers in `beforeEach`, and disconnect and stop in `afterAll`. It needed two test-only helpers in `db.ts`:

```ts
const disconnect = async (): Promise<void> => {
  if (mongoClient) { await mongoClient.close(); mongoClient = null; }
};
const _clearCollection = async (collectionName: string): Promise<void> => {
  await theDb.collection(collectionName).deleteMany({});
};
export const db = { init, getAllInCollection, addToCollection, getThroughID, disconnect, _clearCollection, PRODUCTS };
```

Current results:

```text
✓ lists the products that are in the database
✓ lists the products that are in the database        ← same test twice (copy-paste)
✓ POST /products › adds a product we can then read back
× POST /products › should accept a post with missing fields    ← real bug, see below
✓ GET /products/:id › finds a product through an id  ← empty body: passes without testing anything
```

### App and server

```ts
// app.ts
app.use(express.json());
app.use('/products', productRouter);
app.use(errorHandler);            // LAST, after every route (Week 2)

// index.ts
await db.init();                  // connect, then…
app.listen(port, () => { … });    // …open the port
```

## Readings summary

### Microsoft: Web API design best practices

A long reference guide for designing RESTful HTTP APIs. The core points:

- **Organize around resources, named with nouns.** `/orders`, not `/create-order`, because the HTTP method already supplies the verb. Use **plural** names for collections, and a hierarchy for items (`/customers/5`).
- **Relationships** can appear in the URI (`/customers/5/orders`), but avoid anything deeper than *collection/item/collection*.
- **Don't mirror the database.** Clients shouldn't see your internal table (or collection) structure.
- **Avoid "chatty" APIs** made of many tiny resources that force clients into lots of requests.
- **Use the methods as HTTP defines them**, with a table of what GET, POST, PUT, and DELETE mean on a collection vs. an item.
- **PUT must be idempotent**, while POST and PATCH needn't be.
- **Status codes per method.** GET gives 200 or 404. A POST that creates gives **201**, ideally with the new resource's location. 400 means bad client data, and 405 means that method isn't supported on that URI.
- Beyond the basics: pagination and filtering through query strings, versioning strategies, and linking related resources in responses (HATEOAS).

**Connection to lecture:** the lecture's three-step design (entities → representations → endpoints) and its endpoint table follow these rules directly, as does the model layer's `_id` → `id` renaming ("don't mirror the database").

### Stack Overflow Blog: Best practices for REST API design

::: warning Not summarized yet
This reading isn't in the course folder. Add a summary here once you've read it, or export it as a PDF for the notebook.
:::

### Corey Cleary: Project structure for an Express REST API

::: warning Not summarized yet
This reading isn't in the course folder. Add a summary here once you've read it. It's the source for the routes → controllers → services layout this week builds.
:::

## Gotchas & common mistakes

- **Putting HTTP in the service.** A service that calls `res.status(404)` or imports `Request` breaks the layering. Return `null` (or throw) and let the controller choose the status.
- **Letting `_id` escape.** Returning raw documents from the service leaks MongoDB details to clients. Always pass them through `productFromDocument`.
- **POST stores whatever the client sends.** `productService.add(req.body)` inserts the body as-is, including unexpected fields. The notes say the model converter "is also where error checking and validation would go", and none has been added yet.
- **Defaults applied after saving never reach the database.** `productFromFields` runs *after* the insert in `service.add`, so missing fields stay missing in MongoDB. This is exactly what the [incomplete-product test](#nyt-incomplete-product-test) catches. Apply defaults *before* inserting.
- **`res.json` silently drops `undefined` fields.** A missing `color` doesn't show up as `"color": null`; it's just absent from the JSON, which is why the test saw `undefined`.
- **Swapped arguments compile fine.** `getThroughID(db.PRODUCTS, id)` vs `(id, db.PRODUCTS)`: both are strings, so TypeScript can't tell them apart. The result is a quiet "always 404".
- **A test with no `expect` always passes.** An empty `it(...)` block shows up green and checks nothing.
- **Copy-pasted tests.** Two identical tests add nothing and can only fail together.
- **`insertOne` modifies its argument.** The driver adds an `_id` to the object you pass in, so after `addToCollection(db.PRODUCTS, productInfo)`, `productInfo` has an `_id` too. It's harmless here because `productFromFields` copies only known fields, but surprising.
- **Every field is empty or 0 after a POST.** Postman's body type is still Text instead of JSON, or `app.use(express.json())` is missing.
- **"Nothing for 30 seconds, then an error".** `mongod` isn't running.
- **`Cannot POST /products`.** The method is wrong, or the route isn't registered.
- **`ECONNREFUSED`.** `npm run dev` isn't running, or it crashed.
- **`toBe` on a whole product object** fails even with identical data. Use `toEqual`.
- **Forgetting `afterAll` teardown.** MongoMemoryServer keeps running until the process exits. Stop what you start.
- **File names.** The notes use `models/product.ts` (singular), but the repo has `models/products.ts`. Imports must match the real file name.

## Now You Try guide

Step-by-step help for this week's three in-class exercises. Each part says what the exercise asks, walks through it layer by layer or test by test, and ends with a **checkpoint** so you know when you're done. Solutions are hidden, so try each step first.

::: tip The one rule for every step
Each layer only talks to the layer **directly below** it. If a step makes you want to import `Request` into a service, or `ObjectId` into a controller, stop: that code belongs in a different layer.
:::

### NYT #1: `GET /products/:id`

**The ask:** return a single product by its id, **200** with one product object if it exists, **404** if it doesn't. ✅ *Done in my code* (see the [walkthrough above](#a-second-trip-down-the-stack-get-products-id)).

The notes' table of what each layer adds:

| Layer | Add | Returns |
|---|---|---|
| `db` | find one document by id | `Document \| null` |
| `models` | nothing: `productFromDocument` already converts | |
| `services` | look it up, convert it | `Product \| null` |
| `controllers` | read `req.params.id`, call the service, choose 200 or 404 | nothing (it sends `res`) |
| `routes` | map `GET /:id` to the controller | |

**Build it bottom-up**, and run `npm run typecheck` after each layer. A red squiggle is much easier to fix one layer at a time.

**Mistakes I actually hit while building it** (useful for next time):

| Symptom | Cause | Fix |
|---|---|---|
| `Expected 2 arguments, but got 1` in the controller | the controller called **itself** instead of the service | call `productService.getProductById(...)` |
| request hangs forever | the controller never sent a response | `res.json(product)`, or 404 |
| always 404, even for a real id | `getThroughID(db.PRODUCTS, id)`: **arguments swapped** | match the signature: `getThroughID(id, db.PRODUCTS)` |
| nothing visible, but the "connect if needed" guard is broken | `await init;` without `()` refers to the function but never calls it. It only worked because `index.ts` had already connected | `await init();` |
| `/products/abc` gives 500 | `new ObjectId('abc')` throws | check `ObjectId.isValid(id)` first |
| route sends a Promise, or "headers already sent" | `res.json(productControllers.getProductById(req.params.id))` in the route | pass the controller itself: `productRouter.get('/:id', productControllers.getProductById)` |

::: warning A design choice to be aware of
My `getThroughID` returns `null` for a malformed id like `abc`, so the API answers **404**. Another defensible answer is **400 Bad Request**: "that isn't even an id". The Week 3 stretch goal leaned toward 400. Either is fine if you pick one and test it. See [Practice problem 3](#problem-3-400-or-404-for-a-malformed-id).
:::

**Checkpoint** (in Postman, with `npm run dev` and `mongod` running):

1. `GET /products/<an id copied from GET /products>` → **200**, and the body is **one object**, not an array.
2. `GET /products/aaaaaaaaaaaaaaaaaaaaaaaa` → **404** (well-formed, but not in the database).
3. The product has `id`, a string, and **no `_id`**.

### NYT #1 stretch: `DELETE /products/:id`

**The ask:** same five layers and same 404 question, plus a decision: what does a *successful* delete return? The notes accept **200 with a body** (like `{ status: 'success' }`) or **204 No Content**.

<details class="hint">
<summary>Hint: what each layer returns</summary>

- **db:** `deleteOne(...)` gives `{ deletedCount }`. Return just the number, so no Mongo type leaks upward.
- **service:** turn that into a `boolean`, "was something deleted?".
- **controller:** `true` → 204 (or 200), `false` → 404.
- You can't name a function `delete`, because it's a reserved word in JavaScript. Use `deleteProductById`, `remove`, etc.

</details>

<details>
<summary>Solution, matching my naming style</summary>

```ts
// db/db.ts
const deleteThroughID = async (id: string, collectionName: string): Promise<number> => {
  if (!mongoClient) await init();
  if (!ObjectId.isValid(id)) return 0;
  const result = await theDb.collection(collectionName).deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount;
};
export const db = { /* …existing… */ deleteThroughID };

// services/product-service.ts
const deleteProductById = async (id: string): Promise<boolean> => {
  const deletedCount = await db.deleteThroughID(id, db.PRODUCTS);
  return deletedCount === 1;
};
export const productService = { getAll, add, getProductById, deleteProductById };

// controllers/product-controllers.ts
const deleteProductById = async (req: Request, res: Response): Promise<void> => {
  const deleted = await productService.deleteProductById(String(req.params.id));
  if (!deleted) {
    res.status(404).send({ error: `Not found: no product with id of ${req.params.id}` });
    return;
  }
  res.sendStatus(204);
};
export const productControllers = { getProducts, addProduct, getProductById, deleteProductById };

// routes/product-routes.ts
productRouter.delete('/:id', productControllers.deleteProductById);
```

</details>

**Checkpoint:** delete one product, and `GET /products` should come back one shorter. Refresh Compass and it's gone there too. Deleting the same id again should give **404**.

### NYT #2: Test `GET /products/:id`

**The ask:** turn the NYT #1 checkpoint into automated tests. Add a `describe('GET /products/:id')` block with (1) the product is there → 200 and it's the right one, and (2) the product isn't there → 404. (Class didn't get to this, and my repo has the `describe` block with an empty test in it.)

**Step 1: fill in the empty test first.** `it('finds a product through an id', async () => {})` currently **passes**, because a test with no `expect` can't fail. A green test that checks nothing is worse than no test, since it tells you something works when nothing was checked.

**Step 2: where does a test get a real id?** MongoMemoryServer invents new ids every run, so you can't hard-code one. The notes' hint: **ask a route you already trust.** `GET /products` returns both seeded coffee makers, each with its `id`.

**Step 3: compare the whole object.** It's an object, so use **`toEqual`**, not `toBe`.

<details class="hint">
<summary>Hint: the absent-id test</summary>

You need an id that's **well-formed but absent**: `'a'.repeat(24)` is 24 hex characters and certainly not in a fresh database.

</details>

<details>
<summary>Solution</summary>

```ts
describe('GET /products/:id', () => {
  it('finds a product through an id', async () => {
    const all = await request(app).get('/products');
    const braun: Product = all.body.find((p: Product) => p.manufacturer === 'Braun');

    const res = await request(app).get(`/products/${braun.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(braun);          // same product, every field
    expect(res.body._id).toBeUndefined();     // the model layer did its job
  });

  it('returns 404 for a well-formed id that is not there', async () => {
    const res = await request(app).get(`/products/${'a'.repeat(24)}`);
    expect(res.status).toBe(404);
  });

  it('returns 404 for a malformed id', async () => {        // documents my design choice
    const res = await request(app).get('/products/abc');
    expect(res.status).toBe(404);
  });
});
```

Finding the Braun by `manufacturer` instead of taking `all.body[0]` means the test doesn't depend on the order of results.

</details>

**Also tidy up while you're in the file:** the "lists the products that are in the database" test appears **twice**. Delete one copy, because two identical tests can only ever fail together and add nothing.

**Checkpoint:** `npm test` shows the new tests passing. Then **break the route on purpose**: temporarily make the controller always send 404, and watch the first test go red. That's how you know a test really checks something.

### NYT #2 stretch: Test `DELETE /products/:id`

**The ask:** deleting a product leaves one behind, and deleting an absent id is a 404.

The notes point out what's new here: **the interesting assertion is about a *different* request than the one being tested.** You DELETE, then you ask `GET /products` whether it worked.

<details>
<summary>Solution (needs the DELETE route from the NYT #1 stretch)</summary>

```ts
describe('DELETE /products/:id', () => {
  it('deletes a product, leaving the other one', async () => {
    const before = await request(app).get('/products');
    const target: Product = before.body[0];

    const del = await request(app).delete(`/products/${target.id}`);
    expect(del.status).toBe(204);

    const after = await request(app).get('/products');       // check with a second request
    expect(after.body).toHaveLength(1);
    expect(after.body.map((p: Product) => p.id)).not.toContain(target.id);
  });

  it('returns 404 for an id that is not there', async () => {
    const res = await request(app).delete(`/products/${'a'.repeat(24)}`);
    expect(res.status).toBe(404);
  });
});
```

The `.not.toContain` sits next to a positive `toHaveLength(1)`, following the notes' advice that negative assertions shouldn't stand alone.

</details>

### NYT: Incomplete product test

**The ask:** write a test for POSTing a product that's **missing some fields**. The fields you send should be stored, and the ones you leave out should get the defaults from `productFromFields` (`''` for strings, `0` for numbers).

My test is committed and **fails**:

```text
× POST /products › should accept a post with missing fields
  AssertionError: expected undefined to be ''
  ❯ expect(colors[2]).toBe("");
```

**The test is right, and the app is wrong.** Tracing the request through the layers shows why:

| Step | Layer | What happens |
|---|---|---|
| 1 | controller | passes `req.body` (`{ modelName, modelNumber, manufacturer }`) to `productService.add` |
| 2 | service | `db.addToCollection(db.PRODUCTS, productInfo)` stores the body **as-is**: no `color`, `price`, or `quantity` in MongoDB |
| 3 | service | *then* calls `productFromFields(...)`. The defaults exist **only in the return value**, and the controller only uses its `id` |
| 4 | `GET /products` | reads the stored document with `productFromDocument`, which has no defaults, so `color` is `undefined` |
| 5 | `res.json` | drops `undefined` properties from the JSON, so the test receives `undefined`, not `''` |

::: sticky Real life: the order form that was checked too late
A deli clerk takes your sandwich order and files the ticket in the kitchen **exactly as you wrote it**. *Afterwards*, they fill in "white bread, no cheese" on a **photocopy** that they hand back to you. The kitchen never sees the defaults, so your sandwich comes out with no bread. The defaults have to go on the ticket *before* it's filed.
:::

<details class="hint">
<summary>Hint: where should the defaults be applied?</summary>

In `service.add`, **before** the insert, not after. Build the complete product with `productFromFields`, then store *that*. Watch out for one thing: `productFromFields` also invents an `id` (`String(Date.now())`), and you don't want to store that, since MongoDB makes the real one.

</details>

<details>
<summary>Solution: fix the service</summary>

```ts
// services/product-service.ts
const add = async (productInfo: ProductFields): Promise<Product> => {
  // 1. fill in defaults FIRST; drop the placeholder id (Mongo generates the real one)
  const { id: _placeholderId, ...fields } = productFromFields(productInfo);
  // 2. store the complete product
  const { insertedId } = await db.addToCollection(db.PRODUCTS, fields);
  // 3. hand back the complete product with its real id
  return { ...fields, id: insertedId.toString() };
};
```

Two side benefits: a client can no longer store its own `id` field, and unexpected extra keys in the body (`{ "hacked": true }`) are no longer saved, because `productFromFields` only copies the known fields.

**Alternative:** add `??` defaults in `productFromDocument` instead. The test would pass, but MongoDB would still hold incomplete documents, and anything else reading the database directly (Compass, a future report) would see missing fields. Fixing it at write time keeps the stored data correct.

</details>

<details>
<summary>Solution: a sturdier version of the test</summary>

My version picks the new product with `colors[2]`, which depends on it being third in the list. `GET /products/:id` exists now, so the test can look it up by the id POST returned, and check **both halves** of the requirement in one assertion:

```ts
it('fills in defaults for fields a POST leaves out', async () => {
  const created = await request(app).post('/products').send({
    modelName: 'Whipped Cream',
    modelNumber: 'FR3-80085-900',
    manufacturer: 'halloworlf',
  });
  expect(created.status).toBe(201);
  expect(created.body.id).toMatch(/^[0-9a-f]{24}$/);

  const res = await request(app).get(`/products/${created.body.id}`);
  expect(res.body).toEqual({
    id: created.body.id,
    modelName: 'Whipped Cream',       // provided → kept
    modelNumber: 'FR3-80085-900',
    manufacturer: 'halloworlf',
    color: '',                        // not provided → default
    price: 0,
    quantity: 0,
  });
});
```

`0.0` and `0` are the same number in JavaScript, so `price: 0` is fine.

</details>

**Checkpoint:** with the service fix in place, `npm test` → **all tests pass**. Then temporarily undo the fix: exactly this test should go red again. A test that fails for the bug and passes for the fix is doing its job.

::: info Red is information
The notes end Week 4 with "green is the least informative thing a test suite ever tells you." My failing test is a good example: it's the only one of the five that found something wrong.
:::

## Practice problems

Extra practice beyond the Now You Try exercises.

### Problem 1: `PATCH /products/:id` through all five layers

<p class="practice-meta">⏱ ~25 min · practices: the layers, <code>$set</code>, <code>matchedCount</code>, reusing <code>ProductFields</code></p>

Add a PATCH route that updates only the fields sent, returns **200** with the updated product, or **404** if there's no such id. Don't let the client change `id`.

<details class="hint">
<summary>Hint</summary>

db: `updateOne({ _id }, { $set: changes })` → return `matchedCount`. service: strip `id` from the changes, update, then re-read with `getProductById` so you can return the updated product. controller: `null` → 404.

</details>

<details>
<summary>Solution</summary>

```ts
// db/db.ts
const updateThroughID = async (id: string, collectionName: string, changes: Document): Promise<number> => {
  if (!mongoClient) await init();
  if (!ObjectId.isValid(id)) return 0;
  const result = await theDb.collection(collectionName).updateOne({ _id: new ObjectId(id) }, { $set: changes });
  return result.matchedCount;       // matched, not modified: same values still means "found"
};

// services/product-service.ts
const updateProductById = async (id: string, changes: ProductFields): Promise<Product | null> => {
  const { id: _ignored, ...allowed } = changes;              // never let the client change id
  const matched = await db.updateThroughID(id, db.PRODUCTS, allowed);
  if (matched === 0) return null;
  return await getProductById(id);                           // read back the updated product
};

// controllers/product-controllers.ts
const updateProductById = async (req: Request, res: Response): Promise<void> => {
  const product = await productService.updateProductById(String(req.params.id), req.body);
  if (!product) {
    res.status(404).send({ error: `Not found: no product with id of ${req.params.id}` });
    return;
  }
  res.json(product);
};

// routes/product-routes.ts
productRouter.patch('/:id', productControllers.updateProductById);
```

</details>

### Problem 2: Test PATCH

<p class="practice-meta">⏱ ~15 min · practices: "only the sent fields changed"</p>

Test that PATCHing `{ price: 79.99 }` on a seeded product changes the price and **nothing else**.

<details>
<summary>Solution</summary>

```ts
it('changes only the fields sent', async () => {
  const all = await request(app).get('/products');
  const original: Product = all.body[0];

  const res = await request(app).patch(`/products/${original.id}`).send({ price: 79.99 });

  expect(res.status).toBe(200);
  expect(res.body).toEqual({ ...original, price: 79.99 });   // spread: everything else identical
});
```

`{ ...original, price: 79.99 }` builds the exact expected object from the original, so one `toEqual` checks both "price changed" and "nothing else did".

</details>

### Problem 3: 400 or 404 for a malformed id?

<p class="practice-meta">⏱ ~15 min · practices: status-code design, middleware, which layer decides</p>

Change the API so `/products/abc` returns **400 Bad Request** instead of 404, for GET, PATCH, and DELETE, without editing each controller. Where should that check live?

<details>
<summary>Solution</summary>

"Is this even a valid id?" is a question about the **request**, and it's shared by several routes, so it fits **middleware** (Week 2):

```ts
// middleware/validate-id.ts
import type { NextFunction, Request, Response } from 'express';

export const validateId = (req: Request, res: Response, next: NextFunction): void => {
  if (!/^[0-9a-f]{24}$/.test(String(req.params.id))) {
    res.status(400).send({ error: `Invalid id: ${req.params.id}` });
    return;
  }
  next();
};

// routes/product-routes.ts
productRouter.get('/:id', validateId, productControllers.getProductById);
productRouter.patch('/:id', validateId, productControllers.updateProductById);
productRouter.delete('/:id', validateId, productControllers.deleteProductById);
```

The `ObjectId.isValid` check in `db.ts` can stay as a safety net. Update the "malformed id" test from NYT #2 to expect `400`.

</details>

### Problem 4: Design the orders endpoints

<p class="practice-meta">⏱ ~10 min · practices: REST naming, methods, status codes (no code)</p>

A client needs to: (a) see all of customer 7's orders, (b) place a new order for customer 7, (c) mark order 42 as shipped, (d) cancel (remove) order 42. Write the method + path for each and the success status code. Avoid verbs in paths.

<details>
<summary>Solution</summary>

| Need | Endpoint | Success |
|---|---|---|
| (a) | `GET /customers/7/orders` | 200 |
| (b) | `POST /customers/7/orders` | 201 + the new order's id |
| (c) | `PATCH /orders/42` with `{ "status": "shipped" }` | 200 |
| (d) | `DELETE /orders/42` | 204 (or 200 with a body) |

Not `POST /orders/42/ship` or `/cancelOrder`: "ship" is just a change to the order's `status` field, which PATCH already expresses. (c) and (d) use `/orders/42` rather than `/customers/7/orders/42` to keep URIs no deeper than *collection/item/collection*, as the Microsoft reading advises. The lecture leaves open whether orders are their own collection. This answer assumes they are.

</details>

### Problem 5: Spot the layer violation

<p class="practice-meta">⏱ ~5 min · practices: separation of concerns</p>

What's wrong with this service function, and how would you fix it?

```ts
const getById = async (req: Request, res: Response) => {
  const doc = await db.findById(db.PRODUCTS, String(req.params.id));
  if (!doc) return res.sendStatus(404);
  res.json(doc);
};
```

<details>
<summary>Solution</summary>

It does the **controller's** job (reading `req`, choosing 404, sending `res`) inside the **service**, and it returns a raw MongoDB document with `_id`, skipping the model. The service should take a plain `id: string`, return `Product | null` via `productFromDocument`, and leave every HTTP decision to the controller (exactly the split in [NYT #1](#nyt-1-get-products-id)). As written, it can't be reused outside an HTTP request or tested without faking Express objects.

</details>

## Review questions

**1. What does "representational" in REST mean, and where does the Week 4 code show it?**

<details>
<summary>Answer</summary>

The server never sends the resource itself, only a **representation** of it (here, JSON). It keeps the real thing, and the representation can differ from how it's stored. `productFromDocument` shows this: MongoDB stores `_id: ObjectId(…)`, and the API's representation has `id: "…"` instead.

</details>

**2. Why is `POST /products` better than `POST /createProduct`? What about `GET /getAllProducts`?**

<details>
<summary>Answer</summary>

REST endpoints are **nouns** naming resources, and the **HTTP method is the verb**. `POST /products` already says "create in the products collection", so `createProduct` repeats it in a non-standard way. Likewise, `GET /products` already means "get all products". Consistent noun-based URIs are what make an API predictable (the "uniform interface").

</details>

**3. In the layered design, which layer decides to return 404 for a missing product, and why that one?**

<details>
<summary>Answer</summary>

The **controller**. 404 is an HTTP concept, and the controller is the only layer that deals with HTTP (`Request`/`Response`). The service just reports "a product or nothing" (`Product | null`), which keeps it reusable and testable without Express.

</details>

**4. What's the difference between `fields.quantity ?? 0` and `fields.quantity || 0`?**

<details>
<summary>Answer</summary>

`??` substitutes `0` only when `quantity` is `null` or `undefined`. `||` substitutes it for *any* falsy value, including a real `0`, `''`, or `false`. The results match here only by coincidence (both give 0). With a non-zero default like `?? 10`, `||` would wrongly turn a deliberate `0` into `10`.

</details>

**5. Why does the GET test seed data with `db.addToCollection` instead of calling `POST /products`?**

<details>
<summary>Answer</summary>

The thing under test is the **GET** route. If setup went through POST, a bug in POST would make the GET test fail, pointing you at the wrong code. Seeding through the db layer keeps each test's failure pointing at the code it's actually testing.

</details>

**6. Supertest tests all pass, but the real server fails to start. How is that possible?**

<details>
<summary>Answer</summary>

Tests import `app` from `app.ts` and never run `index.ts`, the file that calls `db.init()` and `app.listen()`. A bug there (a missing `await db.init()`, a wrong port) isn't covered by the suite. That's why the notes suggest checking the real server with Postman at least once.

</details>
