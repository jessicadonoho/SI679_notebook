---
title: "vitest.config.ts · Week 3 in-class: MongoDB + Vitest"
editLink: false
---

# `vitest.config.ts`

From **Week 3 in-class: MongoDB + Vitest** · original: `si-679-f-26-week03-nyt-jessicadonoho/vitest.config.ts` · [all files in this project](/code/week03-nyt/)

```ts:line-numbers
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Starting a throwaway MongoDB takes longer than Vitest's default
    // 10-second limit for setup code — especially the first time, when it
    // has to download the database itself.
    hookTimeout: 120_000,
    testTimeout: 20_000,
  },
});
```
