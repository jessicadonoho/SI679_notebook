---
title: "src/types.ts · HW1: SliceDrop API"
editLink: false
---

# `src/types.ts`

From **HW1: SliceDrop API** · original: `si-679-f-26-hw1-jessicadonoho/src/types.ts` · [all files in this project](/code/hw1/)

```ts:line-numbers
// Shared types for the SliceDrop backend.

export type Category = "pizza" | "appetizer" | "side" | "beverage";

export interface SizeOption {
  name: string;
  price: number;
}

export interface ToppingOption {
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: Category;
  description?: string;
  /** Flat price, for items that do not come in sizes. */
  price?: number;
  /** The option lists below are present only when they apply to the item. */
  sizes?: SizeOption[];
  crusts?: string[];
  sauces?: string[];
  toppings?: ToppingOption[];
}

export type OrderStatus = "pending" | "in-progress" | "completed";

export interface OrderItem {
  menuItemId: string;
  quantity: number;
  size?: string;
  crust?: string;
  sauce?: string;
  toppings?: string[];
}

/** What a customer sends to POST /orders. */
export interface NewOrder {
  customerName: string;
  items: OrderItem[];
}

/** What the server stores and returns. */
export interface Order extends NewOrder {
  id: string;
  status: OrderStatus;
  createdAt: string;
}
```
