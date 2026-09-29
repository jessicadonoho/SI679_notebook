---
title: "Week 3: MongoDB & Testing with a Database"
description: NoSQL and document databases, CRUD with the MongoDB Node driver, wiring Mongo into Express, Vitest matchers, and isolated tests with MongoMemoryServer.
---

# Week 3: MongoDB & Testing with a Database

**Lecture notes:** *Week 03: Mongo DB* (Sept 22) · **In-class code:** [Week 3 NYT (MongoDB + Vitest)](/code/week03-nyt/)

## Overview

Until now, the servers kept their data in a plain array in memory (`catalog`, `orders`), so every restart wiped it out. This week adds a real **database**: a program whose whole job is to store data **persistently** (it survives restarts) and let you search and change it efficiently. The course uses **MongoDB**.

The week has three parts:

1. **What MongoDB is**, and how a "NoSQL" document database differs from the SQL databases you may have used before.
2. **CRUD from TypeScript.** First you experiment in a scratch file (`db-explore.ts`), then you build a proper `db.ts` module and an Express router on top of it.
3. **Testing against a database.** Tests that write to a real database pile up leftover data, so the notes introduce **MongoMemoryServer**, a throwaway database just for tests. (Class ran out of time here; Week 4 picks it back up.)

Why it matters: almost every backend's core job is safely reading and writing a database on behalf of clients. The pattern from this week (a small module of database functions, with routes that call them and never touch the database directly) is the start of the layered design you'll formalize in Week 4.

## Key concepts

### SQL vs. NoSQL

A **relational (SQL) database** stores data in **tables** with fixed columns, like spreadsheets that are linked to each other. It's queried with the SQL language, and it's excellent when data is highly **relational**: many kinds of things linked together, as in the lecture's social-network diagram of users, posts, likes, and friendships.

**NoSQL** is an umbrella term for databases that *don't* use the relational table model. The lecture gives three reasons to choose one:

| Argument | What it means |
|---|---|
| **Scalability** | Data is stored in unrelated batches, so it's easier to spread across many machines when it grows too big for one. |
| **Flexibility** | There's no fixed schema to define up front. You can change the shape of your data without a painful "migration" of existing tables. |
| **Simplicity** | The data looks like JSON. If you know JSON, you can read and write it without learning SQL. |

### Documents, collections, and fields

MongoDB is a **document-oriented** NoSQL database. Its vocabulary maps roughly onto SQL's:

| MongoDB | Is roughly a SQL… | What it is |
|---|---|---|
| **Collection** | table | a named group of related documents, e.g. `products` |
| **Document** | row | one record, a JSON-like object: `{ name: "Eggs", price: 6.99 }` |
| **Field** | column | one key–value pair inside a document |

Unlike a SQL row, a document can contain **nested arrays and objects**, and two documents in the same collection don't have to have the same fields. (The Now You Try's `markOnSaleTest()` adds `onSale: true` to only *some* products.)

::: sticky Real life: spreadsheet vs. folder of index cards
A SQL table is a **spreadsheet**: every row has exactly the same columns, and adding a column changes the whole sheet. A MongoDB collection is a **folder of index cards**: each card (document) holds whatever you write on it. Most cards in the "products" folder look alike, but one can have an extra "On sale!" line, and nothing breaks.
:::

### BSON and `ObjectId`

MongoDB stores documents in **BSON** ("Binary JSON"). It looks like JSON but supports more data types than JSON's handful, such as dates, regular expressions, and binary data. The Node driver converts between JavaScript values and BSON for you, so you rarely think about it. **Field names are always strings.**

