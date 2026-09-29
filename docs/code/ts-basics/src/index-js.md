---
title: "src/index.js · TS basics exercise (ts-intro)"
editLink: false
---

# `src/index.js`

From **TS basics exercise (ts-intro)** · original: `si-679-f-26-ts-basics-jessicadonoho/src/index.js` · [all files in this project](/code/ts-basics/)

```js:line-numbers
// ============================================================
// TypeScript Intro Exercise: Book Catalog
// ============================================================
// This is a small, working JavaScript program. Your job is to
// translate it into TypeScript by working through the six
// numbered TODOs below, in order. Each TODO names the TS
// feature it's meant to have you practice.
//
// Workflow:
//   1. Copy this file to src/index.ts
//   2. Run `npm run typecheck` and read the errors TS gives you
//   3. Work through the TODOs one at a time
//   4. Re-run `npm run typecheck` until it's clean
//   5. Run `npm run dev` (or `npm run build && npm start`) and
//      confirm the console output matches README.md exactly
// ============================================================

// ---- TODO (1): Interface ---------------------------------------
// After reading through the cocde, define an interface named `Book` 
// describing the shape used below (title, author, year, status).
// You will need this for several subsequent steps.

// ---- TODO (2): Explicit type declaration -------------------
// Give `catalog` an explicit type annotation instead of relying
// on inference. See how it's used below to choose the appropriate
// type.
const catalog = [];

// ---- TODO (3): Enum -------------------------------------------
// Replace these three string constants with a TypeScript enum
// named `BookStatus`, then update the book objects below (and
// every function that compares against a status) to use it.
const STATUS_AVAILABLE = "available";
const STATUS_CHECKED_OUT = "checked-out";
const STATUS_LOST = "lost";

// ---- TODO (4): Function signatures ------------------------------
// Add parameter types and a return type to each function below.

function addBook(catalog, book) {
  catalog.push(book);
  return catalog;
}

function findBookByTitle(catalog, title) {
  return catalog.find((book) => book.title === title);
}

function checkoutBook(catalog, title) {
  const book = findBookByTitle(catalog, title);
  if (!book || book.status !== STATUS_AVAILABLE) {
    return false;
  }
  book.status = STATUS_CHECKED_OUT;
  return true;
}

function returnBook(catalog, title) {
  const book = findBookByTitle(catalog, title);
  if (!book) {
    return false;
  }
  book.status = STATUS_AVAILABLE;
  return true;
}

// ---- TODO (5): Type alias ---------------------------------------
// `findBooksBy` accepts EITHER an author name (string) OR a
// publication year (number). Define a type alias, e.g.
//   type MyTypeAlias = type1 | type2;
// and use it as the type of the `filter` parameter.

function findBooksBy(catalog, filter) {
  if (typeof filter === "number") {
    return catalog.filter((book) => book.year === filter);
  }
  return catalog.filter((book) => book.author === filter);
}

// ---- TODO (6): Basic generics -------------------------------------
// Make `getFirstItem` generic so it works for an array of any
// type, with TypeScript inferring the correct return type
// instead of you writing `any` anywhere.
// hint: you will need to use TypeScript's <Generic> features.

function getFirstItem(items) {
  return items[0];
}

// ============================================================
// Demo — be careful when editing below this line. You will
// need to make changes based on changes you make above, but 
// do not change the output as this will mess up the autograder.
// 
// This is the part that produces the console output documented 
// in README.md.
// ============================================================

addBook(catalog, { title: "The Hobbit", author: "J.R.R. Tolkien", year: 1937, status: STATUS_AVAILABLE });
addBook(catalog, { title: "Dune", author: "Frank Herbert", year: 1965, status: STATUS_AVAILABLE });
addBook(catalog, { title: "Foundation", author: "Isaac Asimov", year: 1951, status: STATUS_LOST });
addBook(catalog, { title: "Children of Time", author: "Adrian Tchaikovsky", year: 2015, status: STATUS_AVAILABLE });

console.log("== Full catalog ==");
catalog.forEach((book) => console.log(`- ${book.title} (${book.year}) by ${book.author} [${book.status}]`));

console.log("\n== Checking out 'Dune' ==");
console.log("Success:", checkoutBook(catalog, "Dune"));
console.log("Success (already checked out):", checkoutBook(catalog, "Dune"));

console.log("\n== Books by Frank Herbert ==");
findBooksBy(catalog, "Frank Herbert").forEach((book) => console.log(`- ${book.title}`));

console.log("\n== Books from 1937 ==");
findBooksBy(catalog, 1937).forEach((book) => console.log(`- ${book.title}`));

console.log("\n== First book in the catalog ==");
console.log(getFirstItem(catalog).title);

console.log("\n== Returning 'Dune' ==");
returnBook(catalog, "Dune");
console.log(findBookByTitle(catalog, "Dune").status);
```
