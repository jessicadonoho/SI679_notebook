---
title: "src/index.ts · Week 3 in-class: MongoDB + Vitest"
editLink: false
---

# `src/index.ts`

From **Week 3 in-class: MongoDB + Vitest** · original: `si-679-f-26-week03-nyt-jessicadonoho/src/index.ts` · [all files in this project](/code/week03-nyt/)

```ts:line-numbers
import { app } from './app.js';
import { connect } from './db.js';

const port = 6790;

await connect('mongodb://127.0.0.1:27017', 'week3app');

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```
