---
title: "src/data/menu.ts · HW1: SliceDrop API"
editLink: false
---

# `src/data/menu.ts`

From **HW1: SliceDrop API** · original: `si-679-f-26-hw1-jessicadonoho/src/data/menu.ts` · [all files in this project](/code/hw1/)

```ts:line-numbers
import { MenuItem, ToppingOption } from "../types";

// Every pizza can take any of the standard toppings.
const STANDARD_TOPPINGS: ToppingOption[] = [
  { name: "pepperoni", price: 1.25 },
  { name: "italian sausage", price: 1.25 },
  { name: "ham", price: 1.25 },
  { name: "onion", price: 1.25 },
  { name: "mushroom", price: 1.25 },
  { name: "green pepper", price: 1.25 },
  { name: "black olive", price: 1.25 },
  { name: "pineapple", price: 1.25 },
];

const CRUSTS = ["thin", "hand-tossed", "deep-dish"];

const DIPPING_SAUCES = ["marinara", "honey mustard", "ranch", "garlic butter"];

export const menu: MenuItem[] = [
  {
    id: "hawaiian",
    name: "Hawaiian",
    category: "pizza",
    description: "Pineapple and ham.",
    sizes: [
      { name: "small", price: 11.99 },
      { name: "medium", price: 13.99 },
      { name: "large", price: 15.99 },
    ],
    crusts: CRUSTS,
    toppings: STANDARD_TOPPINGS,
  },
  {
    id: "meat-lovers",
    name: "Meat Lovers",
    category: "pizza",
    description: "Pepperoni, italian sausage, and ham.",
    sizes: [
      { name: "small", price: 11.99 },
      { name: "medium", price: 13.99 },
      { name: "large", price: 15.99 },
    ],
    crusts: CRUSTS,
    toppings: STANDARD_TOPPINGS,
  },
  {
    id: "build-your-own",
    name: "Build Your Own",
    category: "pizza",
    description: "Cheese pizza. Add your own toppings.",
    sizes: [
      { name: "small", price: 9.99 },
      { name: "medium", price: 11.99 },
      { name: "large", price: 13.99 },
    ],
    crusts: CRUSTS,
    toppings: STANDARD_TOPPINGS,
  },
  {
    id: "bread-nugz",
    name: "Bread Nugz",
    category: "appetizer",
    description: "Comes with one sauce.",
    sizes: [
      { name: "12 pc", price: 6.99 },
      { name: "24 pc", price: 9.99 },
    ],
    sauces: DIPPING_SAUCES,
  },
  {
    id: "dipping-sauce",
    name: "Dipping Sauce",
    category: "side",
    price: 0.75,
    sauces: DIPPING_SAUCES,
  },
  {
    id: "soda",
    name: "Soda",
    category: "beverage",
    description: "Coke, Diet Coke, Sprite, Diet Sprite, or Lemonade.",
    sizes: [
      { name: "20 oz", price: 1.99 },
      { name: "2 liter", price: 3.99 },
    ],
  },
];

export function findMenuItem(id: string): MenuItem | undefined {
  return menu.find((item) => item.id === id);
}
```
