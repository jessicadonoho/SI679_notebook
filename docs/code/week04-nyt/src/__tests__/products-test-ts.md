---
title: "src/__tests__/products.test.ts · Week 4 in-class: REST layers"
editLink: false
---

# `src/__tests__/products.test.ts`

From **Week 4 in-class: REST layers** · original: `si-679-f-26-week-04-nyt-jessicadonoho/src/__tests__/products.test.ts` · [all files in this project](/code/week04-nyt/)

```ts:line-numbers
import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it
  } from 'vitest';
  import request from 'supertest';
  import { MongoMemoryServer } from 'mongodb-memory-server';
  import { app } from '../app.js';
  import { db } from '../db/db.js';
  import type { Product } from '../models/products.js';
  
  let mongo: MongoMemoryServer;
  
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await db.init(mongo.getUri(), 'test');
  });
  
  afterAll(async () => {
    await db.disconnect();
    await mongo.stop();
  });

  // The same two coffee makers we imported into Compass — except this time
// the test puts them there, so it knows exactly what a correct answer
// looks like.
const twoCoffeeMakers = [
  {
    modelName: '14 Cup Programmable Coffee Maker',
    modelNumber: '2143561',
    manufacturer: 'Mr. Coffee',
    color: 'Silver',
    price: 89.99,
    quantity: 120
  },
  {
    modelName: 'BrewSense 12 Cup Drip Coffee Maker',
    modelNumber: 'KF7150BK',
    manufacturer: 'Braun',
    color: 'Stainless Steel and Black',
    price: 129.95,
    quantity: 78
  }
];

beforeEach(async () => {
  await db._clearCollection(db.PRODUCTS);
  for (const coffeeMaker of twoCoffeeMakers) {
    await db.addToCollection(db.PRODUCTS, coffeeMaker);
  }
});

it('lists the products that are in the database', async () => {
    const res = await request(app).get('/products');
  
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  
    const manufacturers = res.body.map(
      (product: Product) => product.manufacturer
    );
    expect(manufacturers).toEqual(['Mr. Coffee', 'Braun']);
    expect(manufacturers).not.toContain('REVOTRA');
});

it('lists the products that are in the database', async () => {
    const res = await request(app).get('/products');
  
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  
    const manufacturers = res.body.map(
      (product: Product) => product.manufacturer
    );
    expect(manufacturers).toEqual(['Mr. Coffee', 'Braun']);
    expect(manufacturers).not.toContain('REVOTRA');
  });

describe('POST /products', () => {
    it('adds a product we can then read back', async () => {
      const created = await request(app).post('/products').send({
        modelName: '12-Cup Programmable Coffee Maker',
        modelNumber: 'MK-B-DCM01',
        manufacturer: 'REVOTRA',
        color: 'Silver/Black',
        price: 44.77,
        quantity: 312
      });
  
      expect(created.status).toBe(201);
      expect(created.body.id).toMatch(/^[0-9a-f]{24}$/);
  
      const all = await request(app).get('/products');
      expect(all.body).toHaveLength(3);
  
      const manufacturers = all.body.map(
        (product: Product) => product.manufacturer
      );
      expect(manufacturers).toContain('REVOTRA');
    });

    it("should accept a post with missing fields", async()=>{
        const partialProduct = await request(app).post('/products').send({
            modelName: 'Whipped Cream',
            modelNumber: 'FR3-80085-900',
            manufacturer: 'halloworlf'
        });
        expect(partialProduct.status).toBe(201);
        // expect(partialProduct.body.id).toMatch(/^[0-9a-f]{24}$/);
        //get product using id from database
        const all = await request(app).get('/products');

        const colors = all.body.map(
            (product: Product) => product.color
        );
        const price = all.body.map(
            (product: Product) => product.price
        );
        const quantity = all.body.map(
            (product: Product) => product.quantity
        );
        expect(colors[2]).toBe("");
        expect(price[2]).toBe(0.0);
        expect(quantity[2]).toBe(0);



        //do a post
        //provided: shows up
        //not provided: use default
    })
});

describe('GET /products/:id', ()=>{
    it("finds a product through an id", async()=>{

    })
})
```
