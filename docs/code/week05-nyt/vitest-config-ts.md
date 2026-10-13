---
title: "vitest.config.ts · Week 5 in-class: testing"
editLink: false
---

# `vitest.config.ts`

From **Week 5 in-class: testing** · original: `si-679-f-26-week05-nyt-jessicadonoho/vitest.config.ts` · [all files in this project](/code/week05-nyt/)

```ts:line-numbers
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    hookTimeout: 120_000,
    testTimeout: 20_000
  }
});
```
