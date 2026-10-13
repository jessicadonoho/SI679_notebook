---
title: "src/__tests__/test-products.ts · Week 5 in-class: testing"
editLink: false
---

# `src/__tests__/test-products.ts`

From **Week 5 in-class: testing** · original: `si-679-f-26-week05-nyt-jessicadonoho/src/__tests__/test-products.ts` · [all files in this project](/code/week05-nyt/)

```ts:line-numbers
import type { NewProduct } from '../models/product.js';

export const testProducts: NewProduct[] = [
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
  },
  {
    modelName: '12-Cup Programmable Coffee Maker',
    modelNumber: 'MK-B-DCMzz1',
    manufacturer: 'REVOTRA',
    color: 'Silver/Black',
    price: 44.77,
    quantity: 3
  },
  {
    modelName: 'Single Serve Coffee Maker',
    modelNumber: 'SS-100',
    manufacturer: 'Keurig',
    color: 'Black',
    price: 79.99,
    quantity: 0
  }
];
```
