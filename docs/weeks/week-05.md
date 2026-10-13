---
title: "Week 5: Testing (E2E, Unit, Mocks & Spies)"
description: The cleaned-up layers (repositories, business logic, layer guarantees), custom errors, e2e tests with MongoMemoryServer, and unit tests with Vitest fakes, mocks, and spies.
---

# Week 5: Testing (E2E, Unit, Mocks & Spies)

**Lecture notes:** *Week 05 · Testing* (Oct 6) · **Reading:** *Mock Functions* (Vitest guide) · **In-class code:** [Week 5 NYT (testing)](/code/week05-nyt/)

::: info Where my Week 5 code stands
- **NYT #1 (e2e tests for PATCH): all three done** and passing: negative price, other fields left alone, product unchanged after a rejected change.
- **Still a `todo`:** `404s when the id is not in the database`, the test the class wrote together (Test #3). [Solution below](#test-3-the-404-written-together).
- **NYT #2 (unit tests): not started.** `src/services/products-services.unit.test.ts` has its imports and `beforeEach` but no tests yet, so Vitest reports **`No test suite found`** and counts the file as a failure. That means `npm test` is red right now (17 passed, 1 todo, 1 failed file) even though no test has actually failed. [Explained in the gotchas](#gotchas-common-mistakes).

The [Now You Try guide](#now-you-try-guide) walks through all of it.
:::

::: tip What this week covers
In class we only worked in the **test files**. But the tests check *promises the layers make*, so this page starts with the cleaned-up layers (the repository, the service's business logic, and how errors become status codes). You need those to know **what** to test. The testing tools come second.
:::

## Overview

Week 4 built a layered `/products` API and checked it with a few end-to-end tests. Week 5 starts from a **finished, cleaned-up** version of that API and asks: how do you *prove* each piece does its job?

The lecture has three parts:

1. **Layers, revisited.** The instructor reorganized the code after Week 4. Translating between MongoDB and the app moved into a **repository** in the db layer, models became plain types, and the service became the home of **business logic**. Each layer now makes a clear **guarantee**.
2. **End-to-end (e2e) tests** with Supertest and MongoMemoryServer, for the new `PATCH /products/:id` route: the happy path, the business rules, the 404, and checking that a rejected change wrote nothing.
3. **Unit tests**: testing one function alone by replacing its neighbors with **fakes, mocks, and spies** (`vi.fn`, `vi.spyOn`).

Why it matters: e2e tests tell you *that* something is broken. Unit tests tell you *where*. HW2 starts from this same layered structure, and the final project expects some test coverage.

::: info Announcements (Oct 6)
- **HW2 is out**, due in **two weeks** (mostly MongoDB and REST architecture). It won't grade your own tests, but the final project will expect some.
- **HW1 solution is delayed**: the HW2 starter solves some HW1 problems differently, so they're working out how to release it.
- **Next weeks:** 10/13 Authentication & Authorization · 10/20 Fall break (HW2 due, HW3 out) · 10/27 Midterm **In-Person Assessments** (15-minute slots where they ask about your submitted HW code; sign-up by 10/16).
:::

## Key concepts

### The app you're given

The starter is a complete API for all five `/products` endpoints. Nothing in it is a TODO. The folder layout:

```text
src/
├── db/            db.ts (the connection), products-repository.ts
├── models/        product.ts (types only)
├── services/      products-service.ts
├── controllers/   products-controller.ts
├── routes/        products-router.ts
├── middleware/    error-handler.ts
├── __tests__/     products.e2e.test.ts, test-products.ts (seed data)
├── errors.ts      ValidationError
├── mocks-and-spies.unit.test.ts
├── app.ts
└── index.ts
```

Test files follow a naming rule: **e2e tests** live in `src/__tests__/` and end in `.e2e.test.ts`. **Unit tests** sit *beside* the file they test and end in `.unit.test.ts` (so `products-service.ts` gets `products-service.unit.test.ts`).

There's **no MongoDB to start** this week. Every test runs against MongoMemoryServer, which the test file starts and stops itself. The first run is slow because MongoMemoryServer downloads a full copy of MongoDB. Later runs reuse it.

### What changed since Week 4

The instructor revised how the db and service layers divide the work (after talking it over with José). The new version is the more common convention, and it's what HW2 uses.

| | Week 4 | Week 5 |
|---|---|---|
| **db layer** | only speaks MongoDB; returns raw documents | a **repository** per entity; returns `Product`s |
| **who converts `_id` → `id`** | the model (`productFromDocument`) | the repository (`toProduct`) |
| **models** | types *and* converter functions | **types only** |
| **service** | converts documents, applies some logic | lives entirely in the app's world: `Product`s in, `Product`s out, plus **business rules** |
| **error handling** | every error → 500 | `ValidationError` → **400**, anything else → 500 |

**Naming now tells you which layer you're in:**

| Layer | Naming style | Examples |
|---|---|---|
| controller | **HTTP verbs** (each one handles a method + path) | `getProducts`, `postProduct`, `patchProduct`, `deleteProduct` |
| service | **CRUD-speak** | `getProduct`, `createProduct`, `updateProduct`, `deleteProduct` |
| repository | **MongoDB-speak** | `findAllProducts`, `findProduct`, `insertProduct`, `updateProduct` |

**CRUD** stands for **C**reate, **R**ead, **U**pdate, **D**elete, the four basic things you can do to stored data. (The service says `get` instead of `read` because "readProduct" sounds odd.) Files are named `<resource>-<layer>.ts`: `products-controller.ts`, `products-service.ts`, `products-repository.ts`.

### The repository pattern

A **repository** is a module that manages one kind of stored thing (here, products) and is the **only** code that knows how those things are stored. Everything above it asks for `Product`s and gets `Product`s back. It never sees a MongoDB `Document`, `ObjectId`, or `InsertOneResult`.

That means all the MongoDB-specific code lives in one folder. If the app moved to a different database, only the repository would change.

```ts
// db/products-repository.ts
const toProduct = (doc: Document): Product => {
  return {
    id: doc._id.toString(),        // ObjectId → string, right here and nowhere else
    modelName: doc.modelName,
    /* … */
    quantity: doc.quantity
  };
};

export const findProduct = async (id: string): Promise<Product | null> => {
  const doc = await getDb().collection(PRODUCTS).findOne({ _id: new ObjectId(id) });
  return doc ? toProduct(doc) : null;
};
```

`db/db.ts` shrank to just the connection: `connect(uri, dbName)`, `disconnect()`, and `getDb()`. `connect` keeps the Week 4 **default parameters**, so `index.ts` calls `connect()` for the real database and tests call `connect(mongo.getUri(), 'test')`.

This matches the [Corey Cleary reading](/weeks/week-04#corey-cleary-project-structure-for-an-express-rest-api) from Week 4, which puts "data access" in a `db` folder and says the real question is *where each type of logic goes*, not what the folders are called.

::: sticky Real life: the librarian
You ask the librarian for "*Dune*" and get the book. You don't know (or care) whether it was in the basement stacks, on a returns cart, or borrowed from another branch. The librarian is the **repository**: the only person who knows the shelving system. If the library reorganizes its basement, nothing changes for you.
:::

### The three product types

The model file, `models/product.ts`, now only declares types. There are three, because a product looks different depending on which way it's moving:

| Type | Has `id`? | Fields required? | Used for |
|---|---|---|---|
| `Product` | yes | all | what comes **out** of the repository and the API |
| `NewProduct` | no | all | what goes **into** an insert (MongoDB makes the id) |
| `ProductFields` = `Partial<Product>` | optional | none | what a client **sends**, which may be partial |

`Partial<T>` is a built-in TypeScript type that makes every field of `T` optional, so `{}`, `{ price: 5 }`, and a full product all count as `ProductFields`.

Types are never "created" or "initialized". A `type` is a compile-time description that TypeScript uses for checking and then deletes. What exists at runtime are **objects with those shapes**:

- `req.body` (parsed by `express.json()`) is passed into the service, where its parameter type labels it `ProductFields`.
- `withDefaults(fields)` in the service turns `ProductFields` into a complete `NewProduct`, filling gaps with `''` or `0`.
- The repository turns stored documents into `Product`s with `toProduct`.

::: warning `req.body` is not checked
`req.body` has type `any`, so TypeScript trusts whatever arrives. If a client sends `{ "price": "banana" }`, the service still calls it `ProductFields`. Types describe what you *expect*. Only runtime checks (like the service's negative-number rules) enforce anything.
:::

### Business logic lives in the service

**Business logic** means the rules that come from what the *business* knows, not from HTTP, TypeScript, or MongoDB. MongoDB will happily store `quantity: -3`. TypeScript only knows it's a `number`. Only the business knows you can't have negative stock or a negative price. (Can a price be exactly 0? Only the business can answer that, and the service is where the answer gets written down.)

```ts
// services/products-service.ts
export const updateProduct = async (id: string, changes: ProductFields): Promise<Product | null> => {
  const existing = await productsRepository.findProduct(id);
  if (!existing) {
    return null;                                          // no product: let the controller pick 404
  }

  const quantity = changes.quantity ?? existing.quantity; // the value it WOULD have after the change
  const price = changes.price ?? existing.price;

  if (quantity < 0) {
    throw new ValidationError('quantity cannot be negative');
  }
  if (price < 0) {
    throw new ValidationError('price cannot be negative');
  }

  return productsRepository.updateProduct(id, changes);   // only reached if every check passed
};
```

The checks run **before** the write. Bad data never reaches the database, where other code could read it and spread the damage. `??` ([Week 4](/weeks/week-04#model-functions-and)) gives "the new value if one was sent, otherwise the current one". That's the value the product *would* end up with.

### Custom errors and the error-handling middleware

A **custom error class** is your own named kind of error, made by extending JavaScript's built-in `Error`. The whole of `errors.ts`:

```ts
export class ValidationError extends Error {}
```

It adds nothing new. It's a **label**. Code elsewhere can ask "is this error a `ValidationError`?" with **`instanceof`**, an operator that checks whether an object was made from a given class.

**Throwing** an error (`throw new ValidationError(...)`) stops the current function immediately and passes the error up to whoever called it, and on up, until something handles it. Here, nothing in the service or controller catches it, so it reaches the **error-handling middleware**, which Express recognizes by its **four** parameters ([Week 2](/weeks/week-02)):

```ts
// middleware/error-handler.ts
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message });     // client sent bad data
    return;
  }
  res.status(500).json({ error: 'Something went wrong' });   // anything else: our fault, hide details
};
```

**Why not `try/catch` in the controller?** You'd need one in *every* controller, each handling every kind of error, and keeping them consistent gets hard. One error handler gives one place that decides "this kind of error means this status code". The notes say this is one approach, and HW2 uses a different one.

::: tip Extra context: why a thrown error reaches the handler at all
The controllers are `async` functions. When something inside throws, the function's promise **rejects** instead of returning. **Express 5** (which this project uses) notices a rejected promise from a handler and passes the error to the error middleware for you. Express 4 didn't, and every async controller needed its own `try/catch` with `next(err)`. That's the style in the [Corey Cleary reading](/weeks/week-04#corey-cleary-project-structure-for-an-express-rest-api).
:::

::: sticky Real life: the "wrong form" stamp
At the DMV, the clerk in the back finds your form is filled out wrong. They don't come out to explain. They stamp it **REJECTED: missing signature** and send it forward. The front desk has one rule: a REJECTED stamp means "hand it back to the customer with the note" (**400**). Anything else that goes wrong in the back gets "sorry, system problem" (**500**), and the customer never sees the internal details.
:::

### What each layer guarantees

A **guarantee** is the promise a layer makes to the layers around it: what will always be true when it finishes. The lecture follows `PATCH /products/:id` down through the layers and names each one:

| Layer | Guarantee |
|---|---|
| **router** | `PATCH /products/:id` reaches `patchProduct`, and nothing else does |
| **controller** | 404 for an id that isn't there, otherwise 200 and the updated product |
| **service** | quantity (and price) never go negative, and if a change would make them, **nothing is written** |
| **repository** | only the fields that were sent change, and the change is saved in MongoDB |
| **models** | every layer agrees on what a `Product` is: `id: string`, never `_id: ObjectId` |

These guarantees are exactly **what the tests check**. Every test this week maps to one row.

**And back up again.** Follow the **return types** from the bottom up, and you can see each layer's job:

| Layer | Function | Returns |
|---|---|---|
| MongoDB driver | `findOneAndUpdate(...)` | `WithId<Document> \| null` |
| repository | `productsRepository.updateProduct()` | `Promise<Product \| null>` |
| service | `productsService.updateProduct()` | `Promise<Product \| null>` (or throws `ValidationError`) |
| controller | `productsController.patchProduct()` | `Promise<void>`. It *sends* a response instead of returning one |
| what the client sees | | `200` + JSON · `404` · `400` |

The data starts as a MongoDB `Document`, becomes a `Product` at the repository, and comes out the top as an HTTP response.

### Updating in MongoDB: `findOneAndUpdate`, `$set`, `returnDocument`

The repository's PATCH uses one MongoDB call that finds a document **and** changes it:

```ts
const doc = await getDb()
  .collection(PRODUCTS)
  .findOneAndUpdate(
    { _id: new ObjectId(id) },     // 1. filter: which document
    { $set: changes },              // 2. update: what to change
    { returnDocument: 'after' }     // 3. options: give back the NEW version
  );
return doc ? toProduct(doc) : null;
```

- **`new ObjectId(id)`** turns the 24-hex-character id string from the URL into an `ObjectId`, the type MongoDB stores `_id` as. A plain string never matches. A string that isn't 24 hex characters (like `'abc'`) makes it **throw**.
- **`$set`** is a MongoDB **update operator**: it changes only the listed fields and leaves the rest alone. Without it, the update would replace the whole document. `$set` is what makes this behave like PATCH.
- **`returnDocument: 'after'`** asks for the document as it looks *after* the update. The default, `'before'`, would return the old version.
- If no document matches, `doc` is `null`, and the ternary `doc ? toProduct(doc) : null` passes the `null` up instead of crashing on it.

### Kinds of tests

A **test** is code that runs your code and checks the result automatically. Tests differ in how much of the app they run at once:

| Kind | Runs | Fakes | A failure tells you |
|---|---|---|---|
| **Unit test** | one function | everything it calls | that function is wrong |
| **Integration test** | a few real pieces together (say, controller + service) | everything outside that group (say, the repository) | something in that group is wrong |
| **End-to-end (e2e) test** | the whole app through its public interface (for us, HTTP) | nothing in the app (only the database is a throwaway copy) | the route is wrong *somewhere* |

The course covers unit and e2e. Integration tests use the same tools. The hard part is choosing which groups are worth testing together.

Two more terms the notes use:

- **Happy path**: the case where everything goes right (a valid id, valid data). Usually the first test you write.
- **Sad path**: any case where something goes wrong (missing id, bad data). There are many more of these than happy paths, and most testing is about finding them.

The notes also include a collapsed aside titled **"Regression testing is forever"** (its text didn't come through in the PDF). A **regression** is when something that used to work breaks because of a later change. **Regression testing** means keeping every test you've written and rerunning all of them after every change, forever. That's why tests are code and not one-off Postman checks.

::: sticky Real life: checking a car
An **e2e test** is a test drive: turn the key, drive around the block, does it get there? If it doesn't, you don't know whether it's the battery, the fuel pump, or the tires. A **unit test** is the mechanic putting the battery alone on a tester. It can't tell you the car drives, but if it fails, you know exactly what to replace. You want both.
:::

### Arrange, act, assert

Every test, e2e or unit, has three steps:

1. **Arrange**: set up the conditions the test needs (data in the database, a real id, fake functions).
2. **Act**: do the one thing you're testing (send the request, call the function).
3. **Assert**: check that what should be true is true (`expect(...)`).

The lecture's first PATCH test, labeled:

```ts
it('updates the field that was sent', async () => {
  const all = await request(app).get('/products');   // ARRANGE: get a real id
  const { id } = all.body[0];

  const res = await request(app)                     // ACT: send the PATCH
    .patch(`/products/${id}`)
    .send({ price: 12.5 });

  expect(res.status).toBe(200);                      // ASSERT
  expect(res.body.price).toBe(12.5);
});
```

Two details from the notes:

- The arrange step **trusts `GET /products`** to get an id. That's fine because GET isn't what's being tested here, and other tests cover it.
- **12.5 was chosen on purpose.** No seed product in `test-products.ts` starts at 12.5. If one did, the test could pass even if PATCH did nothing. Always pick a test value that **can't already be true**.

### The e2e test setup

`__tests__/products.e2e.test.ts` uses the setup from [Week 4](/weeks/week-04#testing-with-mongomemoryserver), now with the repository:

```ts
let mongo: MongoMemoryServer;

beforeAll(async () => {                 // once: start a throwaway MongoDB and connect to it
  mongo = await MongoMemoryServer.create();
  await connect(mongo.getUri(), 'test');
});

afterAll(async () => {                  // once at the end: clean up what we started
  await disconnect();
  await mongo.stop();
});

beforeEach(async () => {                // before EVERY test: back to a known state
  await productsRepository._clearProducts();
  for (const product of testProducts) {
    await productsRepository.insertProduct(product);
  }
});
```

The seed data, `testProducts`, is four coffee makers: Mr. Coffee (quantity 120), Braun (78), REVOTRA (3), and Keurig (0). The `_` in `_clearProducts` is the convention for "test-only, don't call this from the app".

**`it.todo('…')`** is Vitest's way of saying "planned, not written yet". It shows up as `todo` in the output, not as a pass or a failure. The starter uses it to hand you test stubs.

### Fakes, mocks, and spies

To unit-test one function, you have to stop it from calling the real functions around it. Otherwise a service test would need a database, and a failure could be the database's fault. Vitest's `vi` object provides three tools for this. All the examples come from `src/mocks-and-spies.unit.test.ts`, which tests nothing in the app. It's a sandbox to run (`npm run test:unit`) and poke at.

**A fake** is a stand-in function that does nothing, but **remembers every call**: how many times, and with what arguments. Make one with **`vi.fn()`**:

```ts
const notify = vi.fn();

notify('order shipped', 3);

expect(notify).toHaveBeenCalledWith('order shipped', 3);
expect(notify).toHaveBeenCalledTimes(1);
```

**A mock** is a fake that **answers with something you chose** (a "canned" answer). Code that calls it thinks it got a real result:

```ts
const rollDie = vi.fn().mockReturnValue(4);      // always 4
expect(rollDie()).toBe(4);

const loadSettings = vi.fn().mockResolvedValue({ theme: 'dark' });   // async version
expect(await loadSettings()).toEqual({ theme: 'dark' });
```

Use `mockResolvedValue` for anything `async`, because async functions return a **promise** that *resolves* to a value instead of returning it directly.

**A spy** wraps a function that **already exists** so that its calls are recorded. Make one with **`vi.spyOn(object, 'functionName')`**. On its own, a spy only watches. The real function still runs:

```ts
const inventory = { countOnHand: () => 42 };

const count = vi.spyOn(inventory, 'countOnHand');
expect(inventory.countOnHand()).toBe(42);        // the real function ran
expect(count).toHaveBeenCalledTimes(1);          // …and the spy saw it
```

Give a spy an answer, and it **replaces** the real function. The code calling it can't tell:

```ts
const count = vi.spyOn(inventory, 'countOnHand').mockReturnValue(0);
expect(inventory.countOnHand()).toBe(0);         // the real function did NOT run
```

**Spy + mock together** is what you'll use most: replace a real function with a canned answer, *and* record how it was called. That lets a test check two things:

- the code under test does the right thing **when its neighbors answer a certain way**, and
- the code under test **doesn't reach outside itself**: no real database writes or other side effects.

| Tool | Makes | Real function runs? | Typical use |
|---|---|---|---|
| `vi.fn()` | a brand-new fake | there isn't one | pass in as a callback, or build a fake `res` |
| `vi.fn().mockReturnValue(x)` / `.mockResolvedValue(x)` | a fake with an answer | there isn't one | a dependency that must return something |
| `vi.spyOn(obj, 'f')` | a recorder on a real function | **yes** | check a real function gets called correctly |
| `vi.spyOn(obj, 'f').mockResolvedValue(x)` | a replacement for a real function | **no** | unit tests: replace the repository |

::: sticky Real life: the stunt double
A spy on its own is a **camera filming the real actor**: the scene happens for real, and you have footage of everything. Spy + mock sends in the **stunt double**. The scene still plays out, the other actors don't notice, but the real actor (the database) never gets near the explosion. And the camera still rolls, so afterward you can check exactly what the double did.
:::

**Matchers for fakes and spies:**

| Matcher | Passes when |
|---|---|
| `toHaveBeenCalled()` | called at least once |
| `toHaveBeenCalledTimes(n)` | called exactly `n` times |
| `toHaveBeenCalledWith(a, b)` | some call had exactly these arguments (objects compared like `toEqual`) |
| `.not.toHaveBeenCalled()` | never called |
| `await expect(promise).rejects.toThrow(X)` | the async call threw (`X` can be a class like `ValidationError`, or message text) |

**Cleaning up.** Fakes remember calls and answers between tests unless you reset them. The starter calls **`vi.restoreAllMocks()`** in `beforeEach`, which puts every spied-on function back to the real one, so each test starts clean.

### Unit testing the service

This is where it all comes together. The function under test:

```ts
// services/products-service.ts
export const getLowStockProducts = async (threshold: number = LOW_STOCK_THRESHOLD): Promise<Product[]> => {
  const products = await productsRepository.findAllProducts();
  return products.filter((product) => product.quantity < threshold);
};
```

The test file imports two modules, for different reasons:

```ts
import * as productsService from './products-service.js';                  // what we TEST
import * as productsRepository from '../db/products-repository.js';        // what we MOCK
```

`import * as name` gathers every export of a file into one object. That object is what `vi.spyOn(productsRepository, 'findAllProducts')` needs: an object, and the name of a function on it.

**A test-data factory.** `makeProduct` builds a complete, valid `Product` from whichever fields you care about, filling the rest with harmless defaults. Tests stay short and only mention what matters:

```ts
const makeProduct = (fields: ProductFields): Product => {
  return {
    id: fields.id ?? 'aaaaaaaaaaaaaaaaaaaaaaaa',
    modelName: fields.modelName ?? 'Test Product',
    /* … */
    price: fields.price ?? 10,
    quantity: fields.quantity ?? 10
  };
};
```

**The first real unit test:**

```ts
it('returns only the products below the threshold', async () => {
  vi.spyOn(productsRepository, 'findAllProducts').mockResolvedValue([   // ARRANGE: fake the layer below
    makeProduct({ modelName: 'Plenty', quantity: 100 }),
    makeProduct({ modelName: 'Few', quantity: 2 }),
    makeProduct({ modelName: 'None', quantity: 0 })
  ]);

  const low = await productsService.getLowStockProducts(5);             // ACT: call the service directly

  const names = low.map((product) => product.modelName);
  expect(names).toEqual(['Few', 'None']);                               // ASSERT: which two came back
});
```

The service has **no idea it's being fooled**. It calls `productsRepository.findAllProducts()` exactly as it would in production and gets the three made-up products. No database, no HTTP, nothing else.

**Compare the e2e version** that's been in the suite all along (`GET /products?lowStock=true` expects REVOTRA and Keurig). If *that* fails, the problem could be the controller's query parsing, the service, the repository, or even the seed data. If the unit test fails, it's the service.

**Pin the boundary.** A **boundary** (or edge case) is the exact value where behavior switches, here exactly 5 units. Is 5 "low stock"? The e2e test can't answer that without new seed data. A unit test makes it one line:

```ts
it('does not count a product sitting on the threshold', async () => {
  vi.spyOn(productsRepository, 'findAllProducts').mockResolvedValue([
    makeProduct({ modelName: 'Exactly five', quantity: 5 })
  ]);
  const low = await productsService.getLowStockProducts(5);
  expect(low).toHaveLength(0);       // < not <=, and now the test says so
});
```

**Asking the spy what it saw.** The previous tests used the spy only for its answer. This one *keeps* the spy and checks how it was called:

```ts
it('asks the repository to change only what it was given', async () => {
  vi.spyOn(productsRepository, 'findProduct').mockResolvedValue(makeProduct({ price: 10 }));   // needed, not inspected
  const update = vi
    .spyOn(productsRepository, 'updateProduct')
    .mockResolvedValue(makeProduct({ price: 12.5 }));                                          // the one we care about

  await productsService.updateProduct('abc', { price: 12.5 });

  expect(update).toHaveBeenCalledWith('abc', { price: 12.5 });   // exactly this id, exactly this one field
});
```

`findProduct` is mocked because the service calls it first and needs *some* existing product. `updateProduct` is the one being questioned: did the service hand it exactly the changes it received, with nothing added?

Notice the id is `'abc'`, which isn't a valid ObjectId. It doesn't matter: the real repository (the only code that calls `new ObjectId`) never runs.

**A spy with no answer: proving nothing happened.**

```ts
it('writes nothing when quantity would go negative', async () => {
  vi.spyOn(productsRepository, 'findProduct').mockResolvedValue(makeProduct({ quantity: 10 }));
  const update = vi.spyOn(productsRepository, 'updateProduct');    // no answer: we expect it never to be called

  await expect(
    productsService.updateProduct('abc', { quantity: -1 })
  ).rejects.toThrow(ValidationError);

  expect(update).not.toHaveBeenCalled();
});
```

Compare this to the e2e version (NYT #1's third test), which needed a *second* HTTP request to check nothing changed in the database. Here, one line checks that the function that would do the damage was never touched.

### Running only some tests

The `package.json` scripts filter tests by **file name**:

| Command | Runs |
|---|---|
| `npm test` | `vitest run`: every test file |
| `npm run test:unit` | `vitest run unit.test`: only files whose path contains `unit.test` |
| `npm run test:e2e` | `vitest run e2e.test`: only the e2e files |
| `npm run test:watch` | `vitest`: reruns on every save |

Unit tests run in milliseconds and need no database, so they're the ones to keep running while you work.

## Code walkthrough

**Full source:** [`products-router.ts`](/code/week05-nyt/src/routes/products-router-ts) · [`products-controller.ts`](/code/week05-nyt/src/controllers/products-controller-ts) · [`products-service.ts`](/code/week05-nyt/src/services/products-service-ts) · [`products-repository.ts`](/code/week05-nyt/src/db/products-repository-ts) · [`db.ts`](/code/week05-nyt/src/db/db-ts) · [`product.ts`](/code/week05-nyt/src/models/product-ts) · [`errors.ts`](/code/week05-nyt/src/errors-ts) · [`error-handler.ts`](/code/week05-nyt/src/middleware/error-handler-ts) · [`products.e2e.test.ts`](/code/week05-nyt/src/__tests__/products-e2e-test-ts) · [`test-products.ts`](/code/week05-nyt/src/__tests__/test-products-ts) · [`mocks-and-spies.unit.test.ts`](/code/week05-nyt/src/mocks-and-spies-unit-test-ts)

Following `PATCH /products/:id` with body `{ "price": 12.5 }` **down** through the layers. (The service and repository code are shown in full in [Key concepts](#business-logic-lives-in-the-service).)

### Router

```ts
// routes/products-router.ts
productsRouter.get('/', productsController.getProducts);
productsRouter.get('/:id', productsController.getProduct);
productsRouter.post('/', productsController.postProduct);
productsRouter.patch('/:id', productsController.patchProduct);    // ← our request
productsRouter.delete('/:id', productsController.deleteProduct);
```

The thinnest layer. `import * as productsController` replaces Week 4's exported `productControllers` object: the module itself is now the group.

### Controller

```ts
// controllers/products-controller.ts
export const patchProduct = async (req: Request, res: Response): Promise<void> => {
  const product = await productsService.updateProduct(String(req.params.id), req.body);
  if (!product) {
    res.status(404).json({ error: 'No product with that id' });
    return;
  }
  res.json(product);              // 200 is the default status
};
```

There's no `400` anywhere in this file. The `ValidationError` thrown by the service passes straight through the controller to the error handler.

The same file shows the **query string** at work. `GET /products?lowStock=true` arrives as `req.query.lowStock === 'true'` (always a **string**, never a boolean), and the controller picks which service function to call:

```ts
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  if (req.query.lowStock === 'true') {
    res.json(await productsService.getLowStockProducts());
    return;
  }
  res.json(await productsService.getAllProducts());
};
```

### Service → repository → back up

1. The service asks `productsRepository.findProduct(id)` for the current product. Missing → `null` → the controller sends **404**.
2. It works out the price and quantity the product *would* have. Either negative → `throw ValidationError` → the error handler sends **400**, and **nothing is written**.
3. Otherwise it calls `productsRepository.updateProduct(id, changes)`, which runs `findOneAndUpdate` with `$set` and converts the result with `toProduct`.
4. The `Product` travels back up, and the controller sends it with **200**.

### `POST` and `withDefaults`

The Week 4 [incomplete-product bug](/weeks/week-04#nyt-incomplete-product-test) is fixed here, in the service. Defaults are filled in **before** the insert:

```ts
// services/products-service.ts
const withDefaults = (fields: ProductFields): NewProduct => {
  return {
    modelName: fields.modelName ?? '',
    modelNumber: fields.modelNumber ?? '',
    /* … */
    price: fields.price ?? 0,
    quantity: fields.quantity ?? 0
  };
};

export const createProduct = async (fields: ProductFields): Promise<Product> => {
  return productsRepository.insertProduct(withDefaults(fields));
};
```

`withDefaults` returns a `NewProduct` (no `id`), so a client can't sneak in its own id, and extra unknown fields in the body are dropped.

### My e2e tests (NYT #1)

The three tests I wrote in class, from [`products.e2e.test.ts`](/code/week05-nyt/src/__tests__/products-e2e-test-ts):

```ts
it('rejects a change that would make the price negative', async () => {
  const all = await request(app).get('/products');
  const { id } = all.body[0];

  const res = await request(app).patch(`/products/${id}`).send({ price: -1 });

  expect(res.status).toBe(400);
  expect(res.body.error).toBe('price cannot be negative');
});

it('leaves the other fields alone', async () => {
  const all = await request(app).get('/products');
  const { id } = all.body[0];

  const res = await request(app).patch(`/products/${id}`).send({ price: 12.5 });

  expect(res.body.modelName).toBe('14 Cup Programmable Coffee Maker');   // Mr. Coffee's seed values
  expect(res.body.modelNumber).toBe('2143561');
  expect(res.body.manufacturer).toBe('Mr. Coffee');
  expect(res.body.color).toBe('Silver');
  expect(res.body.quantity).toBe(120);
});

it('leaves the product unchanged after a rejected change', async () => {
  const all = await request(app).get('/products');
  const { id } = all.body[0];

  await request(app).patch(`/products/${id}`).send({ price: -1 });

  const after = await request(app).get('/products');
  expect(after.body).toEqual(all.body);           // the whole list is identical
});
```

All three pass. Ways to make them sturdier are in the [NYT guide](#now-you-try-guide).

## Readings summary

### Vitest: Mock Functions

The official Vitest guide to mocking, which the lecture's examples follow closely. **Mocking** means replacing a real function or module with a controlled version, because the real one is slow (network, database), because you need a situation that's hard to cause for real (an error), or to watch how your code calls it.

- **`vi.fn()`** makes a mock that returns `undefined` but tracks every call.
- **Return values:** `mockReturnValue(x)` (always), **`mockReturnValueOnce(x)`** (just the next call, then back to the default), and for async functions **`mockResolvedValue(x)`** and **`mockRejectedValue(err)`** (the promise succeeds or fails).
- **`mockImplementation(fn)`** (or `vi.fn(fn)`) gives the mock real behavior, for when a fixed answer isn't enough: `vi.fn((a, b) => a + b)`.
- **Inspecting calls:** `toHaveBeenCalledTimes`, `toHaveBeenCalledWith`, `toHaveBeenNthCalledWith(1, …)`, `toHaveBeenLastCalledWith(…)`, plus the raw history in `.mock.calls` (arguments of each call) and `.mock.results` (what each call returned or threw).
- **Warning:** `.mock.calls` stores *references*, not copies. If you change an object after passing it to a mock, the recorded call shows the changed version.
- **`vi.spyOn(obj, 'method')`** wraps an existing method. The original still runs unless you override it.
- **Three levels of reset:** `mockClear()` forgets the call history; `mockReset()` also removes any custom answer; `mockRestore()` (for spies) puts the original function back. `vi.restoreAllMocks()` does it for every mock, and setting `restoreMocks: true` in `vitest.config` does it automatically after each test.
- **`vi.mock(import('./db.js'), () => ({ … }))`** replaces a *whole module*. It's **hoisted**: moved to the top of the file, so it runs before the imports. Pass `import('./db.js')` rather than a plain string so TypeScript can check the types.

**Connection to lecture:** the in-class tests use `vi.spyOn` on one repository function at a time instead of `vi.mock` on the whole module, so each test only fakes what it needs. The `restoreAllMocks` in `beforeEach` is the guide's cleanup advice. `mockRejectedValue` isn't used in class, but it's how you'd test what the service does when the database fails ([Practice problem 2](#problem-2-when-the-database-fails)).

## Gotchas & common mistakes

- **A test file with no tests fails the whole run.** My `products-services.unit.test.ts` has imports and a `beforeEach` but no `it(...)`, so Vitest says `No test suite found in file` and marks the file failed. Add at least one test (or an `it.todo`) and it goes away.
- **The file name is off by one letter.** Mine is `products-services.unit.test.ts`; the convention is `products-service.unit.test.ts`, matching `products-service.ts`. Vitest still finds it (it only looks for `unit.test`), but the whole point of the name is to say which file it tests.
- **Forgetting to mock a function the code calls.** `updateProduct` calls `findProduct` *before* `updateProduct`. Mock only `updateProduct`, and the real `findProduct` runs, `getDb()` returns `undefined` (no database in a unit test), and you get `TypeError: Cannot read properties of undefined (reading 'collection')`. Read the function under test and mock **every** repository function it calls. (The "common unit test layout" example in my class chat notes has this bug in its last two tests.)
- **Outdated note in my chat notes.** They say "only negative quantity is rejected, so a negative price might be saved". That was true of the Week 4 code. In Week 5, the service rejects **both**.
- **Forgetting `await` before `expect(...).rejects`.** Without it, the test finishes before the promise settles and can pass even when nothing was thrown.
- **`toThrow(ValidationError)` vs `toThrow('price cannot be negative')`.** The first checks the *kind* of error, the second checks the *message*. Use the message when two checks throw the same kind.
- **Spying on the function you're testing.** `vi.spyOn(productsService, 'getLowStockProducts').mockResolvedValue([...])` then calling it tests only your own mock. Mock the layer **below**, call the real thing.
- **Choosing a test value that might already be true.** PATCHing `price: 89.99` onto Mr. Coffee (which already costs 89.99) passes even if PATCH is broken.
- **Relying on `all.body[0]` being a particular product.** It works because MongoDB returns documents in insertion order here, but that isn't guaranteed in general. Find the product by a field, or compare against the original object instead of hard-coded values.
- **A malformed id is a 500, not a 404.** `GET /products/abc` → `new ObjectId('abc')` throws → error handler → **500 "Something went wrong"**. The Week 5 repository dropped Week 4's `ObjectId.isValid` check. ([Practice problem 6](#problem-6-malformed-ids))
- **`POST` doesn't check for negatives.** Only `updateProduct` validates. `POST /products` with `price: -5` returns **201**. ([Practice problem 3](#problem-3-find-the-bug-with-a-test))
- **`req.query` values are strings.** `?lowStock=true` gives `'true'`, so `if (req.query.lowStock)` would also be true for `?lowStock=false`.
- **The first MongoMemoryServer run is slow** (it downloads MongoDB). If it times out, check `vitest.config.ts` still has the long `hookTimeout`.

## Now You Try guide

Step-by-step help for both exercises. Each part ends with a **checkpoint**. Solutions are hidden, so try each step first.

### Test #3: The 404 (written together)

**The ask:** PATCH a product that doesn't exist and expect **404**. Nothing to arrange. Just act and assert. ⚠️ *Still `it.todo` in my file.*

The notes ask two questions worth answering before you write it:

1. **How far down does the id get?** All the way. `'a'.repeat(24)` is a *valid* ObjectId, so the service calls `findProduct`, the repository runs a real `findOne`, and MongoDB answers "no match": `null`.
2. **How does the API decide on 404?** `null` goes up to the service, which returns `null` without checking anything else. The controller sees `!product` and sends 404.

<details>
<summary>Solution</summary>

```ts
it('404s when the id is not in the database', async () => {
  const res = await request(app)
    .patch(`/products/${'a'.repeat(24)}`)
    .send({ price: 1.5 });

  expect(res.status).toBe(404);
});
```

`'a'.repeat(24)` is 24 hex characters, so it's well-formed, and none of the seed products can have it because MongoDB generates their ids.

</details>

**Checkpoint:** the `todo` count in `npm run test:e2e` drops to 0.

### NYT #1: Finish the PATCH e2e tests

**The ask:** replace three `it.todo`s with real tests, in order of difficulty. ✅ *All three done in my code* (shown in the [walkthrough](#my-e2e-tests-nyt-1)).

**1. Rejects a negative price.** Copy the negative-quantity test and change `quantity` → `price` in the body and the error message. ✅

**2. Leaves the other fields alone.** PATCH one field, then check the field you sent changed *and* at least two you didn't send didn't. ✅ Mine checks five hard-coded seed values. It works, but it's tied to `all.body[0]` being Mr. Coffee, and it never checks that `price` actually changed.

<details>
<summary>A sturdier version: one <code>toEqual</code></summary>

```ts
it('leaves the other fields alone', async () => {
  const all = await request(app).get('/products');
  const original: Product = all.body[0];

  const res = await request(app).patch(`/products/${original.id}`).send({ price: 12.5 });

  expect(res.status).toBe(200);
  expect(res.body).toEqual({ ...original, price: 12.5 });
});
```

`{ ...original, price: 12.5 }` is "the original product with only the price swapped". One assertion checks that the sent field changed **and** every other field (including `id`) stayed the same, whichever product happens to be first.

</details>

**3. Leaves the product unchanged after a rejected change.** The interesting assertion is about a **different request**: you PATCH, then GET to see whether the PATCH kept its word. ✅ Mine compares the whole product list before and after, which is stronger than checking one product. One thing it skips: it never checks the PATCH was actually **rejected**.

<details>
<summary>Why that matters, and the fix</summary>

If a bug made the PATCH fail for some other reason (say, a 404 from a wrong id), the list would also be unchanged, and the test would pass for the wrong reason. Assert the rejection too:

```ts
const res = await request(app).patch(`/products/${id}`).send({ price: -1 });
expect(res.status).toBe(400);                    // it was rejected for the right reason…

const after = await request(app).get('/products');
expect(after.body).toEqual(all.body);            // …and nothing moved
```

</details>

**Checkpoint:** `npm run test:e2e` shows no todos and no failures. Then **break the service on purpose**: comment out the `price < 0` check. Tests 1 and 3 should go red. If they stay green, they aren't testing what you think.

### NYT #2: Unit tests for the service

**Step 0: set up the file.** Use the lecture's file as the starting point. It has the imports, `beforeEach`, `makeProduct`, the four tests from class, and three `it.todo`s. (Consider renaming mine to `products-service.unit.test.ts` first.)

<details>
<summary>The starting file from the lecture</summary>

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as productsService from './products-service.js';
import * as productsRepository from '../db/products-repository.js';
import { ValidationError } from '../errors.js';
import type { Product, ProductFields } from '../models/product.js';

beforeEach(() => {
  vi.restoreAllMocks();
});

const makeProduct = (fields: ProductFields): Product => {
  return {
    id: fields.id ?? 'aaaaaaaaaaaaaaaaaaaaaaaa',
    modelName: fields.modelName ?? 'Test Product',
    modelNumber: fields.modelNumber ?? 'TP-1',
    manufacturer: fields.manufacturer ?? 'Test',
    color: fields.color ?? 'Black',
    price: fields.price ?? 10,
    quantity: fields.quantity ?? 10
  };
};

describe('getLowStockProducts', () => {
  it('returns only the products below the threshold', async () => {
    vi.spyOn(productsRepository, 'findAllProducts').mockResolvedValue([
      makeProduct({ modelName: 'Plenty', quantity: 100 }),
      makeProduct({ modelName: 'Few', quantity: 2 }),
      makeProduct({ modelName: 'None', quantity: 0 })
    ]);

    const low = await productsService.getLowStockProducts(5);

    const names = low.map((product) => product.modelName);
    expect(names).toEqual(['Few', 'None']);
  });

  it('does not count a product sitting on the threshold', async () => {
    vi.spyOn(productsRepository, 'findAllProducts').mockResolvedValue([
      makeProduct({ modelName: 'Exactly five', quantity: 5 })
    ]);

    const low = await productsService.getLowStockProducts(5);

    expect(low).toHaveLength(0);
  });
});

describe('updateProduct', () => {
  it('asks the repository to change only what it was given', async () => {
    vi.spyOn(productsRepository, 'findProduct').mockResolvedValue(
      makeProduct({ price: 10 })
    );
    const update = vi
      .spyOn(productsRepository, 'updateProduct')
      .mockResolvedValue(makeProduct({ price: 12.5 }));

    await productsService.updateProduct('abc', { price: 12.5 });

    expect(update).toHaveBeenCalledWith('abc', { price: 12.5 });
  });

  it('writes nothing when quantity would go negative', async () => {
    vi.spyOn(productsRepository, 'findProduct').mockResolvedValue(
      makeProduct({ quantity: 10 })
    );
    const update = vi.spyOn(productsRepository, 'updateProduct');

    await expect(
      productsService.updateProduct('abc', { quantity: -1 })
    ).rejects.toThrow(ValidationError);

    expect(update).not.toHaveBeenCalled();
  });

  it.todo('writes nothing when the price would go negative');
  it.todo('returns null when there is no product with that id');
});

describe('createProduct', () => {
  it.todo('fills in defaults before handing it to the repository');
});
```

</details>

**Checkpoint for step 0:** `npm run test:unit` shows the four lecture tests passing and three todos, and the `No test suite found` failure is gone.

**1. Writes nothing when the price would go negative.** The test right above it is the template. What has to change?

<details>
<summary>Solution</summary>

```ts
it('writes nothing when the price would go negative', async () => {
  vi.spyOn(productsRepository, 'findProduct').mockResolvedValue(
    makeProduct({ price: 10 })
  );
  const update = vi.spyOn(productsRepository, 'updateProduct');

  await expect(
    productsService.updateProduct('abc', { price: -1 })
  ).rejects.toThrow('price cannot be negative');

  expect(update).not.toHaveBeenCalled();
});
```

Matching the **message** instead of `ValidationError` proves it was the *price* check that fired, since both checks throw the same kind of error.

</details>

**2. Returns null when there's no product with that id.** A different sad path: the service doesn't throw here. Look at what it does instead. There are two things worth asserting, and the second is the same one that made the previous test interesting.

<details class="hint">
<summary>Hint</summary>

`mockResolvedValue(null)` fakes a lookup that finds nothing. Then: what does the service return, and should the repository's `updateProduct` have been called?

</details>

<details>
<summary>Solution</summary>

```ts
it('returns null when there is no product with that id', async () => {
  vi.spyOn(productsRepository, 'findProduct').mockResolvedValue(null);
  const update = vi.spyOn(productsRepository, 'updateProduct');

  const result = await productsService.updateProduct('abc', { price: 12.5 });

  expect(result).toBeNull();                  // 1. the controller will turn this into 404
  expect(update).not.toHaveBeenCalled();      // 2. no write attempted for a missing product
});
```

</details>

**3. Fills in defaults before handing it to the repository.** This is about `createProduct`, so it goes in its own `describe`. Call it with only a `modelName` and prove that what reached the repository had all six fields filled in. Note that `insertProduct` needs an **answer** as well as being watched, because the service returns whatever comes back from it. `makeProduct({})` works as the answer.

<details>
<summary>Solution</summary>

```ts
describe('createProduct', () => {
  it('fills in defaults before handing it to the repository', async () => {
    const insert = vi
      .spyOn(productsRepository, 'insertProduct')
      .mockResolvedValue(makeProduct({}));

    await productsService.createProduct({ modelName: 'Mystery Machine' });

    expect(insert).toHaveBeenCalledWith({
      modelName: 'Mystery Machine',   // sent → kept
      modelNumber: '',                // not sent → default
      manufacturer: '',
      color: '',
      price: 0,
      quantity: 0
    });
  });
});
```

**Which isolates the problem better?** The e2e version (`fills in defaults for the fields that were left out`) POSTs, then GETs the stored product. If it fails, the bug could be in the controller, the service, the repository's insert, or the repository's `toProduct` on the way back out. The unit test checks only the hand-off from service to repository. If it fails, `withDefaults` is wrong. (This is the same bug class as last week's [incomplete-product test](/weeks/week-04#nyt-incomplete-product-test).)

</details>

**Checkpoint:** `npm run test:unit` shows no todos and no failures, and `npm test` runs **both** suites green. Then break `withDefaults` (change `?? ''` to `?? 'x'` for color) and confirm exactly one unit test goes red.

## Practice problems

Extra practice beyond the Now You Try exercises. Every solution below was run against the Week 5 starter and passes.

### Problem 1: Pin the default threshold

<p class="practice-meta">⏱ ~5 min · practices: default parameters, mocks</p>

Every lecture test passes `5` to `getLowStockProducts` explicitly. Write a unit test that calls it with **no argument** and proves the default threshold is 5.

<details>
<summary>Solution</summary>

```ts
it('uses a threshold of 5 when none is given', async () => {
  vi.spyOn(productsRepository, 'findAllProducts').mockResolvedValue([
    makeProduct({ modelName: 'Four', quantity: 4 }),
    makeProduct({ modelName: 'Five', quantity: 5 })
  ]);

  const low = await productsService.getLowStockProducts();

  expect(low.map((p) => p.modelName)).toEqual(['Four']);
});
```

Using 4 and 5 (the values on either side of the boundary) means a default of 4 *or* 6 would both fail this test.

</details>

### Problem 2: When the database fails

<p class="practice-meta">⏱ ~10 min · practices: <code>mockRejectedValue</code>, <code>rejects</code></p>

What should `updateProduct` do if the repository itself throws (say, the connection dropped)? It shouldn't swallow the error. It should let it travel up so the error handler sends 500. Write a unit test for that, using a tool from the reading that the lecture didn't use.

<details>
<summary>Solution</summary>

```ts
it('passes a repository failure up to the caller', async () => {
  vi.spyOn(productsRepository, 'findProduct').mockRejectedValue(new Error('connection lost'));

  await expect(
    productsService.updateProduct('abc', { price: 1 })
  ).rejects.toThrow('connection lost');
});
```

`mockRejectedValue` makes the fake's promise *fail* instead of succeed. This is the "situation that's hard to cause for real" the reading mentions: you'd otherwise have to actually kill the database mid-test.

</details>

### Problem 3: Find the bug with a test

<p class="practice-meta">⏱ ~20 min · practices: e2e + unit tests, business logic, refactoring</p>

The service guarantees prices and quantities are never negative. Does `POST` keep that promise? Write an e2e test that POSTs `{ modelName: 'X', price: -5 }` and expects **400**. Run it. Then fix the service so it passes, without copy-pasting the checks.

<details class="hint">
<summary>Hint</summary>

It fails: the API answers **201** and stores the negative price, because only `updateProduct` checks. Move the two checks into a small helper both functions call. In `createProduct`, check *after* `withDefaults` so you're checking the values that would actually be stored.

</details>

<details>
<summary>Solution</summary>

The test:

```ts
it('rejects a new product with a negative price', async () => {
  const res = await request(app).post('/products').send({ modelName: 'X', price: -5 });

  expect(res.status).toBe(400);
  expect(res.body.error).toBe('price cannot be negative');

  const all = await request(app).get('/products');
  expect(all.body).toHaveLength(4);              // nothing was stored
});
```

The fix in `services/products-service.ts`:

```ts
const checkNotNegative = (quantity: number, price: number): void => {
  if (quantity < 0) {
    throw new ValidationError('quantity cannot be negative');
  }
  if (price < 0) {
    throw new ValidationError('price cannot be negative');
  }
};

export const createProduct = async (fields: ProductFields): Promise<Product> => {
  const product = withDefaults(fields);
  checkNotNegative(product.quantity, product.price);
  return productsRepository.insertProduct(product);
};

// …and in updateProduct, replace the two if-blocks with:
checkNotNegative(quantity, price);
```

And a matching unit test, so the rule is pinned at the layer that owns it:

```ts
it('writes nothing when a new product has a negative price', async () => {
  const insert = vi.spyOn(productsRepository, 'insertProduct');
  await expect(
    productsService.createProduct({ modelName: 'X', price: -5 })
  ).rejects.toThrow(ValidationError);
  expect(insert).not.toHaveBeenCalled();
});
```

The existing PATCH tests keep passing after the refactor. That's regression testing doing its job: you changed working code and the old tests confirm you didn't break it.

</details>

### Problem 4: Unit-test a controller with a fake `res`

<p class="practice-meta">⏱ ~15 min · practices: <code>vi.fn</code>, faking objects, method chaining</p>

Write a unit test for `patchProduct` that proves it sends **404** with `{ error: 'No product with that id' }` when the service returns `null`. No Supertest, no database: mock the service and build fake `req` and `res` objects.

<details class="hint">
<summary>Hint</summary>

The controller calls `res.status(404).json(...)`. That's **method chaining**: `status()` must return `res` itself so `.json()` can be called on the result. A `vi.fn()` returns `undefined` by default, so tell `status` to return `res` with `mockReturnValue`.

</details>

<details>
<summary>Solution</summary>

```ts
// src/controllers/products-controller.unit.test.ts
import { beforeEach, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import * as productsController from './products-controller.js';
import * as productsService from '../services/products-service.js';

beforeEach(() => {
  vi.restoreAllMocks();
});

const makeRes = () => {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);          // so res.status(404).json(...) works
  return res;
};

it('patchProduct sends 404 when the service finds nothing', async () => {
  vi.spyOn(productsService, 'updateProduct').mockResolvedValue(null);
  const req = { params: { id: 'abc' }, body: { price: 1 } };
  const res = makeRes();

  await productsController.patchProduct(req as unknown as Request, res as unknown as Response);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: 'No product with that id' });
});
```

`as unknown as Request` tells TypeScript "trust me, treat this small object as a full `Request`". The controller only touches `params` and `body`, so that's all the fake needs.

</details>

### Problem 5: Unit-test the error handler

<p class="practice-meta">⏱ ~10 min · practices: <code>instanceof</code>, fake objects</p>

Using the same `makeRes` helper, test both branches of `errorHandler`: a `ValidationError` becomes 400 with its message, and any other error becomes 500 **without** leaking its message.

<details>
<summary>Solution</summary>

```ts
import { errorHandler } from '../middleware/error-handler.js';
import { ValidationError } from '../errors.js';

it('turns a ValidationError into a 400 with its message', () => {
  const res = makeRes();
  errorHandler(new ValidationError('price cannot be negative'), {} as Request, res as unknown as Response, vi.fn());
  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({ error: 'price cannot be negative' });
});

it('hides any other error behind a 500', () => {
  const res = makeRes();
  errorHandler(new Error('secret db detail'), {} as Request, res as unknown as Response, vi.fn());
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: 'Something went wrong' });
});
```

`vi.fn()` stands in for `next`, which the handler never calls. These tests are synchronous (no `async`) because the handler is.

</details>

### Problem 6: Malformed ids

<p class="practice-meta">⏱ ~15 min · practices: sad paths, which layer decides</p>

`GET /products/abc` currently returns **500**. (1) Write an e2e test that documents what you think it *should* return. (2) Make it pass. Which layer should change?

<details>
<summary>Solution</summary>

Two defensible answers, as in [Week 4](/weeks/week-04#problem-3-400-or-404-for-a-malformed-id):

- **404**: "no product has that id". Fix it in the **repository**, the only layer that knows ids are ObjectIds:

  ```ts
  export const findProduct = async (id: string): Promise<Product | null> => {
    if (!ObjectId.isValid(id)) return null;     // not an ObjectId → can't be in the collection
    const doc = await getDb().collection(PRODUCTS).findOne({ _id: new ObjectId(id) });
    return doc ? toProduct(doc) : null;
  };
  ```

  (and the same guard in `updateProduct` and `deleteProduct`).

- **400**: "that isn't even an id". Use the `validateId` middleware from Week 4's practice problem on the `/:id` routes.

The test for the 404 choice:

```ts
it('404s for an id that is not even an ObjectId', async () => {
  const res = await request(app).get('/products/abc');
  expect(res.status).toBe(404);
});
```

What it should **not** be is 500, which tells the client "the server broke" when really the client sent a bad id.

</details>

### Problem 7: Unit, integration, or e2e?

<p class="practice-meta">⏱ ~5 min · practices: test vocabulary (no code)</p>

Classify each test:

1. Calls `productsService.createProduct` with `insertProduct` mocked.
2. Sends `DELETE /products/:id` with Supertest against MongoMemoryServer.
3. Calls `productsController.postProduct` with a fake `req`/`res`, letting the **real** service run, but with the repository mocked.
4. Calls `toProduct` directly with a hand-made document.

<details>
<summary>Answer</summary>

1. **Unit**: one function, its neighbor faked.
2. **E2E**: the whole app through HTTP.
3. **Integration**: two real layers (controller + service) together, everything outside them (the repository) faked.
4. **Unit**: one function with no dependencies at all, so nothing even needs faking. (`toProduct` isn't exported, so you'd have to export it first.)

</details>

### Problem 8: What's wrong with this test?

<p class="practice-meta">⏱ ~5 min · practices: reading tests critically</p>

```ts
it('returns low stock products', async () => {
  vi.spyOn(productsService, 'getLowStockProducts').mockResolvedValue([
    makeProduct({ quantity: 2 })
  ]);
  const low = await productsService.getLowStockProducts(5);
  expect(low).toHaveLength(1);
});
```

<details>
<summary>Answer</summary>

It mocks **the function it's testing**. The real `getLowStockProducts` never runs, so the test only checks that the mock returns what it was told to. It would pass even if the real function were deleted. Mock the layer *below* (`productsRepository.findAllProducts`), and call the real service function.

</details>

## Review questions

**1. In Week 5, which layer converts a MongoDB document into a `Product`, and why move it there from the models?**

<details>
<summary>Answer</summary>

The **repository** (`toProduct` in `db/products-repository.ts`). That keeps every MongoDB type (`Document`, `ObjectId`, `InsertOneResult`) inside the db layer. Everything above it only sees `Product`s, so the service can live entirely in the app's world, and the models shrink to plain types.

</details>

**2. What is "business logic"? Give the example from this week.**

<details>
<summary>Answer</summary>

Rules that come from what the business knows, not from HTTP, TypeScript, or MongoDB. A product's quantity and price can never be negative. MongoDB would store `-3`, and TypeScript only knows it's a `number`. The rule lives in the **service** (`updateProduct`), which checks it *before* writing anything.

</details>

**3. The service throws a `ValidationError`. Trace how that becomes a 400 response.**

<details>
<summary>Answer</summary>

The `throw` stops `updateProduct` and rejects its promise. `patchProduct` awaits it without a `try/catch`, so its promise rejects too. Express 5 passes the rejected error to the error-handling middleware (the one with four parameters). There, `err instanceof ValidationError` is true, so it sends `res.status(400).json({ error: err.message })`.

</details>

**4. What's the difference between a fake, a mock, and a spy?**

<details>
<summary>Answer</summary>

A **fake** (`vi.fn()`) is a stand-in function that records its calls. A **mock** is a fake with a chosen answer (`mockReturnValue`, `mockResolvedValue`). A **spy** (`vi.spyOn(obj, 'f')`) wraps an *existing* function to record calls. Alone it lets the real function run, and with an answer it replaces it.

</details>

**5. Why is the unit test for `getLowStockProducts` more useful than the e2e test when something breaks?**

<details>
<summary>Answer</summary>

The e2e test runs the router, controller, service, repository, database, and seed data. A failure could come from any of them. The unit test fakes the repository, so only the service's own code runs. A failure points straight at it. (It can also test the exact boundary, `quantity: 5`, without new seed data.)

</details>

**6. In "writes nothing when quantity would go negative", why is `findProduct` mocked with an answer but `updateProduct` spied on with none?**

<details>
<summary>Answer</summary>

The service calls `findProduct` first and needs an existing product to compare against, so it needs an answer, but the test doesn't ask it anything. `updateProduct` should **never be called** in this test, so it needs no answer. The spy is only there so `expect(update).not.toHaveBeenCalled()` can prove nothing was written.

</details>

**7. Why does a test that PATCHes `price: 12.5` need to know that no seed product already costs 12.5?**

<details>
<summary>Answer</summary>

If a product already cost 12.5, the test could pass even if PATCH did nothing at all, since the response would show 12.5 either way. A test value has to be one that can only be true **if the code worked**.

</details>

**8. What does `vi.restoreAllMocks()` in `beforeEach` protect against?**

<details>
<summary>Answer</summary>

Leaks between tests. Without it, a spy set in one test (say, `findProduct` returning `null`) would still be in place in the next test, and that test could pass or fail because of a different test's setup. Restoring puts every real function back so each test starts clean.

</details>
