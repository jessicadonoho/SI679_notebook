---
title: "Page 0: JS & TS Foundations"
description: JavaScript refresher, TypeScript basics, and when to use type vs interface, with examples from the in-class code.
---

# Page 0: JS & TS Foundations

## Overview

Every piece of code in SI 679 is written in **TypeScript** running on **Node.js**. TypeScript is JavaScript with a static type checker on top. You write JavaScript, add type information, and the compiler (`tsc`) checks it *before* the code runs. The types are then erased, and plain JavaScript is what actually executes.

That matters more on the backend than almost anywhere else. A server receives data it didn't create (request bodies, query strings, database documents) and sends data other programs rely on (JSON responses). Types let you write down what those shapes are *supposed* to be, so the compiler catches mismatches between layers (router → service → database) before a user does.

This page covers:

1. **A JavaScript refresher**: the JS features the course code uses constantly.
2. **TypeScript basics**: annotations, inference, unions, `any` vs `unknown`, optional properties, generics.
3. **`type` vs `interface`**: the biggest section, with a decision guide.
4. **Backend-flavored examples**: typing request bodies, responses, database models, and route handlers.

**Sources:** the `practice/` files from the first TS session, the **TS basics** book-catalog exercise, and the two TS Resources readings. Examples also borrow from later weeks' code, so you can see how the course actually uses each feature.

### How to read the code on this page

The examples come from real course files, so even the JavaScript section contains a little TypeScript syntax. Here's just enough to read it. Each item gets a full explanation later, at the link.

