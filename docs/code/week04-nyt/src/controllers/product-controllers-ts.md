---
title: "src/controllers/product-controllers.ts · Week 4 in-class: REST layers"
editLink: false
---

# `src/controllers/product-controllers.ts`

From **Week 4 in-class: REST layers** · original: `si-679-f-26-week-04-nyt-jessicadonoho/src/controllers/product-controllers.ts` · [all files in this project](/code/week04-nyt/)

```ts:line-numbers
import type { Request, Response } from 'express';
import { productService } from '../services/product-service.js';

const getProducts = async (req: Request, res: Response): Promise<void> => {
    const allProducts = await productService.getAll();
    res.json(allProducts);
};

// export const productControllers = {
//     getProducts
// };

const addProduct = async (req: Request, res: Response): Promise<void> => {
    const postData = req.body;
    const { id } = await productService.add(postData);
    res.status(201).json({ id });
};

// FIXED (was `getProductbyId`):
//   1. It called itself (`getProductbyId(...)`) instead of the service, which
//      is infinite recursion AND the wrong layer. Controllers talk to the
//      service; the service talks to the db.
//   2. It never sent a response, so the request would hang forever.
//   3. Nothing handled "no product with that id" -- now we send a 404.
//   4. Renamed to `getProductById` (capital B) to match the service name.
const getProductById = async (req: Request, res: Response): Promise<void> => {
    const product = await productService.getProductById(String(req.params.id));
    if (!product) {
        res.status(404).send({error: `Not found: no product with id of ${req.params.id}`});
        return;
    }
    res.json(product);
};

// FIXED: added getProductById to the export so the routes layer can use it
// (routes still need to be wired up -- that part is untouched).
export const productControllers = {
    getProducts,
    addProduct,
    getProductById
};
```
