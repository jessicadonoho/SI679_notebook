---
title: "src/app.ts · Week 4 in-class: REST layers"
editLink: false
---

# `src/app.ts`

From **Week 4 in-class: REST layers** · original: `si-679-f-26-week-04-nyt-jessicadonoho/src/app.ts` · [all files in this project](/code/week04-nyt/)

```ts:line-numbers
import express from 'express';
import { productRouter } from './routes/product-routes.js';
import { errorHandler } from './middleware/error-handler.js';

const app = express();

app.use(express.json());
app.use('/products', productRouter);

// Error handlers go LAST, after every route. Express runs middleware in the
// order it was registered, so one registered before the routes never sees
// what they throw.
app.use(errorHandler);

export { app };
```
