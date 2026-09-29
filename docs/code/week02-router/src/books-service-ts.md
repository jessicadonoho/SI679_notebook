---
title: "src/books-service.ts · Week 2 in-class: books router"
editLink: false
---

# `src/books-service.ts`

From **Week 2 in-class: books router** · original: `week2-router/src/books-service.ts` · [all files in this project](/code/week02-router/)

```ts:line-numbers
import type { Book } from './types.js'; //note we import from .js

let catalog: Book[] = [];

export function addBook(book: Book): void {
  catalog.push(book);
}

export function getAllBooks(): Book[] {
  return catalog;
}

export function removeBook(id: number): void {
    catalog = catalog.filter(book => book.id !== id);
  }
```
