---
title: "src/routers/menu.ts · HW1: SliceDrop API"
editLink: false
---

# `src/routers/menu.ts`

From **HW1: SliceDrop API** · original: `si-679-f-26-hw1-jessicadonoho/src/routers/menu.ts` · [all files in this project](/code/hw1/)

```ts:line-numbers
import { Request, Response, Router } from "express";
import { findMenuItem, menu } from "../data/menu";

// TODO: GET /menu        -- the whole menu, or only one category when the
//                           request has a ?category= query string.

// TODO: GET /menu/:id    -- one menu item, or 404 with a JSON error body.

export const menuRouter = Router();

menuRouter.get("/", (req:Request, res:Response)=>{
    const category = req.query["category"];
    if (category){
        res.json(menu.filter(menuItem=>menuItem.category===category))
    } else{
        res.json(menu)
    }
})

menuRouter.get("/:id", (req:Request, res:Response)=>{
    const id = req.params.id;
    if (typeof id === "string"){
        const menuItem=findMenuItem(id);
        if (menuItem!==undefined){
            res.json(menuItem)
        } else{
            res.status(404).send({error:"This item cannot be found."})
        }
    }
})
```