Every document gets a unique **`_id`** field. Unless you supply one yourself (you usually shouldn't), MongoDB generates an **`ObjectId`**: a 24-character hexadecimal value like `68bf9cae04ffbba55ba70cbf`. It's a special type, not a plain string, so to search by id you have to convert:

```ts
import { ObjectId } from 'mongodb';
collection.findOne({ _id: new ObjectId('68bf9cae04ffbba55ba70cbf') });   // ✅
collection.findOne({ _id: '68bf9cae04ffbba55ba70cbf' });                 // ❌ matches nothing
```

::: sticky Real life: the package tracking number
An `ObjectId` is a **tracking number** that the shipping company prints on your package the moment it's created. You don't choose it, and it's unique. To look a package up, you need the tracking number in the exact format the system expects. Reading the digits aloud over the phone (a plain string) doesn't count as scanning the label (`new ObjectId(...)`).
:::

### Tools: `mongod`, Compass, `mongosh`

- **`mongod`** is the MongoDB **server** program. It must be running (by default at `mongodb://127.0.0.1:27017`) before your code can connect.
- **Compass** is a desktop GUI for browsing databases, collections, and documents. It's handy for checking what your code actually wrote.
- **`mongosh`** is the command-line shell for MongoDB (`use week3db`, `db.createCollection("products")`, `db.products.find()`).

The lecture creates a `week3db` database with a `products` collection in either tool before writing any code.

### Connecting from Node

The **MongoDB Node driver** (the `mongodb` npm package) is the library your code uses to talk to `mongod`. The connection pattern:

```ts
import { MongoClient } from 'mongodb';
import type { Db } from 'mongodb';

let client: MongoClient;
let db: Db;

const connect = async () => {
  client = new MongoClient('mongodb://127.0.0.1:27017');  // the server's address (a URI)
  await client.connect();                                  // open the connection
  db = client.db('week3db');                               // choose a database on that server
};

const disconnect = async () => { await client.close(); };
```

A **URI** (Uniform Resource Identifier) here is the address string that says where the database server is. `MongoClient` is a value (a class you construct), while `Db` and `Document` are only types, so they come in through `import type` ([Page 0](/foundations#modules-import-export)).

### CRUD operations

**CRUD** stands for the four basic things you do with stored data: **C**reate, **R**ead, **U**pdate, **D**elete. Each has driver methods, and every one of them is `async`, so you `await` it:

| | Method | Returns |
|---|---|---|
| **Create** | `insertOne(doc)` / `insertMany([docs])` | `{ acknowledged, insertedId }` / `{ insertedCount, insertedIds }` |
| **Read** | `find(query)` / `findOne(query)` | a **cursor** / the first matching document or `null` |
| **Update** | `updateOne(query, update)` / `updateMany(...)` | `{ matchedCount, modifiedCount, … }` |
| **Delete** | `deleteOne(query)` / `deleteMany(query)` | `{ deletedCount }` |

**Queries** are objects that describe what to match. `{ name: 'Duct Tape' }` means "name equals Duct Tape". **Query operators** (keys starting with `$`) express other comparisons:

```ts
{ price: { $lt: 5.0 } }    // price less than 5
{ price: { $gte: 5.0 } }   // price greater than or equal to 5
{}                         // matches every document
```

**Updates** use **update operators**. `$set` replaces or adds the listed fields and leaves the others alone, and `$inc` adds to a number:

```ts
await products.updateOne({ name: 'Duct Tape' }, { $set: { quantity: 150 } });
```

::: sticky Real life: correcting one line on a form
`$set` is taking a filled-in form and **correcting just the phone-number line** with white-out: every other line stays as it was. Without an operator you'd be handing over a brand-new form that must be filled in completely (that's what `replaceOne` does).
:::

### Cursors

`find()` doesn't hand you an array. It returns a **cursor**: an object that fetches matching documents from the database a batch at a time as you ask for them. You can walk it one document at a time, or collect everything with `toArray()`:

```ts
// walking it (db-explore.ts)
while (await cursor.hasNext()) {
  const doc = await cursor.next();   // typed Document | null
  if (doc) results.push(doc);        // the `if` satisfies strict null checks
}

// or, much shorter (db.ts)
const all = await collection.find().toArray();
```

::: sticky Real life: the deli ticket machine
A cursor is like the "now serving" counter at a deli: it doesn't bring all the customers to the counter at once. It calls **the next one** each time you're ready (`next()`) and tells you whether anyone is still waiting (`hasNext()`). `toArray()` is calling everyone up at once, which is fine when the line is short.
:::

### A database layer for Express

After experimenting, the lecture moves the database code into its own module, `db.ts`. It exports small, named functions (`getAllProducts`, `getProduct(id)`, `addProduct`, `updateProduct`, `deleteProduct`), and a router, `product-router.ts`, calls them. The router never touches MongoDB directly.

Two design choices worth noticing:

- **`connect(uri, dbName)` takes parameters** instead of hard-coding them, so tests can point the same code at a different database.
- **`index.ts` connects *before* `app.listen()`**, and `app.ts` never connects at all. The server shouldn't accept requests it can't serve, and tests import `app` without a real database connection.

### Vitest matchers

A **matcher** is the method after `expect(...)` that states what should be true. The ones used this week:

| Matcher | Checks | Use for |
|---|---|---|
| `toBe(x)` | same value, like `===` | primitives: numbers, strings, booleans |
| `toEqual(x)` | same contents, compared field by field | objects and arrays |
| `toMatch(/regex/)` | a string matches a pattern | values you can't predict, like generated ids |
| `toHaveLength(n)` | `.length` is `n` | arrays and strings |
| `toContain(x)` | an array includes `x` (using `===`) | lists of primitives |
| `.not` | inverts the matcher that follows | `expect(names).not.toContain('Masking Tape')` |

A **regular expression** (regex) is a pattern for matching text. `/^[0-9a-f]{24}$/` means "exactly 24 characters, each a digit or a–f", which is the shape of an ObjectId.

### The dirty-database problem and MongoMemoryServer

The first test in the notes connects to a real (test) database, POSTs a product, and expects exactly one product back. It passes once, then **fails on the second run**, because the first run's product is still there. Tests that share a persistent database interfere with each other.

**MongoMemoryServer** (the `mongodb-memory-server` package) starts a real, temporary `mongod` just for the test run and deletes it afterward. It gives you a URI like any database, so your `connect()` doesn't know the difference. Inside one run, tests can still leave data behind for each other, so **Vitest hooks** reset things:

| Hook | Runs | Typical use |
|---|---|---|
| `beforeAll` | once, before the first test | start MongoMemoryServer, connect |
| `beforeEach` | before every test | `_clearProducts()`, for a known starting state |
| `afterEach` | after every test | undo what a single test did |
| `afterAll` | once, after the last test | disconnect, stop the server |

::: sticky Real life: the flight simulator
Pilots don't practice emergency landings in a real plane full of passengers. A **flight simulator** looks and responds exactly like the real cockpit, but nothing is at stake, and it resets to the same starting conditions every session. MongoMemoryServer is a flight simulator for your database: your code can't tell the difference, and the real data (the passengers) is never touched.
:::

## Code walkthrough

**Full source:** [`db-explore.ts`](/code/week03-nyt/src/db-explore-ts) · [`db.ts`](/code/week03-nyt/src/db-ts) · [`product-router.ts`](/code/week03-nyt/src/product-router-ts) · [`app.ts`](/code/week03-nyt/src/app-ts) · [`index.ts`](/code/week03-nyt/src/index-ts) · [`products.test.ts`](/code/week03-nyt/src/__tests__/products-test-ts) · [`vitest.config.ts`](/code/week03-nyt/vitest-config-ts) · [`SETUP.md`](/code/week03-nyt/SETUP-md)

### `db-explore.ts`: trying out CRUD

A scratch script, run with `npm run explore` (`tsx watch`, which reruns on every save). A `main()` function connects, runs one experiment, logs the result, and disconnects. You switch experiments by uncommenting a line. My Now You Try #1 solutions are at the bottom:

```ts
const findPricierTest = async () => {
  const results: Document[] = [];
  const query = { price: { $gte: 5.0 } };          // $5 or more
  const cursor = db.collection('products').find(query);
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    if (doc) results.push(doc);
  }
  return results;
};

const updatePriceTest = async () => {
  const query = { name: 'Scotch Tape' };
  const update = { $set: { price: 4.29 } };
  return await db.collection('products').updateMany(query, update);
};

const markOnSaleTest = async () => {                // stretch
  const query = { price: { $lt: 5.0 } };
  const update = { $set: { onSale: true } };       // adds a field only these docs have
  return await db.collection('products').updateMany(query, update);
};
```

`updatePriceTest` uses `updateMany`, which changes *every* Scotch Tape. The exercise said "the price of Scotch Tape" (one product), so `updateOne` is the closer match. With one Scotch Tape in the collection, the result is the same.

### `db.ts`: the database layer

```ts
let client: MongoClient;
let productsCollection: Collection;

export const connect = async (uri: string, dbName: string) => {   // parameters → testable
  client = new MongoClient(uri);
  await client.connect();
  productsCollection = client.db(dbName).collection('products');
};

export const getProduct = async (id: string) => {
  return await productsCollection.findOne({ _id: new ObjectId(id) });  // string → ObjectId
};

export const updateProduct = async (id: string, changes: ProductUpdate) => {
  const result = await productsCollection.updateOne({ _id: new ObjectId(id) }, { $set: changes });
  return result.matchedCount;           // 0 means "no such product" → the router sends 404
};

export const deleteProduct = async (id: string) => {
  const result = await productsCollection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount;           // 0 → 404
};

// Only for tests. Never called by the app.
export const _clearProducts = async () => {
  await productsCollection.deleteMany({});   // {} matches everything
};
```

- Each function returns a **simple value** (an id, a count, a document) rather than MongoDB's full result object, so the router only has to check a number.
- `updateProduct` returns **`matchedCount`**, not `modifiedCount`. If a PATCH sets a field to the value it already has, `modifiedCount` is 0 even though the product exists. `matchedCount` correctly means "found it".
- `ProductUpdate` is an interface with every field optional, and the comment notes it's the same as `Partial<Product>` ([Page 0](/foundations#what-only-type-can-do) covers why that version must be a `type`).

### `product-router.ts`: CRUD over HTTP

```ts
productRouter.get('/:id', async (req: Request, res: Response) => {
  const product = await getProduct(String(req.params.id));   // params are string | string[]
  if (!product) {                                             // findOne → null when missing
    res.sendStatus(404);
    return;
  }
  res.json(product);
});

productRouter.post('/', async (req: Request, res: Response) => {
  const product: Product = {            // copy only the known fields out of the body
    name: req.body.name,
    price: req.body.price,
    quantity: req.body.quantity,
  };
  const id = await addProduct(product);
  res.status(201).json({ id });         // 201 Created + the new id
});

productRouter.patch('/:id', async (req: Request, res: Response) => {
  const changes: ProductUpdate = req.body;   // ⚠️ see Gotchas
  const matched = await updateProduct(String(req.params.id), changes);
  if (matched === 0) { res.sendStatus(404); return; }
  res.sendStatus(200);
});
```

Together with `DELETE /:id`, that's the full set: **Create** (POST), **Read** (GET `/` and GET `/:id`), **Update** (PATCH), and **Delete**.

### `index.ts`: connect, then listen

```ts
await connect('mongodb://127.0.0.1:27017', 'week3app');   // top-level await (ES module)
app.listen(port, () => console.log(`Server running on port ${port}`));
```

### `products.test.ts` and `vitest.config.ts`

My repo has the **first** version of the test, which uses the live database:

```ts
await connect('mongodb://127.0.0.1:27017', 'week3test');

it('adds a product we can then read back', async () => {
  const created = await request(app).post('/products').send({ name: 'Duct Tape', price: 5.99, quantity: 120 });
  expect(created.status).toBe(201);
  expect(created.body.id).toMatch(/^[0-9a-f]{24}$/);   // shape of an ObjectId

  const all = await request(app).get('/products');
  expect(all.body).toHaveLength(1);                     // ❌ on the 2nd run: data piled up
});
```

This is exactly the dirty-database problem: run it twice and it fails. The fixed MongoMemoryServer version is in the notes and walked through on the [Week 4 page](/weeks/week-04#testing-with-mongomemoryserver).

`vitest.config.ts` raises Vitest's time limits (`hookTimeout: 120_000`, `testTimeout: 20_000`), because starting a database, and downloading it on the first run, takes much longer than Vitest's default 10 seconds for setup code.

## Readings summary

### MongoDB Node.js driver documentation

::: warning Not summarized yet
This reading is the official documentation site for the `mongodb` package, and it isn't in the course folder. Add a summary here once you've read it, or export it as a PDF for the notebook.
:::

**Connection to lecture:** every method used this week (`MongoClient`, `insertOne`, `find`, `findOne`, `updateOne`, `deleteOne`, `toArray`) is documented there. The Week 4 notes point back to its **CRUD** section (Read and Delete) for the Now You Try.

## Gotchas & common mistakes

- **`mongod` isn't running.** The driver waits about 30 seconds, then errors. Start `mongod` (or check the connection in Compass) first.
- **Searching `_id` with a plain string** matches nothing. Wrap it: `new ObjectId(id)`.
- **A malformed id crashes.** `new ObjectId('badID123')` *throws*, because it's not 24 hex characters. In the Week 3 router, that becomes a **500** instead of a helpful 400 or 404. (This is the Now You Try "side quest"; the stretch goal is middleware that returns 400.)
- **Update/delete by name.** `{ name: 'Duct Tape' }` can match several documents. `updateOne`/`deleteOne` pick an arbitrary first one, and the `…Many` versions hit them all. Use `_id` for real updates and deletes.
- **`deleteMany({})` deletes everything.** It's fine in a test helper, and a disaster anywhere else.
- **PATCH trusts the body completely.** `const changes: ProductUpdate = req.body` is only a type annotation ([Page 0: types vanish at runtime](/foundations#a-request-body)). A client can send `{ "price": "free", "hacked": true }` and `$set` will store both. Copy only known fields, and validate their types.
- **POST stores missing fields as absent.** `{ name: req.body.name, … }` with no `price` in the body inserts a document without a price. Nothing checks it yet.
- **`toBe` on objects fails** even when the contents match, because it checks *identity*. Use `toEqual`.
- **Tests against a persistent database** pass once and then fail. Use MongoMemoryServer plus `beforeEach` cleanup.
- **The first MongoMemoryServer run is slow** (it downloads MongoDB). On campus Wi-Fi, a `Download failed … 403` error usually means a blocked network, not a version problem (`SETUP.md`).
- **`@types/node` should match your Node version** (`npm install -D @types/node@^22`), as `SETUP.md` explains.

## Practice problems

### Problem 1: Price range query

<p class="practice-meta">⏱ ~10 min · practices: combining query operators</p>

In `db-explore.ts` style, write `findInPriceRange(min: number, max: number)`, which returns every product with `min <= price <= max`, as an array.

<details class="hint">
<summary>Hint</summary>

One field can have several operators in the same object: `{ price: { $gte: …, $lte: … } }`. And `toArray()` saves you the cursor loop.

</details>

<details>
<summary>Solution</summary>

```ts
const findInPriceRange = async (min: number, max: number) => {
  return await db
    .collection('products')
    .find({ price: { $gte: min, $lte: max } })   // both conditions must hold
    .toArray();
};
```

</details>

### Problem 2: Restock with `$inc`

<p class="practice-meta">⏱ ~10 min · practices: update operators, reading update results</p>

Add `restockProduct(id: string, amount: number)` to `db.ts`. It should increase that product's `quantity` by `amount` **without reading it first**, and return whether a product was found.

<details>
<summary>Solution</summary>

```ts
export const restockProduct = async (id: string, amount: number): Promise<boolean> => {
  const result = await productsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $inc: { quantity: amount } },   // the database does the addition
  );
  return result.matchedCount === 1;
};
```

Doing the math inside MongoDB (`$inc`) instead of "read, add in JS, write back" also avoids a race: two restocks arriving at the same moment can't overwrite each other.

</details>

### Problem 3: Test PATCH (Now You Try #2)

<p class="practice-meta">⏱ ~20 min · practices: MongoMemoryServer hooks, 404 tests, "the other fields didn't change"</p>

Using the MongoMemoryServer setup (`beforeAll` / `beforeEach(_clearProducts)` / `afterAll`), write two tests:
(a) PATCHing a well-formed but non-existent id returns **404**;
(b) a successful PATCH changes **only** the fields sent.

<details class="hint">
<summary>Hint</summary>

A well-formed id that certainly doesn't exist: `'a'.repeat(24)`. For (b), POST a product, PATCH one field, then GET it and compare the whole object with `toEqual`.

</details>

<details>
<summary>Solution</summary>

```ts
describe('PATCH /products/:id', () => {
  it('returns 404 for an id that does not exist', async () => {
    const res = await request(app).patch(`/products/${'a'.repeat(24)}`).send({ price: 1 });
    expect(res.status).toBe(404);
  });

  it('changes only the fields sent', async () => {
    const created = await request(app)
      .post('/products')
      .send({ name: 'Duct Tape', price: 5.99, quantity: 120 });
    const id = created.body.id;

    const patched = await request(app).patch(`/products/${id}`).send({ price: 4.99 });
    expect(patched.status).toBe(200);

    const after = await request(app).get(`/products/${id}`);
    expect(after.body).toEqual({ _id: id, name: 'Duct Tape', price: 4.99, quantity: 120 });
  });
});
```

`_id` comes back as a string because `res.json` converts the `ObjectId` to its hex string when it builds the JSON.

</details>

### Problem 4: Test DELETE

<p class="practice-meta">⏱ ~10 min · practices: checking an action with a second request</p>

Write tests showing DELETE returns **200** and the product is really gone (a follow-up GET gives 404), and that deleting a non-existent id gives **404**.

<details>
<summary>Solution</summary>

```ts
describe('DELETE /products/:id', () => {
  it('deletes an existing product', async () => {
    const { body } = await request(app)
      .post('/products')
      .send({ name: 'Scotch Tape', price: 3.99, quantity: 100 });

    const del = await request(app).delete(`/products/${body.id}`);
    expect(del.status).toBe(200);

    const after = await request(app).get(`/products/${body.id}`);
    expect(after.status).toBe(404);          // the check is a *different* request
  });

  it('returns 404 for an id that does not exist', async () => {
    const res = await request(app).delete(`/products/${'a'.repeat(24)}`);
    expect(res.status).toBe(404);
  });
});
```

</details>

### Problem 5: Validate ids with middleware (stretch)

<p class="practice-meta">⏱ ~20 min · practices: middleware from Week 2, regex, choosing a status code</p>

Write middleware that rejects any `:id` that isn't 24 lowercase hex characters, before it reaches `new ObjectId()`. Which status code should it send? Attach it to every `/:id` route.

<details>
<summary>Solution</summary>

```ts
// validate-id.ts
import type { Request, Response, NextFunction } from 'express';

export const validateId = (req: Request, res: Response, next: NextFunction): void => {
  const { id } = req.params;
  if (typeof id !== 'string' || !/^[0-9a-f]{24}$/.test(id)) {
    res.status(400).json({ error: 'id must be 24 hexadecimal characters' });
    return;
  }
  next();
};

// product-router.ts
productRouter.get('/:id', validateId, async (req, res) => { … });
productRouter.patch('/:id', validateId, async (req, res) => { … });
productRouter.delete('/:id', validateId, async (req, res) => { … });
```

**400 Bad Request**: the client sent something malformed. It's different from **404**, which means well-formed, but there's no such product. Test it with `request(app).get('/products/badID123')` and `expect(res.status).toBe(400)`.

</details>

## Review questions

**1. Map these SQL terms to MongoDB terms: table, row, column. Name one thing a MongoDB document can do that a SQL row typically can't.**

<details>
<summary>Answer</summary>

Table → **collection**, row → **document**, column → **field**. A document can contain **nested objects and arrays**, and documents in the same collection don't need identical fields (no fixed schema).

</details>

**2. Why does `findOne({ _id: '68bf9cae04ffbba55ba70cbf' })` find nothing, and what's the fix?**

<details>
<summary>Answer</summary>

`_id` is stored as an **`ObjectId`**, not a string, and a string never equals an ObjectId. Convert first: `findOne({ _id: new ObjectId(id) })`. (If `id` isn't 24 hex characters, `new ObjectId` throws, so validate before converting.)

</details>

**3. `updateProduct` returns `matchedCount`. Why is that better than `modifiedCount` for deciding whether to send 404?**

<details>
<summary>Answer</summary>

`matchedCount` says whether a document with that id **exists**. `modifiedCount` says whether anything **changed**. A PATCH that sets a field to its current value matches 1 but modifies 0, and treating that as 404 would be wrong, because the product is there.

</details>

**4. Why does the live-database test pass the first time and fail the second? How does MongoMemoryServer plus `beforeEach` fix it?**

<details>
<summary>Answer</summary>

The first run inserts "Duct Tape" into `week3test`, and it's still there on the next run, so the "exactly one product" assertion sees two. MongoMemoryServer gives each **run** a fresh, empty, temporary database that vanishes afterward. `beforeEach(_clearProducts)` empties the collection before each **test**, so tests inside one run don't leak into each other.

</details>

**5. When should you use `toBe` vs. `toEqual`?**

<details>
<summary>Answer</summary>

`toBe` checks **identity** (like `===`), so use it for primitives: status codes, strings, booleans. `toEqual` compares **contents** recursively, so use it for objects and arrays. Two separately created objects with identical fields are `toEqual` but not `toBe`.

</details>
