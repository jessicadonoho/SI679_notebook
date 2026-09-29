---
title: "Week 2: Routing, Middleware & Testing"
description: TypeScript + Express setup, Routers, HTTP headers, middleware (logging, auth, validation, errors), status codes, and E2E tests with Supertest.
---

# Week 2: Routing, Middleware & Testing

**Lecture notes:** *Week 02: Express Routing & Middleware, Unit Testing* (Sept 15) · **In-class code:** [books router](/code/week02-router/) · **Homework:** [HW1: SliceDrop](/code/hw1/)

## Overview

Week 1's server was a single file with every route in it. This week turns that into something that can grow:

- **TypeScript** joins Express, with a real `tsconfig.json` and a set of npm scripts.
- **Routers** group related routes (everything under `/books`) into their own module.
- **Middleware** handles cross-cutting jobs (logging, access control, input validation, error handling) once, instead of in every handler.
- **HTTP headers** and **status codes** get a closer look, since middleware reads the former and sets the latter.
- **Supertest + Vitest** replace clicking "Send" in Postman with automated **end-to-end tests** you can re-run in a second. HW1 is graded this way.

Why it matters: these are the load-bearing patterns of every Express backend. Real APIs are a stack of middleware (parse → log → authenticate → validate → handle → catch errors) with routers organizing the endpoints, and a test suite keeps it all working as it changes.

## Key concepts

### Setting up TypeScript + Express

```bash
mkdir week2-router && cd week2-router
npm init -y
npm pkg set type="module"
npm install express@latest
npm install --save-dev typescript @types/node @types/express tsx
npx tsc --init          # then replace tsconfig.json with the course version
```

