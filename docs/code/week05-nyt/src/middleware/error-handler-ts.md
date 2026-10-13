---
title: "src/middleware/error-handler.ts · Week 5 in-class: testing"
editLink: false
---

# `src/middleware/error-handler.ts`

From **Week 5 in-class: testing** · original: `si-679-f-26-week05-nyt-jessicadonoho/src/middleware/error-handler.ts` · [all files in this project](/code/week05-nyt/)

```ts:line-numbers
import type { NextFunction, Request, Response } from 'express';
import { ValidationError } from '../errors.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message });
    return;
  }
  res.status(500).json({ error: 'Something went wrong' });
};
```