| You'll see | It means | Full explanation |
|---|---|---|
| `let age: number = 25` | a **type annotation**: `: number` says what kind of value `age` holds | [Part 2](#type-annotations-and-inference) |
| `function f(x: string): void` | the parameter `x` is a string, and the function returns nothing (`void`) | [Part 2](#type-annotations-and-inference) |
| `interface Book { … }` or `type Book = { … }` | gives a **name** to an object shape ("a Book has a title, an author, …") | [Part 3](#part-3-type-vs-interface) |
| `Book[]` | an array of `Book` objects | [Part 2](#arrays-and-tuples) |
| `Promise<Product[]>`, `Array<string>` | angle brackets fill in a type inside another type: "a Promise **of** a Product array" | [Generics](#generics) |
| `string \| number` | a **union**: either a string or a number | [Part 2](#union-and-literal-types) |
| `tsconfig.json` | the settings file for the TypeScript compiler (how strict to be, where the output goes, …) | [Week 2](/weeks/week-02#setting-up-typescript-express) |

The parts are in order: each one only relies on what came before it, or on this table.

---

## Part 1: JavaScript refresher

### `let` and `const`

`let` and `const` are the two keywords for **declaring a variable** (creating a named slot that holds a value). `const` means the *variable* can't be reassigned. `let` means it can. Neither one is about whether the *value* can change: a `const` array can still be `push`ed to.

```ts
// week02-router/src/books-service.ts
let catalog: Book[] = [];            // let: removeBook reassigns it below

export function addBook(book: Book): void {
  catalog.push(book);                // mutating is fine even for const
}

export function removeBook(id: number): void {
  catalog = catalog.filter(book => book.id !== id);  // reassignment → needs let
}
```

Compare the TS basics exercise, where `const catalog: Book[] = []` works because that code only ever `push`es to it.

::: sticky Real life: a gym locker
`const` is the **number on your locker**: it always points to the same locker. You can still swap what's *inside* (push, pop, change properties). `let` is a locker you're allowed to **switch** for a different one, which is what `removeBook` does when it replaces `catalog` with a new filtered array.
:::

**Rule of thumb:** default to `const`, and switch to `let` only when you truly reassign. (`var` is the old, function-scoped version. The course never uses it, and you shouldn't either.)

### Functions and arrow functions

A **function** is a reusable block of code that takes inputs (**parameters**) and can give back an output (its **return value**). JavaScript has two ways to write one: the classic `function name(…) { … }` **declaration**, and the shorter **arrow function** `(…) => { … }`, which is usually stored in a variable or passed directly to another function. The course uses both forms, often in the same project:

```ts
// Function declaration (HW1 middleware/auth.ts)
export function parseBearerToken(header: string | undefined): string | null { /* … */ }

// Arrow function stored in a const (Week 3 db.ts)
export const connect = async (uri: string, dbName: string) => { /* … */ };

// Arrow function passed inline as a route handler (Week 1 server.js)
app.get('/about', (req, res) => {
  res.send('Welcome to the About page!');
});
```

There are two practical differences:

- **Hoisting:** a `function` declaration can be called before the line where it's defined. An arrow function in a `const` can't.
- **`this`:** inside a method, `this` refers to the object the method was called on. Arrow functions don't get their own `this`. That's why object methods that use `this` are written as methods, like `getDiscount(percent) { return this.price * … }` in `practice/src/05-interface.ts`.

### Objects and arrays

An **object** is a collection of named values (**properties**), written `{ title: "Dune", year: 1965 }` and read with `book.title`. An **array** is an ordered list, written `[1, 2, 3]` and read by position with `numbers[0]`. JSON, the format APIs send and receive, is built from exactly these two structures.

Backend code is mostly moving objects and arrays around. Arrays come with built-in **methods** that take a function (a **callback**) and run it on each element, and the course code leans on them constantly:

| Method | Returns | Course example |
|---|---|---|
| `find` | first match or `undefined` | `catalog.find((book) => book.title === title)` (TS basics) |
| `filter` | new array of matches | `orders.filter((order) => order.status === status)` (HW1) |
| `map` | new array, transformed | `productDocs.map((pDoc) => productFromDocument(pDoc))` (Week 4) |
| `some` | `true` if any match | `menuItem.sizes.some((option) => option.name === size)` (HW1) |
| `includes` | `true` if value present | `menuItem.crusts.includes(crust)` (HW1) |

**Shorthand properties:** when a variable has the same name as the key, you can write it once:

```ts
// week02-router/src/books-router.ts
const bookToAdd: Book = { id, title, author, year, status };
// same as { id: id, title: title, author: author, … }
```

### Destructuring

Destructuring pulls properties out of an object into variables. This is how nearly every Express handler in the course reads its input:

```js
// week01-nyt/server.js
const { itemid } = req.query;                 // ?itemid=42
const { artistName, songName } = req.params;  // /play/artist/:artistName/song/:songName
const { artist, title, album, year } = req.body;
```

::: tip Extra context
Destructuring can also rename and set defaults: `const { page = 1, limit: pageSize = 20 } = req.query`. Array destructuring works by position: `const [scheme, token] = header.split(' ')` would be a neat way to write HW1's `parseBearerToken`.
:::

### Spread (`...`)

Spread (`...`) copies the contents of an object or array into a new one. It's the standard way to "change" data without **mutating** (modifying in place) the original:

```ts
const hobbit = { title: 'The Hobbit', author: 'J.R.R. Tolkien', year: 1937 };
const blank  = { ...hobbit, title: '' };   // a copy of hobbit, with title overridden
// hobbit is unchanged
```

HW1's tests use the same idea to build a fake version of a module:

```ts
// hw1/src/__tests__/errors.test.ts
return { ...real, addOrder: () => { throw new Error("boom"); } };
// = everything the real module exports, but with addOrder replaced
```

::: tip Extra context
The same idea shows up in API code: `const updated = { ...existingProduct, ...changes }` merges a PATCH body over the stored record, with later keys winning. Arrays work too: `[...catalog, newBook]`.
:::

### Modules: `import` / `export`

A **module** is a file whose variables and functions are private by default. You `export` what other files may use and `import` it where you need it. A **named export** (`export const app = …`) is imported by its exact name in braces: `import { app } from './app.js'`. A **default export** is a module's single main value, imported without braces under any name you choose: `import express from 'express'`.

```ts
// week04-nyt/src/services/product-service.ts
import { db } from '../db/db.js';                      // named import
import { productFromDocument } from '../models/products.js';
import type { Product } from '../models/products.js';  // type-only import

export const productService = { getAll };             // named export
```

```ts
import express from 'express';   // default import (a package's main export)
```

Three details from the course code trip people up:

1. **`.js` in import paths.** Week 2–4 projects have `"type": "module"` in `package.json` and `"module": "NodeNext"` in `tsconfig.json`. In that setup you import `./types.js` even though the file on disk is `types.ts`, because the path has to be correct for the *compiled* JavaScript. (`week2-router/src/books-service.ts` even has the comment `//note we import from .js`.) HW1 has no `"type": "module"`, so Node treats it as **CommonJS**, Node's older module system (the one with `require()` and `module.exports`). That's why HW1's imports (`"../types"`) have no extension.
2. **`import type`** imports something that exists only as a type and is erased at compile time. The Week 3/4 tsconfigs turn on the `verbatimModuleSyntax` option, which *requires* you to mark type-only imports this way.
3. **You can mix both:** `import { BookStatus, type Book } from './types.js'` (Week 2) imports a real value (`BookStatus`, an [enum](#enums), which exists at runtime) and a type in one line.

### Promises and `async` / `await`

Some operations take time, like a database query or a network call. Instead of freezing the whole server while it waits, JavaScript runs them **asynchronously**: the operation starts, and the program keeps going. Such an operation immediately returns a **Promise**, a placeholder for a value that arrives later. A Promise ends up **fulfilled** (the value arrived) or **rejected** (an error happened).

You mark a function `async` to be allowed to use `await` inside it. `await` pauses *that* function until the Promise settles, then gives you the value (or throws the error).

```ts
// week03-nyt/src/db.ts
export const addProduct = async (product: Product) => {
  const result = await productsCollection.insertOne(product);  // wait for MongoDB
  return result.insertedId;
};
```

- An `async` function **always returns a Promise**. Here the return type is inferred as `Promise<ObjectId>`, not `ObjectId` (MongoDB's id type, covered in Week 3).
- You can only use `await` inside an `async` function, or at the top level of an ES module (a file in a `"type": "module"` project). Week 4's `index.ts` does `await db.init();` at the top level before calling `app.listen`.
- Forgetting `await` is a classic bug: you get a pending Promise instead of the data.

::: sticky Real life: the restaurant buzzer
At a busy counter you order, and they hand you a **buzzer**, not the food. The buzzer is the **Promise**. `await` is you standing by until it buzzes, then picking up the tray. If you walk to your table with just the buzzer (forgot `await`), you try to eat a plastic pager. Meanwhile the kitchen keeps taking other orders, the way Node keeps serving other requests while one waits on MongoDB.
:::

::: tip Extra context
Express 5 (which the course uses) automatically sends a rejected promise from an `async` route handler to your error handler (the special function that turns errors into responses, covered in [Week 2](/weeks/week-02#error-handling-middleware)). In Express 4 you had to wrap handlers in `try/catch` and call `next(err)` yourself.
:::

---

## Part 2: TypeScript basics

A **type** describes what kind of value something is, and therefore what you're allowed to do with it. A `string` has `.toUpperCase()`, and a `number` can be added. TypeScript's job is to check, before the code runs, that you only do things the types allow.

### Type annotations and inference

An **annotation** is `: Type` written after a variable, parameter, or function to state its type explicitly. It's straight from `practice/src/02-basic.ts`:

```ts
let username: string = "jesiluv";
let age: number = 25;
let isAdmin: boolean = true;

let subscribe = (message: string): void => {   // param type + return type
  console.log(message);
};
```

**Inference** means TypeScript works out the type from the value, so you often don't need the annotation. `let age = 25` is already `number`. The TS in 5 Minutes reading stresses this: TypeScript knows JavaScript well enough to infer most types for you.

**When to annotate explicitly:**

- **Function parameters.** These are always needed; TS can't infer them.
- **Function return types** on exported/public functions. This documents intent and catches mistakes inside the function body. Week 4 does this everywhere (`Promise<Product[]>`, `Promise<void>`).
- **Empty collections.** `const catalog = []` has no useful type, so write `const catalog: Book[] = []` (TODO 2 in the TS basics exercise).
- **Everywhere else**, let inference do the work.

### Primitive types

**Primitives** are the basic, single-value types that everything else is built from:

| Type | Values | Notes |
|---|---|---|
| `string` | `"hello"` | |
| `number` | `25`, `5.99` | one type for ints and floats |
| `boolean` | `true` / `false` | |
| `null`, `undefined` | themselves | with `strict: true`, *not* assignable to other types unless you say so |
| `void` | (nothing) | return type of functions that don't return a value |

Every course `tsconfig.json` has `"strict": true`. It turns on two important checks: values that might be `null`/`undefined` must be handled before use, and a parameter with no type is an error instead of silently becoming `any` (the "anything goes" type, see [`any` vs `unknown`](#any-vs-unknown)). You want it on.

### Arrays and tuples

An **array type** says what every element of an array is. A **tuple** is a special array with a fixed length, where each *position* has its own type.

```ts
let numbers: number[] = [1, 2, 3];          // array of numbers
let names: Array<string> = ["a", "b"];      // same thing, written with generics (angle brackets, see below)
let person: [string, number] = ["Piyush", 25];  // tuple: position 0 is a string, position 1 a number
```

Arrays are "any number of the same kind of thing". A tuple is "exactly these types in this order". You'll mostly meet tuples as return values, like `[error, result]` pairs, and when destructuring.

### Union and literal types

A **union** type, written `A | B`, means "a value of type A **or** type B". A **literal type** is a type with exactly one allowed value, like `"north"` or `6`. Put them together and you get a precise list of allowed values:

```ts
// practice/src/07-union-inter.ts
type Status = "pending" | "approved" | "rejected";
let diceRoll: 1 | 2 | 3 | 4 | 5 | 6;

// hw1/src/types.ts: the same idea for real data
export type Category = "pizza" | "appetizer" | "side" | "beverage";
```

**Narrowing** means using a runtime check to shrink a union down to one member. When a value could be one of several types, you narrow it before using type-specific features. TS follows the `if` and knows which branch has which type:

```ts
// ts-basics/src/index.ts (TODO 5)
type MyFilterType = string | number;

function findBooksBy(catalog: Book[], filter: MyFilterType) {
  if (typeof filter === "number") {
    return catalog.filter((book) => book.year === filter);   // filter: number here
  }
  return catalog.filter((book) => book.author === filter);   // filter: string here
}
```

The narrowing checks you'll see in the course are:

| Check | Asks |
|---|---|
| `typeof x === "string"` | is it this primitive type? |
| `Array.isArray(x)` | is it an array? |
| `x instanceof SyntaxError` | was it created by this class? (HW1's error handler) |
| `"body" in err` | does this object have this property? (HW1's error handler) |
| `x !== undefined` | is it actually there? |

### Enums

An **enum** (short for *enumeration*) is a **named, fixed set of related constants**. Instead of scattering magic strings like `"checked-out"` around your code, where a typo like `"checkedout"` goes unnoticed, you list the allowed values once, give the group a name, and refer to each one through that name: `BookStatus.STATUS_AVAILABLE`. The compiler then rejects any value that isn't in the set, and your editor autocompletes the options.

Unlike most TypeScript features, an enum is **not erased**. It becomes a real object in the compiled JavaScript, so it exists at runtime (that's why Week 2 imports it as a value, not with `import type`).

The TS basics exercise (TODO 3) replaced three loose string constants with a **string enum**, where each member is given a string value:

```ts
// ts-basics/src/index.ts
// Before:  const STATUS_AVAILABLE = "available";  (×3, unrelated constants)
enum BookStatus {
  STATUS_AVAILABLE = "available",
  STATUS_CHECKED_OUT = "checked-out",
  STATUS_LOST = "lost",
}

book.status = BookStatus.STATUS_CHECKED_OUT;   // the value stored is "checked-out"
```

Week 2 used a **numeric enum** instead. When you don't assign values, TypeScript numbers the members `0`, `1`, `2` in order:

```ts
// week2-router/src/types.ts
export const enum BookStatus { STATUS_AVAILABLE, STATUS_CHECKED_OUT, STATUS_LOST }
//                              = 0               = 1                 = 2
```

(`const enum` is a variant whose members are copied into the code as plain values at compile time, instead of being looked up on an enum object.)

The difference shows up in API responses: `res.json(book)` sends `"status": 0` for the numeric enum, and `"status": "available"` for the string one. A client reading the JSON has no idea what `0` means.

::: sticky Real life: the dropdown menu
An enum is a **dropdown** on a form instead of a free-text box. With free text, people type "Checked out", "checked-out", and "chkd out", and your code has to cope with all of them. A dropdown only offers the valid choices. A string enum shows the choice's name in the JSON; a numeric enum sends "option #1" and leaves the reader to guess.
:::

Since you now know literal unions, compare the alternative HW1 uses:

```ts
type OrderStatus = "pending" | "in-progress" | "completed";   // a literal union
```

::: tip Extra context
Many TypeScript codebases prefer a **union of string literals** like this over an enum. It gives the same checking and autocomplete, the JSON is readable, and it's erased at compile time like other types. An enum is useful when you want a runtime object you can loop over, or to rename the underlying values in one place.
:::

### `any` vs `unknown`

`any` and `unknown` are the two types for "a value we don't know the type of". Both can hold anything, but they behave in opposite ways:

| | `any` | `unknown` |
|---|---|---|
| Can hold any value? | yes | yes |
| Can you use it (`.foo`, call it, pass it on) without checking? | **yes, and the compiler stops checking** | **no, you must narrow first** |
| Safety | turns type checking *off* | forces you to check |

To use an `unknown` value you either **narrow** it (above), or use a **type assertion**: `value as string` tells the compiler "treat this as a string, I'm sure". An assertion performs **no runtime check**. If you're wrong, the code fails later, so narrowing is safer.

```ts
// practice/src/09-assertion-guards.ts
let someValue: unknown = "subscribe to me";
someValue.length;                               // ❌ error: 'someValue' is of type 'unknown'
let strLength: number = (someValue as string).length;   // ✅ after an assertion
```

HW1's `validateOrder(body: any)` is a real example of where the choice matters. With `any`, a typo like `item.menuItem` (instead of `item.menuItemId`) compiles fine and prints `undefined is not on the menu`. With `unknown`, the compiler would make you check each field's type before touching it. That's more typing, but it's exactly what a validator is for.

::: sticky Real life: airport security
`any` is a security line where every bag gets waved through, so nothing is stopped, including the dangerous stuff. `unknown` is the line where **every bag goes through the scanner** before it can board. It's slower, but once a bag is cleared (narrowed), you know what's in it.
:::

**Rule:** use `unknown` for data you haven't validated yet (request bodies, parsed JSON). Treat `any` as an escape hatch, as the `practice` notes say: *"ANY, avoid when possible. Unknown (safer than any)."*

### Optional properties and `?`

`?` after a property name means the property may be missing. Its type becomes `T | undefined`:

```ts
// practice/src/05-interface.ts
interface User {
  name: string;
  age: number;
  email?: string;    // may be absent
}

// hw1/src/types.ts: optional fields that only apply to some menu items
export interface MenuItem {
  id: string;
  name: string;
  category: Category;
  price?: number;
  sizes?: SizeOption[];
}
```

::: sticky Real life: the pizza order form
On SliceDrop's order form, **customer name** and **items** are required boxes, and **crust**, **sauce**, and **toppings** are the "if applicable" boxes. A soda has no crust. That's exactly `OrderItem`: `menuItemId` and `quantity` are required, and `size?`, `crust?`, `sauce?`, and `toppings?` are optional.
:::

Because an optional property might be `undefined`, TS makes you check before using it. That's why HW1's helper functions start with `if (menuItem.sizes === undefined) return false;`.

The same `?` works on parameters: `listOrders(status?: string)` in HW1 can be called with or without an argument.

Related operators:

- `a?.b` is **optional chaining**: it gives `undefined` instead of crashing if `a` is null/undefined.
- `a!` is the **non-null assertion**: "trust me, this isn't null/undefined". The TS basics demo ends with `findBookByTitle(catalog, "Dune")!.status`. It compiles, but if you're wrong it crashes at runtime, so use it sparingly.

::: info A stricter setting in `practice/tsconfig.json`
`exactOptionalPropertyTypes: true` separates "property missing" from "property present but set to `undefined`". With it on, `{ name: "A", age: 1, email: undefined }` is an error for the `User` above. `noUncheckedIndexedAccess: true` makes `arr[0]` have type `T | undefined`, since the array might be empty.
:::

### Generics

A **generic** is a type parameter: a placeholder filled in when the function or type is used. You've already been using generics: `Array<string>`, `Promise<Product[]>`, `Partial<Product>`.

```ts
// ts-basics/src/index.ts (TODO 6)
function getFirstItem<Type>(items: Array<Type>): Type {
  return items[0];
}

getFirstItem(catalog).title;   // Type is inferred as Book, so .title autocompletes
getFirstItem([1, 2, 3]);       // Type is inferred as number
```

::: sticky Real life: a labeled storage bin
A generic is a **clear bin with a label slot**. `Array<Book>` is a bin labeled "Books": you know that whatever you pull out is a book. `getFirstItem` is "hand me the top thing from this bin". It works on any bin, and the label tells you what you'll get back. `any` is a bin with the label torn off.
:::

Without generics, you'd have to either write one function per type or use `any` and lose all type information. The generic keeps the link between what goes in and what comes out.

The TS in 5 Minutes reading shows generics on types too, e.g. `interface Backpack<Type> { add: (obj: Type) => void; get: () => Type; }`. You'll use the same pattern for API responses in [Part 4](#an-api-response).

### Classes (briefly)

A **class** is a blueprint for creating objects that share the same properties and methods: `new Employee(101, "Jesi", "Engineering")` builds one. **Access modifiers** control who can touch each member: `public` (anyone), `private` (only code inside the class), and `protected` (the class and classes that extend it).

`practice/src/10-classes.ts` covers all three, plus the **parameter properties** shorthand:

```ts
class Employee {
  constructor(
    private id: number,          // declares AND assigns this.id
    public name: string,
    protected department: string,
  ) {}
}
```

The course's backend code so far uses plain objects and functions (e.g. `export const productService = { getAll }`) rather than classes, so this is useful background more than a daily tool.

---

## Part 3: `type` vs `interface`

This is the question that comes up constantly: **both `type` and `interface` can describe the shape of an object, so which one should you use?** The course code uses both. Week 3 wrote `interface Product` and Week 4 wrote `type Product`, so it's worth understanding exactly how they differ.

### What they are

- An **`interface`** declares a named **object shape**: which properties an object has, and their types. It can only ever describe objects.
- A **`type` alias** gives a name to **any type at all**: an object shape, but also a union, a primitive, a tuple, a function type, or a type computed from another type.

Neither one exists at runtime. Both are erased when TypeScript compiles to JavaScript.

### The syntax

```ts
// interface: a declaration, no "="
// week03-nyt/src/db.ts
export interface Product {
  name: string;
  price: number;
  quantity: number;
}

// type alias: gives a name to ANY type expression, uses "="
// week04-nyt/src/models/products.ts
export type Product = {
  id: string;
  modelName: string;
  modelNumber: string;
  manufacturer: string;
  color: string;
  price: number;
  quantity: number;
};
```

For a plain object shape like this, the two are **interchangeable**. Anything that accepts one accepts the other, because TypeScript is **structurally typed**: it compares shapes, not names. If an object has the right properties with the right types, it fits, whatever the type is called (this idea comes from the TS in 5 Minutes reading).

### What both can do

Two terms in the table: a **`readonly`** property can be set when the object is created but never changed afterward. **`implements`** is how a class promises to match a shape: `class Laptop implements Product { … }` makes the compiler check that the class has every `Product` property.

| Feature | `interface` | `type` |
|---|---|---|
| Object shapes | ✅ | ✅ |
| Optional (`?`) and `readonly` properties | ✅ | ✅ |
| Methods (e.g. `getDiscount(percent: number): number`) | ✅ | ✅ |
| Generics (`Backpack<Type>`) | ✅ | ✅ |
| Used by a class with `implements` | ✅ | ✅ (if it's an object type) |
| Be extended / combined | ✅ with `extends` | ✅ with `&` |

### Extending: `extends` vs intersections (`&`)

**Extending** means building a new shape from an existing one: "an `Order` is everything in a `NewOrder`, **plus** an id, a status, and a timestamp". Interfaces do this with the `extends` keyword. Type aliases do it with an **intersection** (`A & B`), meaning "a value that is an A **and** a B at the same time", so it has all the properties of both.

::: warning A correction to my practice notes
`practice/src/06-type-aliases.ts` has the comment *"interfaces can be extended, types cannot"*. That's not quite right. Types **can** be combined, just with a different mechanism: the intersection operator `&`. What types can't do is use the `extends` *keyword* in their own declaration, or merge (see below).
:::

**`interface … extends`**: HW1 uses this to model "what the client sends" vs. "what the server stores":

```ts
// hw1/src/types.ts
/** What a customer sends to POST /orders. */
export interface NewOrder {
  customerName: string;
  items: OrderItem[];
}

/** What the server stores and returns. */
export interface Order extends NewOrder {
  id: string;
  status: OrderStatus;
  createdAt: string;
}
```

**Intersection `&`**: `practice/src/07-union-inter.ts` combines two interfaces into a type:

```ts
interface Colorful { color: string; }
interface Circle   { radius: number; }
type ColorfulCircle = Colorful & Circle;   // must have BOTH color and radius
```

The same `Order` could be written as a type:

```ts
type Order = NewOrder & {
  id: string;
  status: OrderStatus;
  createdAt: string;
};
```

They're mostly equivalent, and they can be mixed: an interface can `extend` a type alias, and a type can `&` an interface. **The key difference is conflicts.** To read the example below, you need one more type: **`never`**, the type with *no* possible values. TypeScript produces it when you ask for something impossible, like a value that is a string and a number at the same time.

```ts
interface A { id: string; }

interface B extends A { id: number; }
// ❌ Error right here: Interface 'B' incorrectly extends interface 'A'.

type C = A & { id: number };
// ✅ No error here... but C['id'] is string & number, which is `never`.
//    You'll get a confusing error later, when you try to create a C.
```

::: sticky Real life: renovation plans
`interface … extends` is filing an **addition with the building inspector**: if the new plan contradicts the original (a wall that's both load-bearing and removed), you're told *before* construction. `&` is **stapling two blueprints together** and handing them to the contractor, so the contradiction only surfaces when someone tries to build it.
:::

`extends` checks compatibility at the declaration and gives a clear error. `&` silently produces an impossible type. For inheritance-style hierarchies ("an `Order` is a `NewOrder` plus more"), `extends` gives better errors.

::: tip Extra context
The TypeScript team also notes that interfaces with `extends` are slightly faster for the compiler to check than large intersections, because the relationships between interfaces are cached. You won't notice this in a course project, but it's one reason the handbook leans toward `interface`.
:::

### Declaration merging (interfaces only)

**Declaration merging** means that if you declare the **same interface name twice**, TypeScript doesn't complain. It combines both declarations into one interface with all the properties:

```ts
interface User { name: string; }
interface User { email: string; }
// User is now { name: string; email: string }

type Point = { x: number };
type Point = { y: number };   // ❌ Error: Duplicate identifier 'Point'.
```

In your own code, merging is usually an accident, which is a small argument *for* `type`. But it's essential for **augmenting library types**, which is where you'll meet it on the backend:

::: tip Extra context: adding a property to Express's `Request`
In Week 2 and HW1, auth **middleware** (a function that runs before your route handler, see [Week 2](/weeks/week-02#middleware)) checks a token and then calls `next()`. A common next step is for the middleware to attach the logged-in user to the request, so later handlers can read `req.user`. Express's `Request` type doesn't have a `user` property, but because Express declares `Request` as an interface, you can merge one in:

```ts
// src/types/express.d.ts
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: 'customer' | 'staff' };
    }
  }
}
export {};
```

A `.d.ts` file holds only type declarations, and `declare global { namespace Express { … } }` says "add to the `Express` types that the library already defined". This only works because `Request` is an interface. A type alias can't be reopened.
:::

### What only `type` can do

These are the cases where you **have to** use `type`, because an interface can only describe an object shape.

**1. Unions (including literal unions).** This is the most common one in the course:

```ts
// hw1/src/types.ts
export type Category = "pizza" | "appetizer" | "side" | "beverage";
export type OrderStatus = "pending" | "in-progress" | "completed";

// week2-router/src/types.ts
export type BookFilter = string | number;
```

**2. Aliases for primitives, tuples, and functions:**

```ts
type ProductId = string;
type Coordinates = [number, number];                     // tuple
type Validator = (body: unknown) => string[];            // function type
```

**3. Mapped and utility types.** A **mapped type** builds a new object type by going through every property of an existing one and transforming it (for example, making each property optional). TypeScript ships ready-made generic mapped types called **utility types**. The three you'll use most:

| Utility type | Produces |
|---|---|
| `Partial<T>` | `T` with every property optional |
| `Omit<T, 'a' \| 'b'>` | `T` without the listed properties |
| `Pick<T, 'a' \| 'b'>` | `T` with *only* the listed properties |

The Week 3 code has a comment pointing right at this:

```ts
// week03-nyt/src/db.ts
export interface ProductUpdate {
  name?: string;
  price?: number;
  quantity?: number;
}
// same as   export type ProductUpdate = Partial<Product>;
```

`Partial<Product>` goes through every key of `Product` and makes it optional. You can only give that result a name with `type`. The one-liner is also better than the hand-written interface: if someone adds a field to `Product`, `ProductUpdate` picks it up automatically.

One more operator appears below: **`keyof T`** gives a union of `T`'s property names, so `keyof { a: 1; b: 2 }` is `"a" | "b"`.

```ts
// How Partial works under the hood: for each key K of T, make it optional (?)
// and keep its original type (T[K])
type MyPartial<T> = { [K in keyof T]?: T[K] };

// Useful combinations for Week 4's Product (which has an id):
type NewProduct    = Omit<Product, 'id'>;            // POST body: everything but id
type ProductUpdate = Partial<Omit<Product, 'id'>>;   // PATCH body: any subset, never id
type ProductField  = keyof Product;                  // 'id' | 'modelName' | 'price' | …
```

**4. Types computed from values or other types.** Besides `keyof`, there's `typeof someValue` (in a type position: "the type of this variable") and **conditional types** (`T extends string ? A : B`, an if/else that picks a type). These are more advanced, but they all require `type`.

### Comparison table

| | `interface` | `type` |
|---|---|---|
| Object shapes | ✅ | ✅ |
| Unions (`"a" \| "b"`, `string \| number`) | ❌ | ✅ |
| Primitive aliases (`type Id = string`) | ❌ | ✅ |
| Tuples (`[number, number]`) | ❌ (awkwardly) | ✅ |
| Function types | ✅ (call signature) | ✅ (cleaner) |
| Mapped / utility types (`Partial<T>`, `Omit<T, K>`) | ❌ | ✅ |
| Extend another shape | `extends` (checks conflicts) | `&` (conflicts become `never`) |
| Declaration merging | ✅ | ❌ (duplicate identifier error) |
| Augment a library's types (e.g. Express `Request`) | ✅ | ❌ |
| `implements` in a class | ✅ | ✅ (object types only) |
| Error messages | shows the interface name | may expand the whole type |
| Official handbook recommendation | "prefer `interface`" | "when you need specific features" |

### Decision guide

Ask these in order and stop at the first "yes":

1. **Is it a union, a literal set, a tuple, a primitive alias, or a function type?** → use **`type`**. (`OrderStatus`, `Category`, `BookFilter`)
2. **Is it derived from another type** (`Partial`, `Omit`, `Pick`, `keyof`, a mapped type)? → use **`type`**. (`ProductUpdate = Partial<Product>`)
3. **Do you need to add to a type you don't own**, like a library's `Request`? → use **`interface`** (declaration merging).
4. **Is it an object shape that other shapes build on** (`NewOrder` → `Order`)? → **`interface` + `extends`** gives clearer errors.
5. **Is it a plain object shape** (a request body, a model, a response)? → **Either works.** The TS in 5 Minutes reading says to prefer `interface`. Whichever you pick, **be consistent within a project**.

### How the course code uses them

| File | Declaration | Why it fits |
|---|---|---|
| `ts-basics/src/index.ts` | `interface Book` | plain object shape |
| `ts-basics/src/index.ts` | `type MyFilterType = string \| number` | union, so it has to be `type` |
| `practice/src/07-union-inter.ts` | `type ColorfulCircle = Colorful & Circle` | combining shapes with `&` |
| `week2-router/src/types.ts` | `interface Book`, `type BookFilter` | shape vs union |
| `hw1/src/types.ts` | `interface Order extends NewOrder` | hierarchy: stored order = new order + server fields |
| `hw1/src/types.ts` | `type Category`, `type OrderStatus` | literal unions |
| `week03-nyt/src/db.ts` | `interface Product`, `interface ProductUpdate` | shapes (with a hint that `Partial<Product>` would do) |
| `week04-nyt/src/models/products.ts` | `type Product = { … }` | plain shape; `type` is an equally valid choice |

---

## Part 4: Backend-flavored examples

These pull the pieces together in the shapes you'll write every week. They use a few backend terms that the week pages teach properly. If you haven't reached those weeks yet, here's what they mean:

| Term | Meaning | Taught in |
|---|---|---|
| **request / response** | what the client sends to the server, and what the server sends back | [Week 1](/weeks/week-01#the-client-server-model) |
| **request body** | the data a client sends *inside* a request (usually JSON), available as `req.body` | [Week 1](/weeks/week-01#three-ways-data-reaches-your-handler) |
| **route handler** | the function Express runs for a particular method + path, e.g. `GET /products` | [Week 1](/weeks/week-01#routes-app-method-path-handler) |
| **middleware** | a function that runs *before* the route handler (to log, check a token, parse JSON, …) and then passes control on with `next()` | [Week 2](/weeks/week-02#middleware) |
| **status code** | the number that says how a request went: 200 OK, 201 Created, 400 Bad Request, 404 Not Found, … | [Week 2](/weeks/week-02#status-codes-you-ll-actually-use) |
| **document** | one record stored in MongoDB, a JSON-like object with an automatic `_id` of type `ObjectId` | Week 3 |

### A request body

**Types don't exist at runtime.** Writing `const order: NewOrder = req.body` doesn't check anything. It just tells the compiler to *trust* that it's a `NewOrder`. In Express's type definitions, `req.body` is typed as `any` by default, so this assignment always compiles, whatever the client actually sent.

::: sticky Real life: the packing slip
A delivery box has a **packing slip** saying "12 mugs". That's your type. The slip doesn't make the mugs appear. At the receiving dock someone still **opens the box and counts** (validation) before the stock goes on the shelf. A type annotation on `req.body` is only the slip.
:::

That's why HW1 separates the **type** (what a valid body looks like) from the **validator** (the runtime code that checks it):

```ts
// hw1/src/types.ts: the shape
export interface NewOrder {
  customerName: string;
  items: OrderItem[];
}

// hw1/src/routers/orders.ts: check first, then trust
ordersRouter.post("/", requireCustomerToken, (req: Request, res: Response) => {
  const problems = validateOrder(req.body);   // runtime check
  if (problems.length > 0) {
    res.status(400).json({ errors: problems });
  } else {
    const order = addOrder(req.body);          // only now treated as a NewOrder
    res.status(201).json(order);
  }
});
```

::: tip Extra context: typing `req.body` directly
Express's `Request` type is generic: `Request<Params, ResBody, ReqBody, Query>`. Its four type parameters describe the route params, the response body, the request body, and the query string. You can declare the expected body so `req.body` is no longer `any`:

```ts
import type { Request, Response } from 'express';

type ProductParams = { id: string };

productRouter.patch(
  '/:id',
  async (req: Request<ProductParams, unknown, ProductUpdate>, res: Response) => {
    req.params.id;   // string
    req.body.price;  // number | undefined
  },
);
```

This still doesn't *validate* anything. It's a promise you make to the compiler, so pair it with a runtime check like `validateOrder`.
:::

### An API response

HW1's responses follow a consistent pattern: data on success, and `{ error: "…" }` or `{ errors: [...] }` on failure. You can describe that with a union type (a job for `type`).

A useful pattern here is the **discriminated union**: a union of object types that all share one property (the *discriminant*, here `ok`) whose literal value tells you which member you have. Checking that one property narrows the whole object:

```ts
type ApiError = { error: string };

type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// A route handler's response, e.g. GET /orders
type ListOrdersResponse = Order[] | ApiError;
```

Checking `if (result.ok)` narrows the type, so TS knows `data` exists in the `true` branch and `error` exists in the `false` branch.

### A database model

A **model** is the type that describes one kind of stored record: what a product *is* in your app. Weeks 3 and 4 show two ways to model a MongoDB document:

```ts
// Week 3: the shape you INSERT (Mongo adds _id itself)
export interface Product {
  name: string;
  price: number;
  quantity: number;
}
export const addProduct = async (product: Product) => {
  const result = await productsCollection.insertOne(product);
  return result.insertedId;
};
```

```ts
// Week 4: the shape the REST OF THE APP sees, plus a converter
export type Product = {
  id: string;            // a string, not Mongo's ObjectId
  modelName: string;
  /* … */
  price: number;
  quantity: number;
};

export const productFromDocument = (productDocument: Document): Product => ({
  id: productDocument._id.toString(),
  modelName: productDocument.modelName,
  /* … */
});
```

::: sticky Real life: the warehouse SKU
A warehouse tracks stock by an internal bin code like `A7-04-221`. The online store shows customers a clean product page, not the bin code. `productFromDocument` is the person who translates between the two, so shoppers (and your controllers) never deal with warehouse internals like `ObjectId`.
:::

Week 4's approach keeps MongoDB details (`Document`, `ObjectId`, `_id`) inside the model/db layer. Services, controllers, and routes only ever see a clean `Product`. The code comment says it directly: *"no layer above this one ever has to know what a Document or an ObjectId is."*

A full set of model types for one resource often looks like this:

```ts
export type Product       = { id: string; modelName: string; price: number; quantity: number };
export type NewProduct    = Omit<Product, 'id'>;          // POST body
export type ProductUpdate = Partial<NewProduct>;          // PATCH body
```

### Route handler signatures

A function's **signature** is its parameter types plus its return type: the "shape" of the function. Every Express function in the course has one of three signatures. `Request`, `Response`, and `NextFunction` are types that Express provides for the `req` object, the `res` object, and the `next` callback. Here they are from the code:

```ts
import type { Request, Response, NextFunction } from 'express';

// 1. Route handler: receives the request, sends a response
//    week04-nyt/src/controllers/product-controllers.ts
const getProducts = async (req: Request, res: Response): Promise<void> => {
  const allProducts = await productService.getAll();
  res.json(allProducts);
};

// 2. Middleware: does something, then calls next() or ends the response
//    week2-router/src/books-router.ts
const checkAuth = (req: Request, res: Response, next: NextFunction): void => {
  const { authorization } = req.headers;
  if (authorization && secretKey === authorization.split(' ')[1]) {
    next();
  } else {
    res.sendStatus(403);
  }
};

// 3. Error handler: FOUR parameters, error first
//    week04-nyt/src/middleware/error-handler.ts
export const errorHandler = (
  err: Error, req: Request, res: Response, next: NextFunction
): void => {
  res.status(500).send(`ERROR: ${err.message} encountered.`);
};
```

Some things to notice:

- The return type is `void` (or `Promise<void>` if it's `async`). The handler's job is to call `res.json` / `res.send`, not to `return` data.
- Express recognizes an error handler **only** by its four parameters, so `next` has to stay in the list even if you never call it (both HW1 and Week 4 point this out in comments).
- `req.params` values are typed `string | string[]` in Express 5's type definitions. That's why Week 3 writes `getProduct(String(req.params.id))` and HW1 checks `typeof id === "string"` before using it.

::: tip Extra context
Express exports a `RequestHandler` type, so you can write `const getProducts: RequestHandler = async (req, res) => { … }` and have `req`/`res` inferred instead of annotating each parameter.
:::

---

## Code walkthrough

### TS basics exercise: converting JS to TS

**Full source:** [`src/index.ts`](/code/ts-basics/src/index-ts) (converted) · [`src/index.js`](/code/ts-basics/src/index-js) (original JS) · [`README.md`](/code/ts-basics/README-md)

The exercise starts from a working JavaScript book catalog and adds types one TODO at a time. `npm run typecheck` (`tsc --noEmit`) lists every place a type is missing, and you work through them until it's clean.

```ts
// TODO 1: Interface. Describe the shape of a book.
interface Book {
  title: string;
  author: string;
  year: number;
  status: unknown;        // 👈 see note below
}

// TODO 2: Explicit type. An empty array needs one.
const catalog: Book[] = [];

// TODO 3: Enum. Replaces three loose string constants.
enum BookStatus {
  STATUS_AVAILABLE = "available",
  STATUS_CHECKED_OUT = "checked-out",
  STATUS_LOST = "lost",
}

// TODO 4: Function signatures. `Book | undefined` because find() may miss.
function findBookByTitle(catalog: Book[], title: string): Book | undefined {
  return catalog.find((book) => book.title === title);
}

// TODO 5: Type alias. A union has to be a `type`.
type MyFilterType = string | number;

// TODO 6: Generics. The return type follows the input type.
function getFirstItem<Type>(items: Array<Type>): Type {
  return items[0];
}
```

**Why each piece matters:**

- **`Book | undefined`** on `findBookByTitle` forces every caller to handle "not found". Look at `checkoutBook`, which starts with `if (!book || …) return false;`. That's the same "404 if missing" pattern the Week 3 router uses.
- **`status: unknown`** works, but it throws away information: TS won't stop you from setting `status = 42`. Now that `BookStatus` exists, `status: BookStatus` is the precise type, and comparisons like `book.status !== BookStatus.STATUS_AVAILABLE` become fully checked.
- **`getFirstItem`** is honest only if the array is non-empty. With `noUncheckedIndexedAccess` (turned on in `practice/tsconfig.json`), `items[0]` is `Type | undefined`, and the function would need to return `Type | undefined`.

### `practice/`: the first TS session

**Full source:** [all practice files](/code/practice/)

| File | What it shows |
|---|---|
| [`02-basic.ts`](/code/practice/src/02-basic-ts) | primitive annotations, arrays, tuple `[string, number]`, a numeric enum, `void` |
| [`05-interface.ts`](/code/practice/src/05-interface-ts) | an interface with an optional field (`email?`) and a method (`getDiscount`) |
| [`06-type-aliases.ts`](/code/practice/src/06-type-aliases-ts) | `type Point = {…}`, and `interface Dog extends Animal` |
| [`07-union-inter.ts`](/code/practice/src/07-union-inter-ts) | literal unions (`Status`, `diceRoll`) and an intersection (`Colorful & Circle`) |
| [`09-assertion-guards.ts`](/code/practice/src/09-assertion-guards-ts) | `unknown` + `as` assertion, `typeof` type guard |
| [`10-classes.ts`](/code/practice/src/10-classes-ts) | access modifiers, getters/setters, parameter properties |
| [`tsconfig.json`](/code/practice/tsconfig-json) | `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax` |

A method inside an interface, and `this` inside an object literal:

```ts
interface Product {
  name: string;
  price: number;
  getDiscount(percent: number): number;   // a method signature: params + return type
}

let laptop: Product = {
  name: "macPro",
  price: 2000,                            // ← comma (the original file has a ';' here, a syntax error)
  getDiscount(percent: number): number {
    return this.price * (percent / 100);  // method syntax so `this` is the object
  },
};
```

---

## Readings summary

### TypeScript for JavaScript Programmers ("TS in 5 Minutes")

A quick tour for people who already know JavaScript. Its main points: TypeScript **infers** most types from your code, so you don't annotate everything. When you do need to describe a shape, you declare an `interface` (or a `type`), and the handbook explicitly says to **prefer `interface` and use `type` when you need its specific features**. It then shows how to **compose** types with **unions** (including literal unions like `"open" | "closed"`) and **generics**, and explains that TypeScript is **structurally typed**: two objects with the same shape are compatible, whatever they're named.

**Connection to the course:** this page is essentially the reading applied to backend code. Structural typing is why Week 3's `interface Product` and Week 4's `type Product` behave the same way, and the "prefer interface" advice is step 5 of the [decision guide](#decision-guide).

### The TypeScript Handbook: introduction

The intro page explains what the handbook is for. TypeScript is a **static type checker** that finds errors *before* code runs, which is most valuable as a codebase grows. The handbook is meant to be readable in a few hours, and it deliberately doesn't teach core JavaScript, tool setup, or every edge case. It also points readers to different starting points depending on background (new programmers, JS developers, Java/C# developers, functional programmers).

**Connection to the course:** it's the reference to reach for when a later week introduces a feature this page only touches on, like utility types, narrowing, or modules.

---

## Gotchas & common mistakes

::: danger Types disappear at runtime
`const body: NewOrder = req.body` checks **nothing**. `req.body` is `any`, so the compiler takes your word for it. Always validate incoming data at runtime (as HW1's `validateOrder` does) before trusting its type.
:::

- **Commas vs semicolons.** Interfaces and type literals can separate members with `;` or `,`, but **object literals** only accept `,`. `price: 2000;` inside an object (as in `05-interface.ts`) is a syntax error.
- **Missing `.js` in imports** (ESM projects). With `"type": "module"` + `NodeNext`, `import { app } from './app'` fails. It has to be `'./app.js'`.
- **Forgetting `import type`.** With `verbatimModuleSyntax` (Weeks 3–4), importing a type without `type` is a compile error.
- **Numeric enums in JSON.** `res.json(book)` sends `"status": 0`. Use string enums or literal unions for anything that goes over the wire.
- **`any` spreads.** A value typed `any` makes everything derived from it `any` too, so typos in property names (like HW1's `item.menuItem`) go uncaught. Prefer `unknown` and narrow it.
- **`&` conflicts silently.** Intersecting `{ id: string }` with `{ id: number }` gives `id: never`, with no error until you try to use it. `interface extends` reports the conflict immediately.
- **Assuming a type alias can't be extended.** It can, with `&`. What it can't do is *merge*.
- **Overusing `!`.** The non-null assertion hides the `undefined` case from the compiler but not from the runtime.
- **Forgetting `await`.** `const products = getAllProducts();` gives you a `Promise`, not an array. The type (`Promise<…>`) is your hint.
- **Mismatched `@types/node`.** Week 3's `SETUP.md` warns that plain `npm install @types/node` fetches a newer version than your Node runtime. Pin it with `@types/node@^22`.

---

## Practice problems

Hands-on exercises. Try each one in a scratch `.ts` file (in any course project, `npx tsx scratch.ts` runs it and `npx tsc --noEmit` type-checks it) before opening the solution.

### Problem 1: Type the Week 1 `/tracks` endpoint

<p class="practice-meta">⏱ ~10 min · practices: interfaces, optional vs required, request vs response shapes</p>

In Week 1, `POST /tracks` receives `{ artist, title, album, year }` and responds with `{ status: "success", trackAdded: {…}, timestamp }`. Write TypeScript types for **the request body** and **the response**. The response's `status` should only ever be the string `"success"`.

<details class="hint">
<summary>Hint</summary>

The response contains the request body, so reuse it instead of repeating the fields. A literal type (`"success"`) restricts a string to one exact value.

</details>

<details>
<summary>Solution</summary>

```ts
interface NewTrack {
  artist: string;
  title: string;
  album: string;
  year: string;          // the lecture example sends "1985" as a string
}

interface TrackAddedResponse {
  status: "success";     // literal type: no other string allowed
  trackAdded: NewTrack;  // reuse, don't repeat
  timestamp: string;     // new Date().toISOString()
}
```

Either `interface` or `type` works here: they're plain object shapes (step 5 of the decision guide).

</details>

### Problem 2: Replace the numeric enum

<p class="practice-meta">⏱ ~5 min · practices: literal unions, <code>type</code> vs enum</p>

Week 2's `BookStatus` is a numeric `const enum`, so `res.json(book)` sends `"status": 0`. Rewrite it as a **string literal union** and update the `Book` interface and the line in `books-router.ts` that sets the default status.

<details>
<summary>Solution</summary>

```ts
// types.ts
export type BookStatus = "available" | "checked-out" | "lost";

export interface Book {
  id: number;
  title: string;
  author: string;
  year: number;
  status: BookStatus;
}

// books-router.ts
const status: BookStatus = "available";   // JSON now shows "status": "available"
```

`BookStatus` has to be a `type`, because it's a union. The import can become type-only too (`import type { Book, BookStatus }`), because a type alias doesn't exist at runtime, unlike an enum. Under `verbatimModuleSyntax` (Weeks 3–4) it *has* to be.

</details>

### Problem 3: A validator that takes `unknown`

<p class="practice-meta">⏱ ~15 min · practices: <code>unknown</code>, narrowing, returning a list of problems</p>

Write `validateTrack(body: unknown): string[]` for Problem 1's `NewTrack`. Follow the HW1 pattern: return **every** problem found, and an empty array if the body is valid. The Week 1 notes want messages like `artist must be a valid, non-empty string`.

<details class="hint">
<summary>Hint</summary>

First narrow `body` to "an object that isn't null" with `typeof body !== "object" || body === null`. After that, TS still won't let you read `body.artist`. One way through is to treat it as a `Record<string, unknown>`, which says it's an object with unknown values, and then check each value's `typeof`.

</details>

<details>
<summary>Solution</summary>

```ts
function validateTrack(body: unknown): string[] {
  if (typeof body !== "object" || body === null) {
    return ["body must be a JSON object"];
  }
  const fields = body as Record<string, unknown>;   // still unknown VALUES
  const problems: string[] = [];

  for (const key of ["artist", "title", "album", "year"]) {
    const value = fields[key];
    if (typeof value !== "string" || value.trim() === "") {
      problems.push(`${key} must be a valid, non-empty string`);
    }
  }
  return problems;
}
```

Compare this with HW1's `validateOrder(body: any)`. Here the compiler would reject `fields.artist.trim()` without the `typeof` check, so a typo like `fields.artst` can't silently slip through either: it's just `unknown` and fails the check.

</details>

### Problem 4: Derive the Week 4 body types

<p class="practice-meta">⏱ ~10 min · practices: utility types, why they need <code>type</code></p>

Week 4's `Product` has `id, modelName, modelNumber, manufacturer, color, price, quantity`. Without retyping any field names, create:

- `NewProduct`: the `POST /products` body, which is everything except `id`
- `ProductUpdate`: the `PATCH /products/:id` body, which is any subset of `NewProduct`, never `id`
- `ProductField`: a union of all of `Product`'s key names

<details>
<summary>Solution</summary>

```ts
import type { Product } from './models/products.js';

export type NewProduct    = Omit<Product, 'id'>;
export type ProductUpdate = Partial<NewProduct>;
export type ProductField  = keyof Product;
// 'id' | 'modelName' | 'modelNumber' | 'manufacturer' | 'color' | 'price' | 'quantity'
```

All three must be `type` aliases: each one is *computed* from `Product`, and an interface can only be a literal shape. If you add a `weight` field to `Product` later, all three update automatically.

</details>

### Problem 5: A generic `findById`

<p class="practice-meta">⏱ ~10 min · practices: generics with a constraint</p>

Write one function `findById` that works for **both** HW1's `Order[]` and `MenuItem[]` (both have `id: string`), returns the right type (`Order` or `MenuItem`), and returns `undefined` if nothing matches.

<details class="hint">
<summary>Hint</summary>

A plain `<T>` doesn't know `T` has an `id`. You can **constrain** a type parameter with `extends`: `<T extends { id: string }>` means "any type, as long as it has a string `id`".

</details>

<details>
<summary>Solution</summary>

```ts
function findById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}

const order = findById(orders, "3");      // Order | undefined
const item  = findById(menu, "hawaiian");   // MenuItem | undefined
findById([1, 2, 3], "1");                 // ❌ number has no `id`
```

::: tip Extra context
Generic **constraints** (`T extends …`) aren't in the course code yet, but they're the natural next step after `getFirstItem<Type>`: they let a generic function use properties of `T` safely.
:::

</details>

### Problem 6: Spot the bug

<p class="practice-meta">⏱ ~5 min · practices: async/await, reading types</p>

This Week 3-style handler always responds with `{}` and never returns a 404. Why? And what type would TypeScript show for `product`?

```ts
productRouter.get('/:id', async (req: Request, res: Response) => {
  const product = getProduct(String(req.params.id));
  if (!product) {
    res.sendStatus(404);
    return;
  }
  res.json(product);
});
```

<details>
<summary>Solution</summary>

`await` is missing. `product` is a **Promise** (TS shows `Promise<WithId<Document> | null>`), and a Promise object is always truthy, so `!product` is never true and the 404 branch never runs. `res.json(promise)` then serializes the Promise object, which has no own properties, so you get `{}`.

The fix is `const product = await getProduct(String(req.params.id));`.

Note that **`tsc` doesn't report an error here**, because `!somePromise` is legal code. The type check can't catch this one for you. Hovering over `product` to see `Promise<…>` is the fastest way to spot it, and a Supertest test for the 404 case would catch it automatically.

</details>

---

## Review questions

**1. In Week 3, `ProductUpdate` is written as an interface with every field optional. Rewrite it as a one-line type, and explain why you *must* use `type` for that version.**

<details>
<summary>Answer</summary>

`export type ProductUpdate = Partial<Product>;`

`Partial<Product>` is a **mapped type**: it computes a new type from `Product`. Only a `type` alias can give a name to a computed type expression, because an `interface` can only be written out as a literal object shape. It's also safer: if `Product` gets a new field, `ProductUpdate` picks it up automatically.

</details>

**2. HW1 declares `interface Order extends NewOrder`. Write the equivalent using `type`, and describe one way the two behave differently.**

<details>
<summary>Answer</summary>

```ts
type Order = NewOrder & { id: string; status: OrderStatus; createdAt: string };
```

The difference shows up with conflicts. If `Order` redeclared a property with an incompatible type (say `customerName: number`), `extends` gives an error at the declaration. With `&`, the property silently becomes `string & number`, which is `never`, and you only find out later when you can't create a valid `Order`.

</details>

**3. HW1's `validateOrder(body: any)` compiles even though it reads `item.menuItem` (a property that doesn't exist). Why? What would change if the parameter were `unknown`?**

<details>
<summary>Answer</summary>

`any` switches type checking off for that value and for everything derived from it, so `item` is `any` too and any property name is accepted. With `unknown`, TS refuses property access until you narrow the value (e.g. `typeof body === "object" && body !== null && "items" in body`, then `Array.isArray(body.items)`), so a validator written against `unknown` has to actually check each field before using it. That's exactly what a validator should do.

</details>

**4. Which of these must be a `type`, which should probably be an `interface`, and which could be either? (a) `"pending" | "in-progress" | "completed"` (b) adding `user` to Express's `Request` (c) the shape of a `Book` (d) `[number, number]`**

<details>
<summary>Answer</summary>

- (a) **Must be `type`**: it's a union of literals.
- (b) **Must be `interface`**: only interfaces support declaration merging, which is how you add to a library's type.
- (c) **Either**: it's a plain object shape. The handbook says to prefer `interface`. Be consistent within the project.
- (d) **Must be `type`**: it's a tuple.

</details>

**5. Why does Week 3's router call `getProduct(String(req.params.id))` instead of just passing `req.params.id`? And why does Week 4's model convert `_id` to a string `id`?**

<details>
<summary>Answer</summary>

In Express 5's type definitions, route params are typed `string | string[]`, but `getProduct` expects a `string`. `String(...)` makes the value definitely a string, so it type-checks (HW1 does the same thing with a `typeof id === "string"` check).

Week 4's `productFromDocument` turns Mongo's `ObjectId` `_id` into a plain string `id` so that no layer above the model needs to know about MongoDB types. A string also serializes cleanly to JSON for API responses.

</details>
