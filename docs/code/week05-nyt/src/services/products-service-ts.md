---
title: "src/services/products-service.ts · Week 5 in-class: testing"
editLink: false
---

# `src/services/products-service.ts`

From **Week 5 in-class: testing** · original: `si-679-f-26-week05-nyt-jessicadonoho/src/services/products-service.ts` · [all files in this project](/code/week05-nyt/)

```ts:line-numbers
import * as productsRepository from '../db/products-repository.js';
import { ValidationError } from '../errors.js';
import type {
  NewProduct,
  Product,
  ProductFields
} from '../models/product.js';

const LOW_STOCK_THRESHOLD = 5;

const withDefaults = (fields: ProductFields): NewProduct => {
  return {
    modelName: fields.modelName ?? '',
    modelNumber: fields.modelNumber ?? '',
    manufacturer: fields.manufacturer ?? '',
    color: fields.color ?? '',
    price: fields.price ?? 0,
    quantity: fields.quantity ?? 0
  };
};

export const getAllProducts = async (): Promise<Product[]> => {
  return productsRepository.findAllProducts();
};

export const getProduct = async (id: string): Promise<Product | null> => {
  return productsRepository.findProduct(id);
};

export const getLowStockProducts = async (
  threshold: number = LOW_STOCK_THRESHOLD
): Promise<Product[]> => {
  const products = await productsRepository.findAllProducts();
  return products.filter((product) => product.quantity < threshold);
};

export const createProduct = async (
  fields: ProductFields
): Promise<Product> => {
  return productsRepository.insertProduct(withDefaults(fields));
};

export const updateProduct = async (
  id: string,
  changes: ProductFields
): Promise<Product | null> => {
  const existing = await productsRepository.findProduct(id);
  if (!existing) {
    return null;
  }

  const quantity = changes.quantity ?? existing.quantity;
  const price = changes.price ?? existing.price;

  if (quantity < 0) {
    throw new ValidationError('quantity cannot be negative');
  }
  if (price < 0) {
    throw new ValidationError('price cannot be negative');
  }

  return productsRepository.updateProduct(id, changes);
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  return productsRepository.deleteProduct(id);
};
```
