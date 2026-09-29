---
title: "src/routers/orders.ts · HW1: SliceDrop API"
editLink: false
---

# `src/routers/orders.ts`

From **HW1: SliceDrop API** · original: `si-679-f-26-hw1-jessicadonoho/src/routers/orders.ts` · [all files in this project](/code/hw1/)

```ts:line-numbers
import { Request, Response, Router } from "express";
import { addOrder, listOrders } from "../data/orders";
import { requireCustomerToken, requireStaffToken } from "../middleware/auth";
import { validateOrder } from "../validation/validate-order";

// TODO: POST /orders  -- check the customer token BEFORE you look at the body.
//                        Then validate it: respond 400 with the problems if it
//                        is invalid, otherwise store it and respond 201 with
//                        the order. A request with no token never reaches
//                        validation, however bad its body is.
// TODO: GET /orders   -- staff token required. Supports ?status= filtering.

export const ordersRouter = Router();

ordersRouter.post("/", requireCustomerToken, (req:Request, res:Response)=>{
    const problems=validateOrder(req.body);
    if (problems.length>0){
        res.status(400).json({ errors: problems })
    } else{
        const order=addOrder(req.body)
        res.status(201).json(order)
    }
})

ordersRouter.get("/", requireStaffToken, (req, res) => {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    res.json(listOrders(status))
});
```
