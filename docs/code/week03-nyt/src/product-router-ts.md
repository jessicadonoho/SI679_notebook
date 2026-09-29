---
title: "src/product-router.ts · Week 3 in-class: MongoDB + Vitest"
editLink: false
---

# `src/product-router.ts`

From **Week 3 in-class: MongoDB + Vitest** · original: `si-679-f-26-week03-nyt-jessicadonoho/src/product-router.ts` · [all files in this project](/code/week03-nyt/)

```ts:line-numbers
import express from 'express';
import type { Request, Response } from 'express';
import { addProduct, deleteProduct, getAllProducts, getProduct, updateProduct } from './db.js';
import type { Product, ProductUpdate } from './db.js';

export const productRouter = express.Router();

productRouter.get('/', async (req: Request, res: Response) => {
    const all = await getAllProducts();
    res.json(all);
  });


productRouter.get('/:id', async (req: Request, res: Response) => {
  const product = await getProduct(String(req.params.id));
  if (!product) { //if product is undefined, send 404
    res.sendStatus(404);
    return; //break
  }
  res.json(product);
});

productRouter.post('/', async (req: Request, res: Response) => {
  const product: Product = {
    name: req.body.name,
    price: req.body.price,
    quantity: req.body.quantity
  };
  const id = await addProduct(product);
  res.status(201).json({ id });
});

productRouter.patch('/:id', async (req: Request, res: Response) => {
  const changes: ProductUpdate = req.body;
  const matched = await updateProduct(String(req.params.id), changes);
  if (matched === 0) {
    res.sendStatus(404);
    return;
  }
  res.sendStatus(200);
});

productRouter.delete('/:id', async (req: Request, res: Response) => {
  const deleted = await deleteProduct(String(req.params.id));
  if (deleted === 0) {
    res.sendStatus(404);
    return;
  }
  res.sendStatus(200);
});
```
