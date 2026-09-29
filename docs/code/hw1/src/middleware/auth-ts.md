---
title: "src/middleware/auth.ts · HW1: SliceDrop API"
editLink: false
---

# `src/middleware/auth.ts`

From **HW1: SliceDrop API** · original: `si-679-f-26-hw1-jessicadonoho/src/middleware/auth.ts` · [all files in this project](/code/hw1/)

```ts:line-numbers
import { NextFunction, Request, Response } from "express";
import { CUSTOMER_TOKEN, STAFF_TOKEN } from "../constants";
import { parse } from "node:path";

/**
 * Pulls the token out of an `Authorization: Bearer <token>` header value.
 * Returns null when the header is missing or is not in that exact form.
 *
 * This is a plain function, not middleware, so you can test it directly.
 */
export function parseBearerToken(header: string | undefined): string | null {
  if (header){
    const parts=header.split(" ");
    if (parts[0]==="Bearer" &&
    parts.length===2 &&
    parts[1]!==""
    ){
      return header.split(' ')[1];
    }
  }
  return null;
}

// TODO: respond 401 with a JSON error body when the header is missing, is not
// `Bearer <token>`, or does not match the expected token. Otherwise call next().
export function requireCustomerToken(req: Request, res: Response, next: NextFunction): void {
  const header=parseBearerToken(req.headers.authorization);
  if (header && header===CUSTOMER_TOKEN){
    next()
  } else{
    res.status(401).send({"Error":"Token is missing or does not match."})
  }
}

export function requireStaffToken(req: Request, res: Response, next: NextFunction): void {
  const header=parseBearerToken(req.headers.authorization);
  if (header && header===STAFF_TOKEN){
    next()
  } else{
    res.status(401).send({"Error":"Token is missing or does not match."})
  }
}
```