What the dev tools are: **`typescript`** provides `tsc`, the compiler that checks types and turns `.ts` into `.js`. **`@types/node`** and **`@types/express`** are type definitions (descriptions of those JavaScript libraries' shapes, so TypeScript can check your use of them). **`tsx`** runs `.ts` files directly, without a separate compile step.

**`dependencies` vs `devDependencies`:** the running server only needs `express`. TypeScript, the `@types/*` packages, and `tsx` are tools for *writing* the code, so they're dev dependencies.

The course `tsconfig.json` ([full file](/code/week02-router/tsconfig-json)):

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "types": ["node"],
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

- `rootDir` / `outDir`: TypeScript lives in `src/`, and compiled JS goes to `dist/`.
- `module: NodeNext`: follow Node's ES-module rules, matching `"type": "module"`. This is why imports say `./types.js` ([Page 0 explains why](/foundations#modules-import-export)).
- `strict`: full checking. An untyped parameter is an error, not a silent `any`.

The scripts:

| Script | Command | Use it for |
|---|---|---|
| `npm run dev` | `tsx watch src/index.ts` | running while you code; restarts on save |
| `npm run typecheck` | `tsc --noEmit` | checking types across the whole project |
| `npm run build` then `npm start` | `tsc`, then `node dist/index.js` | production-style: compile, then run the JS |
| `npm test` | `vitest run` | running the test suite once |

::: danger `tsx` does not check types
`npm run dev` strips the types and runs the code, so **a file full of type errors still runs**. Only your editor's red underlines and `npm run typecheck` actually check types. Get in the habit of running `typecheck`.
:::

Add a `.gitignore` with `node_modules` and `dist`.

### Express Routers

As routes multiply, `express.Router()` lets you build a **mini-app** for one resource and **mount** it at a path:

```ts
// books-router.ts
export const booksRouter = express.Router();
booksRouter.post('/', …);   // becomes POST /books
booksRouter.get('/', …);    // becomes GET  /books

// app.ts
app.use('/books', booksRouter);   // mount: every path in the router is under /books
```

Inside the router, paths are written **relative to the mount point**. That's why the route changed from `'/books'` to `'/'` when it moved into the router. A router can also have its own middleware (`booksRouter.use(express.json())`) that only runs for its routes.

The route handlers also stop storing data themselves. They call a **service module** (`books-service.ts`: `addBook`, `getAllBooks`, `removeBook`), a first step toward the layered structure of Week 4.

::: sticky Real life: a department store directory
The lobby directory says "**Books: 3rd floor**". It doesn't know where the cookbooks are, only which floor handles books. That's `app.use('/books', booksRouter)`. Once you're on the 3rd floor, that floor's own signs (the router's `'/'`, `'/:id'`) get you to the right shelf. You can reorganize a floor without reprinting the lobby directory.
:::

### HTTP headers

Every HTTP message, request *or* response, has three parts:

1. **Start line**: for a request, the method, path, and version (`POST /books HTTP/1.1`). For a response, the version and status (`HTTP/1.1 403 Forbidden`).
2. **Headers**: `key: value` metadata about the message (`Content-Type`, `User-Agent`, `Authorization`, …).
3. A blank line, then the **body**.

`console.log(req.headers)` shows that Postman and Chrome send very different header sets, and you can add your own (`My-Header-Field: Woot!`). Node gives you the header names **lowercased**, because HTTP header names are case-insensitive. Before inventing a custom header, check whether a standard one already fits.

::: sticky Real life: the envelope
The letter inside is the **body**. Everything written *on the envelope* (addressee, return address, "URGENT", postage) is the **headers**: information *about* the message that the mail system reads without opening it. The `Authorization` header is like a signed pass stapled to the outside that the front desk checks before letting the letter in.
:::

### Middleware

Middleware is a function that runs **between** the request arriving and your route handler. It has the handler's signature plus a third parameter, `next`:

```ts
const logger = (req: Request, res: Response, next: NextFunction): void => {
  console.log(req.method, `/books${req.path}`, req.hostname);
  next();   // hand off to the next middleware (or the route handler)
};
```

A middleware function must do **one of two things**:

- call `next()` to pass control down the chain, **or**
- **end the response** itself (`res.sendStatus(403)`, `res.status(400).send(...)`).

If it does neither, the request **hangs** until the client times out.

Common uses, from the lecture: **transforming the request** (`express.json()` is middleware; Express requests don't even *have* a `body` until something parses it), **logging**, **access control**, and **error handling**.

#### Where middleware can be attached

| Scope | How | Week 2 example |
|---|---|---|
| Whole app | `app.use(fn)` | `app.use(errorHandler)` |
| One router | `router.use(fn)` | `booksRouter.use(logger)`, `booksRouter.use(express.json())` |
| One route | extra argument(s) before the handler | `booksRouter.delete('/', checkAuth, handler)` |
| Several, in order | an array | `booksRouter.post('/', [checkAuth, validateBookParams], handler)` |

#### Order matters

Middleware runs **in the order it's registered**, and it only applies to routes registered *after* it. For `DELETE /books` in the in-class code the chain is:

```
logger  →  express.json()  →  checkAuth  →  route handler
(router)      (router)         (route)
```

If `checkAuth` rejects the request, it never calls `next()`, so the handler never runs. In `[checkAuth, validateBookParams]`, a request with no token gets **403** even if its body is also invalid, because authentication runs first. HW1's `POST /orders` relies on exactly this: *"A request with no token never reaches validation, however bad its body is."*

::: sticky Real life: the airport
Check-in → security → gate → plane. Each checkpoint either **waves you on** (`next()`) or **stops you** and sends you back (ends the response). The order isn't negotiable: you can't reach the gate before security. And if a checkpoint agent forgets to either wave you through or turn you away, you're stuck standing there, which is the hanging request.
:::

### Access control with a shared secret

**Access control** means deciding whether a request is allowed at all. The lecture's first version uses a **shared secret**: the server and trusted clients both know a secret string (a **token**). The client proves it knows the token by sending it in the standard `Authorization` header in the form `Bearer <token>`. "Bearer" means "whoever *bears* (carries) this token gets access".

```ts
const secretKey = 'SI679';
const checkAuth = (req: Request, res: Response, next: NextFunction): void => {
  const { authorization } = req.headers;               // "Bearer SI679"
  if (authorization && secretKey === authorization.split(' ')[1]) {
    next();
  } else {
    res.sendStatus(403);
  }
};
```

This is described as crude, but sometimes still useful. Real authentication comes later in the course.

### Status codes you'll actually use

From the lecture's table:

| Code | Label | Use it when |
|---|---|---|
| **200** | OK | the request worked |
| **201** | Created | a POST created something |
| **400** | Bad Request | the client sent something invalid (bad JSON, missing fields) |
| **401** | Unauthorized | really means **unauthenticated**: no valid credentials at all |
| **403** | Forbidden | authenticated, but **not allowed** to do this |
| **404** | Not Found | no such route, *or* no item with that id |
| **500** | Internal Server Error | last resort: the server broke in a way it didn't anticipate |

::: tip 401 vs 403 in practice
By the table's definitions, a *missing or wrong* token is really a **401** (the client isn't authenticated). The in-class `checkAuth` returns 403. HW1's tests expect **401** for a missing or bad token, so follow the spec you're given.
:::

::: sticky Real life: the office badge reader
**401**: you didn't tap a badge at all, or it's not a real one, so the door doesn't know who you are. **403**: your badge works and the system knows it's you, but you're not cleared for the server room. **404**: you asked for Room 512, and there is no Room 512.
:::

### Error-handling middleware

An error handler has **four** parameters, `(err, req, res, next)`. That's how Express tells it apart from ordinary middleware, so `next` must stay in the list even if you never call it:

```ts
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  res.status(500).send(`ERROR: ${err.message} encountered. …`);
};

app.use('/books', booksRouter);
app.use(errorHandler);            // LAST
```

**It has to go last.** When something throws, Express looks *forward* from that point for a four-parameter function. An error handler registered before the router is upstream of it and never sees the error. The in-class `GET /books/badroute` (which just `throw`s) is there to demonstrate this.

### E2E testing with Supertest

> Supertest is Postman you can re-run.

Clicking through Postman works for four routes, but not for forty, or at 2am. **Supertest** sends real HTTP requests to your Express app from a test file and hands back the status, headers, and body. **Vitest** is the test runner that finds and runs the tests. This is called **end-to-end (E2E)** testing because it exercises the API from the client's point of view, top to bottom.

**Step 1: split the app from the server.** A test needs the configured app but must never open a port:

```ts
// app.ts: builds the app (routers, middleware) and exports it
export { app };

// index.ts: the only file that listens
import { app } from './app.js';
app.listen(6790, () => console.log('Server running on port 6790'));
```

**Step 2: write a test** in `src/__tests__/books.test.ts`. The location and name follow the convention Vitest uses to find tests. Three Vitest functions do the work:

- `describe(label, fn)` groups related tests.
- `it(label, fn)` is one test (`test` is a synonym).
- `expect(actual).toBe(expected)` is an **assertion**: if it's false, the test fails. `toBe` compares simple values, and `toEqual` compares objects and arrays by their contents.

```ts
import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('GET /books', () => {                  // a group of related tests
  it('starts out empty', async () => {           // one test
    const res = await request(app).get('/books');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
```

**The whole Supertest API, more or less:**

| Sending | | Reading back | |
|---|---|---|---|
| `.get(path)` / `.post(path)` / `.delete(path)` | method + route (+ query) | `res.status` | the status code |
| `.send(body)` | JSON body | `res.body` | parsed JSON |
| `.set(header, value)` | a header, e.g. `Authorization` | `res.text` | raw body text, for `send()` responses |
| `await` | actually send it | | |

**Tests leak into each other.** `catalog` is a module-level array shared by every test. If a POST test runs before "starts out empty", the GET test fails. That's a badly written suite, not a code bug. The fix is a test-only reset that runs before each test:

```ts
// books-service.ts
export function _resetCatalog(): void { catalog = []; }

// books.test.ts
beforeEach(() => { _resetCatalog(); });
```

The **leading underscore** is a course-wide convention: an `_` function exists only for tests and is never called by app code (HW1 has `_resetOrders()`).

::: sticky Real life: resetting the board game
Every test is a fresh game night. If you don't put the pieces back in the box (`beforeEach` reset), the next game starts with last night's hotels still on Boardwalk. Whether you "win" then depends on who played before you, which is the order dependence the lecture warns about.
:::

## Code walkthrough

### In-class: the books router

**Full source:** [`types.ts`](/code/week02-router/src/types-ts) · [`books-service.ts`](/code/week02-router/src/books-service-ts) · [`books-router.ts`](/code/week02-router/src/books-router-ts) · [`app.ts`](/code/week02-router/src/app-ts) · [`index.ts`](/code/week02-router/src/index-ts) · [`books.test.ts`](/code/week02-router/src/__tests__/books-test-ts)

**The service holds the data; the router holds the HTTP.**

```ts
// books-service.ts
import type { Book } from './types.js';   // type-only import, .js extension

let catalog: Book[] = [];                 // let: removeBook reassigns it

export function addBook(book: Book): void { catalog.push(book); }
export function getAllBooks(): Book[] { return catalog; }
export function removeBook(id: number): void {
  catalog = catalog.filter(book => book.id !== id);
}
```

**Three middleware functions, three jobs:**

```ts
// books-router.ts
const checkAuth = (req, res, next) => { … };           // access control → 403
const validateBookParams = (req: Request, res: Response, next: NextFunction): void => {
  const { title, author } = req.body;
  if (title && author && title !== '' && author !== '') {
    next();                                           // valid → carry on
  } else {
    res.status(400).send('Book data must include non-blank "title" and "author" fields.');
  }
};
const logger = (req, res, next) => { console.log(…); next(); };   // logging, always passes on
```

**Wiring them up:**

```ts
export const booksRouter = express.Router();
booksRouter.use(logger);            // every /books request is logged…
booksRouter.use(express.json());    // …and gets its body parsed

booksRouter.post('/', [checkAuth, validateBookParams], (req: Request, res: Response) => {
  const { title, author, year } = req.body;
  const status: BookStatus = BookStatus.STATUS_AVAILABLE;
  const id = Date.now();                      // lecture: "usually add IDs in the service"
  const bookToAdd: Book = { id, title, author, year, status };
  addBook(bookToAdd);
  res.json(bookToAdd);
});

booksRouter.get('/', (req: Request, res: Response) => { res.json(getAllBooks()); });

booksRouter.delete('/', checkAuth, (req: Request, res: Response) => {
  removeBook(Number(req.body.id));            // the id comes in the JSON body
  res.sendStatus(200);
});

booksRouter.get('/badroute', (req: Request, res: Response) => {
  throw Error("This is a bad route");         // → falls through to errorHandler → 500
});
```

Things to notice:

- `logger` is registered **before** `express.json()`, so it runs first. That's fine, because it only reads `req.method` and `req.path`.
- `POST` returns **200** (via `res.json`), but creating something should be **201**. That's one of the lecture's "Now You Try" fixes (see [Practice problem 1](#problem-1-post-books-should-say-201)).
- The commented-out block at the bottom of the file is the first "Now You Try": query-string filtering (`?title=…&author=…&year=…`), with conditions ANDed by filtering repeatedly.

### Homework: HW1 SliceDrop

**Full source:** [all HW1 files](/code/hw1/) · key files: [`app.ts`](/code/hw1/src/app-ts) · [`middleware/auth.ts`](/code/hw1/src/middleware/auth-ts) · [`routers/orders.ts`](/code/hw1/src/routers/orders-ts) · [`validation/validate-order.ts`](/code/hw1/src/validation/validate-order-ts)

HW1 applies everything above to a pizza-ordering API. The types (`MenuItem`, `NewOrder`, `Order extends NewOrder`) are walked through on [Page 0](/foundations#extending-extends-vs-intersections).

**A plain function inside the middleware, so it can be tested directly:**

```ts
// middleware/auth.ts
export function parseBearerToken(header: string | undefined): string | null {
  if (header) {
    const parts = header.split(" ");
    if (parts[0] === "Bearer" && parts.length === 2 && parts[1] !== "") {
      return header.split(' ')[1];
    }
  }
  return null;
}

export function requireCustomerToken(req: Request, res: Response, next: NextFunction): void {
  const header = parseBearerToken(req.headers.authorization);
  if (header && header === CUSTOMER_TOKEN) {
    next();
  } else {
    res.status(401).send({ "Error": "Token is missing or does not match." });
  }
}
```

This is stricter than the lecture's `checkAuth`. It rejects `Bearer` with no token, `Token abc`, and `Bearer a b`. It also returns **401** with a **JSON** body, as the HW1 tests require.

**Middleware order enforces the spec:**

```ts
// routers/orders.ts
ordersRouter.post("/", requireCustomerToken, (req: Request, res: Response) => {
  const problems = validateOrder(req.body);      // auth already passed
  if (problems.length > 0) {
    res.status(400).json({ errors: problems });  // report ALL problems at once
  } else {
    res.status(201).json(addOrder(req.body));    // 201 Created
  }
});
```

**The app-level safety nets, in order, at the bottom of `app.ts`:**

```ts
app.use(express.json());
app.use("/menu", menuRouter);
app.use("/orders", ordersRouter);

// 1. Nothing matched → JSON 404 instead of Express's HTML page
app.use((req: Request, res: Response) => {
  res.status(404).send({ error: "This page does not exist." });
});

// 2. Something threw → decide whose fault it was
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).send({ error: err.message });         // client sent broken JSON
  } else {
    res.status(500).send({ error: "An error has occurred on our end" });
    console.error(message);             // our bug: log it (message = err.message + err.stack)
  }
});
```

The 404 handler works because it's registered **after** every router: a request only reaches it if nothing earlier responded. The error handler separates **client** mistakes (malformed JSON, which `express.json()` throws as a `SyntaxError` with a `body` property) from **server** mistakes. As the starter comments put it, answering 400 to both *"tells a caller to fix a request that was perfectly fine."*

::: warning Worth fixing in my `validate-order.ts`
Reading it back, three things don't do what they intend. The tests don't cover them, which is itself a lesson in what tests can miss:

1. **Toppings are never checked.** The code tests `item.topping`, but the field on `OrderItem` is **`toppings`** (an array). `item.topping` is always `undefined`, so an order with `toppings: ["gold leaf"]` passes. The fix is to loop over `item.toppings ?? []` and call `offersTopping` for each one.
2. **`${item.menuItem}`** should be **`${item.menuItemId}`**. As written, the message reads `undefined is not on the menu.`
3. **`${realMenuItem}`** interpolates a whole object and prints **`[object Object]`**. It should be `${realMenuItem.name}`.

All three compile because `body` is typed `any` (see [Page 0: `any` vs `unknown`](/foundations#any-vs-unknown)).
:::

## Readings summary

### Express guide: Routing

It covers everything that decides *which* handler runs:

- **Route methods**: `app.get`, `app.post`, …, plus `app.all` for every method.
- **Route paths**: exact strings or regular expressions. The query string is never part of the path.
- **Route parameters**, including **Express 5 syntax**: named wildcards (`/files/*filepath`, which captures an *array* of segments) and optional segments in braces (`/:file{.:ext}`). Old inline-regex params like `:id(\d+)` no longer work.
- **Multiple handlers** for one route, passed individually or as an **array**, with `next()` moving between them. `next('route')` skips to the next matching route.
- **Response methods** that end the cycle: `res.send`, `res.json`, `res.sendStatus`, `res.redirect`, …
- **`app.route(path)`** for chaining `.get().post()` on one path.
- **`express.Router`** as a modular, mountable mini-app, with `mergeParams: true` for reading a parent route's params.

**Connection to lecture:** the in-class router is the guide's `birds.js` example applied to books, and `[checkAuth, validateBookParams]` is its "array of callbacks".

### Express guide: Using middleware

It explains that an Express app is essentially **a series of middleware calls**. Each middleware can run code, modify `req`/`res`, end the cycle, or call `next()`, and if it doesn't end the cycle it **must** call `next()`. It sorts middleware into five kinds:

| Kind | Example |
|---|---|
| Application-level | `app.use(...)`, `app.get(...)` |
| Router-level | `router.use(...)` |
| Error-handling | four params: `(err, req, res, next)` |
| Built-in | `express.json()`, `express.urlencoded()`, `express.static()` |
| Third-party | `cors`, `morgan`, `cookie-parser` |

It also covers `next('route')` and `next('router')` (exit the current router).

**Connection to lecture:** every middleware in the books router is one of these kinds. The logger, `checkAuth`, and the validator are hand-written versions of what third-party packages (`morgan`, auth libraries, validation libraries) do in production.

## Gotchas & common mistakes

- **`tsx` runs code with type errors.** Run `npm run typecheck`.
- **Hand-editing `package.json` commas.** Every entry except the last needs a comma, and npm refuses to run if one is wrong.
- **Router paths.** Inside a router mounted at `/books`, write `'/'`, not `'/books'`. Otherwise the route becomes `/books/books`.
- **Middleware that neither calls `next()` nor responds** leaves the request hanging.
- **Registering middleware after the routes it should protect.** It won't run for them.
- **Error handler not last**, or with only three parameters. Either way it isn't treated as an error handler.
- **Referencing middleware before it's defined.** `const checkAuth = …` must appear above the `booksRouter.post(..., [checkAuth, ...])` that uses it.
- **Order-dependent tests.** Reset shared state in `beforeEach`.
- **`res.body` vs `res.text` in tests.** A handler that uses `send('some text')` has an empty `res.body`, so assert on `res.text`.
- **Header names are lowercase in `req.headers`**: `req.headers.authorization`, not `.Authorization`.
- **Numeric enum statuses** show up as `0`/`1`/`2` in the JSON (see [Page 0](/foundations#enums)).

## Practice problems

### Problem 1: POST /books should say 201

<p class="practice-meta">⏱ ~5 min · practices: status codes, Supertest</p>

Make `POST /books` respond with **201 Created**, and write a Supertest test that proves it (remember the token).

<details>
<summary>Solution</summary>

```ts
// books-router.ts
res.status(201).json(bookToAdd);

// books.test.ts
it('returns 201 when a book is created', async () => {
  const res = await request(app)
    .post('/books')
    .set('Authorization', 'Bearer SI679')
    .send({ title: 'Dune', author: 'Frank Herbert', year: 1965 });

  expect(res.status).toBe(201);
  expect(res.body.title).toBe('Dune');
});
```

</details>

### Problem 2: GET /books/:id

<p class="practice-meta">⏱ ~10 min · practices: route params, 404, services</p>

Add `getBook(id: number): Book | undefined` to the service and a `GET /books/:id` route that returns the book, or **404** if there isn't one.

<details class="hint">
<summary>Hint</summary>

Book ids are numbers (`Date.now()`), but route params are always strings.

</details>

<details>
<summary>Solution</summary>

```ts
// books-service.ts
export function getBook(id: number): Book | undefined {
  return catalog.find((book) => book.id === id);
}

// books-router.ts (below the other routes, but NOT before '/badroute')
booksRouter.get('/:id', (req: Request, res: Response) => {
  const book = getBook(Number(req.params.id));
  if (!book) {
    res.sendStatus(404);
    return;
  }
  res.json(book);
});
```

Route order matters here too. If `/:id` were registered above `/badroute`, a request to `/books/badroute` would match `/:id` with `id = "badroute"` and return 404 instead of reaching the bad route.

</details>

### Problem 3: PATCH /books with auth and validation

<p class="practice-meta">⏱ ~20 min · practices: middleware chains, 400 vs 403</p>

From the lecture's second "Now You Try": add `PATCH /books` that:

- requires the token (**403** if missing or wrong)
- requires a JSON body with an `id` **and at least one** field to change (**400** otherwise)
- applies the change and returns **200**, or **404** if no book has that id

<details>
<summary>Solution</summary>

```ts
// books-service.ts
export function updateBook(id: number, changes: Partial<Omit<Book, 'id'>>): boolean {
  const book = catalog.find((b) => b.id === id);
  if (!book) return false;
  Object.assign(book, changes);
  return true;
}

// books-router.ts
const validatePatch = (req: Request, res: Response, next: NextFunction): void => {
  const { id, ...changes } = req.body ?? {};
  if (id === undefined || Object.keys(changes).length === 0) {
    res.status(400).send('PATCH needs an "id" and at least one field to change.');
    return;
  }
  next();
};

booksRouter.patch('/', [checkAuth, validatePatch], (req: Request, res: Response) => {
  const { id, title, author, year } = req.body;
  const changes: Partial<Omit<Book, 'id'>> = {};
  if (title !== undefined) changes.title = title;
  if (author !== undefined) changes.author = author;
  if (year !== undefined) changes.year = year;

  const found = updateBook(Number(id), changes);
  res.sendStatus(found ? 200 : 404);
});
```

`const { id, ...changes } = req.body` uses **rest destructuring** to split the id from "everything else". The handler then copies only the known fields, so a client can't sneak in `status` or other unexpected keys.

</details>

### Problem 4: Test the auth failures

<p class="practice-meta">⏱ ~10 min · practices: Supertest, <code>describe</code>/<code>it</code>, <code>res.text</code></p>

From the lecture's last "Now You Try": write tests that (a) a POST with **no** token is 403, (b) a POST with the **wrong** token (`Bearer SI999`) is 403, and (c) a POST with a blank title is 400 and the response text mentions `non-blank`.

<details>
<summary>Solution</summary>

```ts
const AUTH = 'Bearer SI679';
const hobbit = { title: 'The Hobbit', author: 'J.R.R. Tolkien', year: 1937 };

describe('POST /books auth + validation', () => {
  it('rejects a missing token with 403', async () => {
    const res = await request(app).post('/books').send(hobbit);
    expect(res.status).toBe(403);
  });

  it('rejects the wrong token with 403', async () => {
    const res = await request(app).post('/books').set('Authorization', 'Bearer SI999').send(hobbit);
    expect(res.status).toBe(403);
  });

  it('rejects a blank title with 400', async () => {
    const res = await request(app)
      .post('/books')
      .set('Authorization', AUTH)
      .send({ ...hobbit, title: '' });
    expect(res.status).toBe(400);
    expect(res.text).toContain('non-blank');   // send() → use res.text, not res.body
  });
});
```

`{ ...hobbit, title: '' }` uses spread to reuse the valid book while overriding one field.

</details>

### Problem 5: Fix HW1's topping check

<p class="practice-meta">⏱ ~10 min · practices: optional arrays, reading your own types</p>

Using the `OrderItem` type (`toppings?: string[]`) and the given `offersTopping(menuItem, topping)` helper, write the part of `validateOrder` that reports **each** topping the menu item doesn't offer.

<details>
<summary>Solution</summary>

```ts
for (const topping of item.toppings ?? []) {
  if (!offersTopping(realMenuItem, topping)) {
    problems.push(`${topping} is not offered on ${realMenuItem.name}.`);
  }
}
```

`item.toppings ?? []` handles the optional field: no toppings means an empty loop. With `body: unknown` instead of `any`, you'd also have to check `Array.isArray(item.toppings)` first, and the `topping`/`toppings` typo could never have compiled.

</details>

## Review questions

**1. In the books router, `booksRouter.post('/', …)` handles `POST /books`. Why `'/'` and not `'/books'`?**

<details>
<summary>Answer</summary>

The router is mounted with `app.use('/books', booksRouter)`, so every path inside it is relative to `/books`. `'/'` inside the router means `/books`. Writing `'/books'` would create `/books/books`.

</details>

**2. A request to `DELETE /books` with no `Authorization` header: which functions run, in what order, and what's the response?**

<details>
<summary>Answer</summary>

`logger` (router-level) logs it and calls `next()` → `express.json()` (router-level) parses the body → `checkAuth` (route-level) finds no header and sends **403**. It doesn't call `next()`, so the DELETE handler never runs and nothing is removed.

</details>

**3. You register your error handler at the top of `app.ts`, before `app.use('/books', booksRouter)`. What happens when `/books/badroute` throws, and why?**

<details>
<summary>Answer</summary>

Your handler never runs. You get Express's default error page instead. When an error is thrown, Express searches *forward* from that point in the stack for four-parameter middleware. A handler registered before the router is behind the error, so it's never found. Error handlers must be registered last.

</details>

**4. Why does the lecture split `app.ts` from `index.ts`?**

<details>
<summary>Answer</summary>

`app.ts` builds and exports the configured app (routers, middleware, error handler) without listening. `index.ts` imports it and calls `app.listen()`. Supertest needs the app **without** an open port: `request(app)` sends requests straight to the app object. If building and listening were in one file, importing it in a test would start a real server.

</details>

**5. Two tests pass when run in one order and fail in the other. What's the likely cause, and the course's fix?**

<details>
<summary>Answer</summary>

Shared state leaking between tests. The module-level `catalog` array keeps books added by earlier tests. The fix is a test-only `_resetCatalog()` in the service, called from `beforeEach`, so every test starts from an empty catalog. Tests should never depend on the order they run in.

</details>

**6. What's the difference between 401 and 403, and which does HW1 use for a missing token?**

<details>
<summary>Answer</summary>

**401** means *unauthenticated*: no valid credentials, so the server doesn't know who you are. **403** means *authenticated but not permitted*: the server knows who you are, but you can't do this. A missing or wrong token is a 401, and HW1's tests expect **401**. (The in-class `checkAuth` uses 403 for simplicity.)

</details>
