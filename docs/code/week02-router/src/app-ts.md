---
title: "src/app.ts · Week 2 in-class: books router"
editLink: false
---

# `src/app.ts`

From **Week 2 in-class: books router** · original: `week2-router/src/app.ts` · [all files in this project](/code/week02-router/)

```ts:line-numbers
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { booksRouter } from './books-router.js';
const app = express();
const errorHandler = (
  err: Error, req: Request, res: Response, next: NextFunction
): void => {
  const message = `
  ERROR: ${err.message} encountered. 
  Here's a friendly stack trace:
  ${err.stack}
  `;
  res.status(500).send(message);
}
app.use('/books', booksRouter);
app.use(errorHandler);
export { app };
```
