---
title: "src/__tests__/products.test.ts · Week 3 in-class: MongoDB + Vitest"
editLink: false
---

# `src/__tests__/products.test.ts`

From **Week 3 in-class: MongoDB + Vitest** · original: `si-679-f-26-week03-nyt-jessicadonoho/src/__tests__/products.test.ts` · [all files in this project](/code/week03-nyt/)

```ts:line-numbers
import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { connect } from '../db.js';

await connect('mongodb://127.0.0.1:27017', 'week3test');

describe('POST /products', () => {
  it('adds a product we can then read back', async () => {
    const created = await request(app)
      .post('/products')
      .send({ name: 'Duct Tape', price: 5.99, quantity: 120 });
    expect(created.status).toBe(201);
    expect(created.body.id).toMatch(/^[0-9a-f]{24}$/);

    const all = await request(app).get('/products');
    expect(all.body).toHaveLength(1);
  });
});
```
