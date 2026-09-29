---
title: "src/routes/product-routes.ts · Week 4 in-class: REST layers"
editLink: false
---

# `src/routes/product-routes.ts`

From **Week 4 in-class: REST layers** · original: `si-679-f-26-week-04-nyt-jessicadonoho/src/routes/product-routes.ts` · [all files in this project](/code/week04-nyt/)

```ts:line-numbers
import express from 'express';
import { productControllers } from '../controllers/product-controllers.js';

export const productRouter = express.Router();

productRouter.get('/', productControllers.getProducts);

//for single route, overkill, otherwise, fine

productRouter.post('/', productControllers.addProduct);

productRouter.get('/:id', productControllers.getProductById);
```
