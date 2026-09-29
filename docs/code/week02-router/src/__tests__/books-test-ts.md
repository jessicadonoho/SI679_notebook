---
title: "src/__tests__/books.test.ts · Week 2 in-class: books router"
editLink: false
---

# `src/__tests__/books.test.ts`

From **Week 2 in-class: books router** · original: `week2-router/src/__tests__/books.test.ts` · [all files in this project](/code/week02-router/)

```ts:line-numbers
import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('GET /books', () => {
  it('starts out empty', async () => {
    const res = await request(app).get('/books');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
```
