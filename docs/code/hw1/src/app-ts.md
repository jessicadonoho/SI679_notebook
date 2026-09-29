---
title: "src/app.ts · HW1: SliceDrop API"
editLink: false
---

# `src/app.ts`

From **HW1: SliceDrop API** · original: `si-679-f-26-hw1-jessicadonoho/src/app.ts` · [all files in this project](/code/hw1/)

```ts:line-numbers
import express, { NextFunction, Request, Response } from "express";
import { menuRouter } from "./routers/menu";
import { ordersRouter } from "./routers/orders";

export const app = express();

// GIVEN: express.json() turns a JSON request body into req.body, and the two
// lines after it mount your routers. Middleware runs in the order it is
// registered here -- that ordering is the whole subject of the week 2 notes,
// and it matters again a few lines down.
app.use(express.json());
app.use("/menu", menuRouter);
app.use("/orders", ordersRouter);

// TODO: a request that no router handled should get a 404 with a JSON error
// body, not Express's default HTML page.
app.use((req:Request, res:Response)=>{
    res.status(404).send({error:"This page does not exist."})
})


// TODO: a fall-through error handler. Express recognizes it by its FOUR
// parameters (err, req, res, next) and will not treat it as one unless all
// four are in the list, even though you will not call next().
//
// Express sends it EVERY error, and there are two kinds:
//
//   1. express.json() throws when the request body is not valid JSON. That is
//      the client's mistake, so it is a 400. Express tags those errors as a
//      SyntaxError with a `body` property, which is how you can recognize
//      them.
//   2. Anything else got here because your own code threw. That is your
//      mistake, not the client's, so it is a 500 -- and worth logging, since
//      nobody else is going to see it.
//
// Answering 400 to both is the tempting shortcut. Don't: it tells a caller to
// fix a request that was perfectly fine, with a message that isn't true.

app.use((err:Error, req:Request, res:Response, next:NextFunction): void=>{
    const message = `
    ERROR: ${err.message} encountered. 
    Here's a friendly stack trace:
    ${err.stack}
    `;
    if (err instanceof SyntaxError && "body" in err){
        res.status(400).send({error:err.message});
    } else {
        res.status(500).send({error:"An error has occurred on our end"});
        console.error(message);
    }
})
```
