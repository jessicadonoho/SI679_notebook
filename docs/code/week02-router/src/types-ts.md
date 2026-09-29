---
title: "src/types.ts · Week 2 in-class: books router"
editLink: false
---

# `src/types.ts`

From **Week 2 in-class: books router** · original: `week2-router/src/types.ts` · [all files in this project](/code/week02-router/)

```ts:line-numbers
export const enum BookStatus {
    STATUS_AVAILABLE,
    STATUS_CHECKED_OUT,
    STATUS_LOST
  }
  export interface Book {
    id: number,
    title: string,
    author: string,
    year: number,
    status: BookStatus
  }
  export type BookFilter = string | number;
```
