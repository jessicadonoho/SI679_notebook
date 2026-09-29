---
title: "src/index.ts · Week 2 in-class: books router"
editLink: false
---

# `src/index.ts`

From **Week 2 in-class: books router** · original: `week2-router/src/index.ts` · [all files in this project](/code/week02-router/)

```ts:line-numbers
// import express from 'express';
// import { booksRouter } from './books-router.js';
// import type { Request, Response, NextFunction } from 'express';

// const app = express();
// const port = 6790; // note the change-up -- why don't we use 679?

// const errorHandler = (
//     err: Error, req: Request, res: Response, next: NextFunction
//   ): void => {
//     const message = `
//     ERROR: ${err.message} encountered. 
//     Here's a friendly stack trace:
//     ${err.stack}
//     `;
//     res.status(500).send(message);
//   }

// app.use('/books', booksRouter);
// app.use(errorHandler);

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });

// src/index.ts

import { app } from './app.js';

const port = 6790;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```
