---
title: "src/db.ts · Week 3 in-class: MongoDB + Vitest"
editLink: false
---

# `src/db.ts`

From **Week 3 in-class: MongoDB + Vitest** · original: `si-679-f-26-week03-nyt-jessicadonoho/src/db.ts` · [all files in this project](/code/week03-nyt/)

```ts:line-numbers
import { MongoClient, ObjectId } from 'mongodb';
import type { Collection } from 'mongodb';

export interface Product {
  name: string;
  price: number;
  quantity: number;
}

export interface ProductUpdate {
  name?: string;
  price?: number;
  quantity?: number;
}

// same as   export type ProductUpdate = Partial<Product>;
// https://www.typescriptlang.org/docs/handbook/utility-types.html

let client: MongoClient;
let productsCollection: Collection;

export const connect = async (uri: string, dbName: string) => {
  client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  productsCollection = db.collection('products');
};

export const disconnect = async () => {
  await client.close();
};

//the getters
export const getAllProducts = async () => {
    return await productsCollection.find().toArray();
    //easier than cursor
};

export const getProduct = async (id: string) => {
    return await productsCollection.findOne({ _id: new ObjectId(id) });
};

//CRUD functions?
export const addProduct = async (product: Product) => {
    const result = await productsCollection.insertOne(product);
    return result.insertedId;
};

export const updateProduct = async (id: string, changes: ProductUpdate) => {
    const result = await productsCollection.updateOne({ _id: new ObjectId(id) }, { $set: changes });
    return result.matchedCount;
};
//will only change the fields that are being specified

export const deleteProduct = async (id: string) => {
    const result = await productsCollection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount;
};

// Only for tests. Never called by the app.
export const _clearProducts = async () => {
  await productsCollection.deleteMany({});
};
// delete many with empty entry will delete the whole collection
```
