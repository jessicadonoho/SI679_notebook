---
title: "src/middleware/error-handler.ts · Week 4 in-class: REST layers"
editLink: false
---

# `src/middleware/error-handler.ts`

From **Week 4 in-class: REST layers** · original: `si-679-f-26-week-04-nyt-jessicadonoho/src/middleware/error-handler.ts` · [all files in this project](/code/week04-nyt/)

```ts:line-numbers
import type { NextFunction, Request, Response } from 'express';

// Four parameters, error first: that is how Express tells an error handler
// from ordinary middleware, so `next` stays in the list even though we
// call it.
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(500).send(`ERROR: ${err.message} encountered.`);
};
```
