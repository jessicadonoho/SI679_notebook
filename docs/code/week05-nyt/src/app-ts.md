---
title: "src/app.ts · Week 5 in-class: testing"
editLink: false
---

# `src/app.ts`

From **Week 5 in-class: testing** · original: `si-679-f-26-week05-nyt-jessicadonoho/src/app.ts` · [all files in this project](/code/week05-nyt/)

```ts:line-numbers
import express from 'express';
import { productsRouter } from './routes/products-router.js';
import { errorHandler } from './middleware/error-handler.js';

const app = express();

app.use(express.json());
app.use('/products', productsRouter);
app.use(errorHandler);

export { app };
```
