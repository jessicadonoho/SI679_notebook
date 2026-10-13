---
title: "src/routes/products-router.ts · Week 5 in-class: testing"
editLink: false
---

# `src/routes/products-router.ts`

From **Week 5 in-class: testing** · original: `si-679-f-26-week05-nyt-jessicadonoho/src/routes/products-router.ts` · [all files in this project](/code/week05-nyt/)

```ts:line-numbers
import express from 'express';
import * as productsController from '../controllers/products-controller.js';

export const productsRouter = express.Router();

productsRouter.get('/', productsController.getProducts);
productsRouter.get('/:id', productsController.getProduct);
productsRouter.post('/', productsController.postProduct);
productsRouter.patch('/:id', productsController.patchProduct);
productsRouter.delete('/:id', productsController.deleteProduct);
```
