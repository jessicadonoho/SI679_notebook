---
title: "vitest.config.ts · Week 4 in-class: REST layers"
editLink: false
---

# `vitest.config.ts`

From **Week 4 in-class: REST layers** · original: `si-679-f-26-week-04-nyt-jessicadonoho/vitest.config.ts` · [all files in this project](/code/week04-nyt/)

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
