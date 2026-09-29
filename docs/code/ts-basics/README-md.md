---
title: "README.md · TS basics exercise (ts-intro)"
editLink: false
---

# `README.md`

From **TS basics exercise (ts-intro)** · original: `si-679-f-26-ts-basics-jessicadonoho/README.md` · [all files in this project](/code/ts-basics/)

````md:line-numbers
# ts-intro

A starter project for practicing core TypeScript features by translating a
small, working JavaScript program into TypeScript.

## Setup

```
npm install
```

## The exercise

`src/index.js` is a plain JavaScript program that manages a small book
catalog. It works correctly as-is. Your job is to convert it into
TypeScript, one concept at a time.

1. Copy `src/index.js` to `src/index.ts` (keep the original `.js` file
   around for reference, or delete it once you're comfortable — your call).
2. Run:

   ```
   npm run typecheck
   ```

   With no type annotations added yet, this will report a list of errors.
   That's expected — it's the compiler telling you exactly where explicit
   types are missing.
3. Work through the six numbered `TODO` comments in the file, **in order**.
   Re-run `npm run typecheck` as you go until it reports no errors.
4. Once it's clean, confirm the program still behaves exactly the same as
   the original JavaScript:

   ```
   npm run build && npm start
   ```

   or, for faster iteration while you work:

   ```
   npm run dev
   ```

   Compare the output against the "Expected output" section below — it
   should match exactly, character for character.

## What each TODO covers

| # | TODO | TypeScript feature |
|---|------|---------------------|
| 1 | the shape of a book object | Interfaces |
| 2 | `catalog` | Explicit type declarations |
| 3 | `STATUS_AVAILABLE` / `STATUS_CHECKED_OUT` / `STATUS_LOST` | Enums |
| 4 | `addBook`, `findBookByTitle`, `checkoutBook`, `returnBook` | Function signatures (parameter & return types) |
| 5 | `findBooksBy`'s `filter` parameter | Type aliases (union types) |
| 6 | `getFirstItem` | Basic generics |

## Expected output

Once fully converted, running the program should print exactly this:

```
== Full catalog ==
- The Hobbit (1937) by J.R.R. Tolkien [available]
- Dune (1965) by Frank Herbert [available]
- Foundation (1951) by Isaac Asimov [lost]
- Children of Time (2015) by Adrian Tchaikovsky [available]

== Checking out 'Dune' ==
Success: true
Success (already checked out): false

== Books by Frank Herbert ==
- Dune

== Books from 1937 ==
- The Hobbit

== First book in the catalog ==
The Hobbit

== Returning 'Dune' ==
available
```

## Scripts

| Command | What it does |
|---|---|
| `npm run typecheck` | Type-checks `src/` without emitting any files |
| `npm run build` | Compiles `src/` to `dist/` |
| `npm start` | Runs the compiled `dist/index.js` |
| `npm run dev` | Runs `src/index.ts` directly, no build step (fastest for iterating) |
| `npm run js` | Runs `src/index.js` directly, to see sample output with your own eyes |
````
