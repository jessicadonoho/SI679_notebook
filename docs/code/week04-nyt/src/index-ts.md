---
title: "src/index.ts · Week 4 in-class: REST layers"
editLink: false
---

# `src/index.ts`

From **Week 4 in-class: REST layers** · original: `si-679-f-26-week-04-nyt-jessicadonoho/src/index.ts` · [all files in this project](/code/week04-nyt/)

```ts:line-numbers
import { app } from './app.js';
import { db } from './db/db.js';

const port = 6790;

await db.init();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```
