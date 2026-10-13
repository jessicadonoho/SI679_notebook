---
title: "src/services/products-services.unit.test.ts · Week 5 in-class: testing"
editLink: false
---

# `src/services/products-services.unit.test.ts`

From **Week 5 in-class: testing** · original: `si-679-f-26-week05-nyt-jessicadonoho/src/services/products-services.unit.test.ts` · [all files in this project](/code/week05-nyt/)

```ts:line-numbers
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as productsService from './products-service.js';
import * as productsRepository from '../db/products-repository.js';
import { ValidationError } from '../errors.js';
import type { Product, ProductFields } from '../models/product.js';

beforeEach(() => {
  vi.restoreAllMocks();
});

const makeProduct = (fields: ProductFields): Product => {
    return {
      id: fields.id ?? 'aaaaaaaaaaaaaaaaaaaaaaaa',
      modelName: fields.modelName ?? 'Test Product',
      modelNumber: fields.modelNumber ?? 'TP-1',
      manufacturer: fields.manufacturer ?? 'Test',
      color: fields.color ?? 'Black',
      price: fields.price ?? 10,
      quantity: fields.quantity ?? 10
    };
  };

  it('returns only the products below the threshold', async () => {
    vi.spyOn(productsRepository, 'findAllProducts').mockResolvedValue([
      makeProduct({ modelName: 'Plenty', quantity: 100 }),
      makeProduct({ modelName: 'Few', quantity: 2 }),
      makeProduct({ modelName: 'None', quantity: 0 })
    ]);
  
    const low = await productsService.getLowStockProducts(5);
  
    const names = low.map((product) => product.modelName);
  
    expect(names).toEqual(['Few', 'None']);
  });

  it('does not count a product sitting on the threshold', async () => {
    vi.spyOn(productsRepository, 'findAllProducts').mockResolvedValue([
      makeProduct({ modelName: 'Exactly five', quantity: 5 })
    ]);
  
    const low = await productsService.getLowStockProducts(5);
  
    expect(low).toHaveLength(0);
  });

  it('asks the repository to change only what it was given', async () => {
    vi.spyOn(productsRepository, 'findProduct').mockResolvedValue(
      makeProduct({ price: 10 })
    );
    const update = vi
      .spyOn(productsRepository, 'updateProduct')
      .mockResolvedValue(makeProduct({ price: 12.5 }));
  
    await productsService.updateProduct('abc', { price: 12.5 });
  
    expect(update).toHaveBeenCalledWith('abc', { price: 12.5 });
  });

  it('writes nothing when quantity would go negative', async () => {
    vi.spyOn(productsRepository, 'findProduct').mockResolvedValue(
      makeProduct({ quantity: 10 })
    );
    const update = vi.spyOn(productsRepository, 'updateProduct');
  
    await expect(
      productsService.updateProduct('abc', { quantity: -1 })
    ).rejects.toThrow(ValidationError);
  
    expect(update).not.toHaveBeenCalled();
  });
```
