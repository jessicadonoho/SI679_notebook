---
title: "src/validation/validate-order.ts · HW1: SliceDrop API"
editLink: false
---

# `src/validation/validate-order.ts`

From **HW1: SliceDrop API** · original: `si-679-f-26-hw1-jessicadonoho/src/validation/validate-order.ts` · [all files in this project](/code/hw1/)

```ts:line-numbers
import { MenuItem } from "../types";
import { findMenuItem } from "../data/menu";
import { cursorTo } from "node:readline";

/**
 * Checks an incoming POST /orders body. Returns a list of every problem
 * found; an empty list means the order is valid.
 *
 * This is a plain function, not middleware -- your route handler calls it and
 * decides how to respond. That is deliberate: a plain function is easy to
 * reason about and easy to test on its own.
 *
 * An order is invalid if:
 *   - customerName is missing, not a string, or blank
 *   - items is missing, not an array, or empty
 *   - any item names a menuItemId that is not on the menu
 *   - any item's quantity is not a whole number of at least 1
 *   - any item asks for a size, crust, sauce, or topping that the menu item
 *     does not offer  (the four helpers at the bottom answer that for you)
 *
 * Collect ALL the problems and return them together -- do not stop at the
 * first one. A customer who sends three bad fields should be told about all
 * three, not made to guess one at a time.
 */
export function validateOrder(body: any): string[] {
  // TODO
  let problems:string[] = []
  if (typeof body.customerName !== "string" || body.customerName.trim().length === 0){
    problems.push("Customer name is required")
  }
  if (!Array.isArray(body.items) || body.items.length===0){
    problems.push("No items have been added to the order")
    return problems;
  }
  for (const item of body.items){
    let realMenuItem=findMenuItem(item.menuItemId)
    if (!realMenuItem){
      problems.push(`${item.menuItem} is not on the menu.`)
    } else{
      if (item.quantity<1 || !Number.isInteger(item.quantity)){
        problems.push(`Quantity of ${realMenuItem} must be a whole number.`)
      }
      if (item.size!==undefined){
        if (!offersSize(realMenuItem, item.size)){
          problems.push("That size is not offered.")
        }
      }
      if (item.crust!==undefined){
        if (!offersCrust(realMenuItem, item.crust)){
          problems.push(`Crust is not offered for ${realMenuItem}.`)
        }
      }
      if (item.sauce!==undefined){
        if (!offersSauce(realMenuItem, item.sauce)){
          problems.push(`Sauce is not offered for ${realMenuItem}.`)
        }
      }
      if (item.topping!==undefined){
        if (!offersTopping(realMenuItem, item.topping)){
          problems.push(`Toppings are not offered for ${realMenuItem}.`)
        }
      }
    }
  }
  return problems;
}

// ---------------------------------------------------------------------------
// GIVEN. These four answer "does this menu item offer that option?" They are
// written for you because they are all the same shape and none of them is the
// point of this assignment. Read them -- you are going to call them.
// ---------------------------------------------------------------------------

function offersSize(menuItem: MenuItem, size: string): boolean {
  if (menuItem.sizes === undefined) {
    return false;
  }
  return menuItem.sizes.some((option) => option.name === size);
}

function offersCrust(menuItem: MenuItem, crust: string): boolean {
  if (menuItem.crusts === undefined) {
    return false;
  }
  return menuItem.crusts.includes(crust);
}

function offersSauce(menuItem: MenuItem, sauce: string): boolean {
  if (menuItem.sauces === undefined) {
    return false;
  }
  return menuItem.sauces.includes(sauce);
}

function offersTopping(menuItem: MenuItem, topping: string): boolean {
  if (menuItem.toppings === undefined) {
    return false;
  }
  return menuItem.toppings.some((option) => option.name === topping);
}
```
