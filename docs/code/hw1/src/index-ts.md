---
title: "src/index.ts · HW1: SliceDrop API"
editLink: false
---

# `src/index.ts`

From **HW1: SliceDrop API** · original: `si-679-f-26-hw1-jessicadonoho/src/index.ts` · [all files in this project](/code/hw1/)

```ts:line-numbers
import { app } from "./app";
import { PORT } from "./constants";

app.listen(PORT, () => {
  console.log(`SliceDrop listening on http://localhost:${PORT}`);
});
```
