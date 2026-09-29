---
title: "src/services/product-service.ts · Week 4 in-class: REST layers"
editLink: false
---

# `src/services/product-service.ts`

From **Week 4 in-class: REST layers** · original: `si-679-f-26-week-04-nyt-jessicadonoho/src/services/product-service.ts` · [all files in this project](/code/week04-nyt/)

```ts:line-numbers
import { db } from '../db/db.js';
// FIXED: removed `import { getThroughID } from '../db/db.js'`. db.ts only
// exports the `db` object, not getThroughID by itself, so that import was a
// compile error. We already reach it as `db.getThroughID`.
// FIXED: removed unused `Db`, `Document`, `InsertOneResult` type imports --
// the service returns Products, so it no longer needs Mongo types at all.
import {
  productFromDocument,
  productFromFields
} from '../models/products.js';
import type { Product, ProductFields } from '../models/products.js';

const getAll = async (): Promise<Product[]> => {
    const productDocs = await db.getAllInCollection(db.PRODUCTS);
    return productDocs.map((pDoc) => productFromDocument(pDoc));
};
//await: expects a promise and awaits the resolution

// export const productService = {
//     getAll
// };

const add = async (productInfo: ProductFields): Promise<Product> => {
    const { insertedId } = await db.addToCollection(db.PRODUCTS, productInfo);
    return productFromFields({ ...productInfo, id: insertedId.toString() });
};


const getProductById = async (id: string): Promise<Product | null> => {
    // FIXED: arguments were swapped -- getThroughID takes (id, collectionName),
    // but was called with (db.PRODUCTS, id), so it searched for an _id of
    // "products" in a collection named after the id.
    const productDoc = await db.getThroughID(id, db.PRODUCTS);
    if (!productDoc){
        return null;
    }
    return productFromDocument(productDoc);
}

export const productService = {
    getAll,
    add,
    getProductById
};
```
