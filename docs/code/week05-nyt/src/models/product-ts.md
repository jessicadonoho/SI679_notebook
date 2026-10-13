---
title: "src/models/product.ts · Week 5 in-class: testing"
editLink: false
---

# `src/models/product.ts`

From **Week 5 in-class: testing** · original: `si-679-f-26-week05-nyt-jessicadonoho/src/models/product.ts` · [all files in this project](/code/week05-nyt/)

```ts:line-numbers
export type Product = {
  id: string;
  modelName: string;
  modelNumber: string;
  manufacturer: string;
  color: string;
  price: number;
  quantity: number;
};

export type NewProduct = {
  modelName: string;
  modelNumber: string;
  manufacturer: string;
  color: string;
  price: number;
  quantity: number;
};

export type ProductFields = Partial<Product>;
```
