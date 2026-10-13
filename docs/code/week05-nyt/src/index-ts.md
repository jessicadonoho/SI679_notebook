---
title: "src/index.ts · Week 5 in-class: testing"
editLink: false
---

# `src/index.ts`

From **Week 5 in-class: testing** · original: `si-679-f-26-week05-nyt-jessicadonoho/src/index.ts` · [all files in this project](/code/week05-nyt/)

```ts:line-numbers
import { app } from './app.js';
import { connect } from './db/db.js';

const port = 6790;

await connect();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```
