---
title: "src/app.ts · Week 3 in-class: MongoDB + Vitest"
editLink: false
---

# `src/app.ts`

From **Week 3 in-class: MongoDB + Vitest** · original: `si-679-f-26-week03-nyt-jessicadonoho/src/app.ts` · [all files in this project](/code/week03-nyt/)

```ts:line-numbers
import express from 'express';
import type { Request, Response } from 'express';
import { productRouter } from './product-router.js';

const app = express();

app.use(express.json());
app.use('/products', productRouter);

app.get('/greeting', (req: Request, res: Response): void => {
  res.send('Hello World!');
});

export { app };
```
