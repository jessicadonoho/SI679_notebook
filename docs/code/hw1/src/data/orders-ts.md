---
title: "src/data/orders.ts · HW1: SliceDrop API"
editLink: false
---

# `src/data/orders.ts`

From **HW1: SliceDrop API** · original: `si-679-f-26-hw1-jessicadonoho/src/data/orders.ts` · [all files in this project](/code/hw1/)

```ts:line-numbers
import { NewOrder, Order } from "../types";

// The order "database" for HW1: a plain array in memory.
// It is empty every time the server starts.
let orders: Order[] = [];
let nextId = 1;

export function addOrder(newOrder: NewOrder): Order {
  const order: Order = {
    id: String(nextId),
    status: "pending",
    createdAt: new Date().toISOString(),
    customerName: newOrder.customerName,
    items: newOrder.items,
  };

  nextId = nextId + 1;
  orders.push(order);
  return order;
}

export function listOrders(status?: string): Order[] {
  if (status === undefined) {
    return orders;
  }

  return orders.filter((order) => order.status === status);
}

// Test-only. Functions whose names start with `_` exist for tests and are
// never called by application code.
export function _resetOrders(): void {
  orders = [];
  nextId = 1;
}
```
