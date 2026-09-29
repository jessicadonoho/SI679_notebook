---
title: "tsconfig.json · Week 3 in-class: MongoDB + Vitest"
editLink: false
---

# `tsconfig.json`

From **Week 3 in-class: MongoDB + Vitest** · original: `si-679-f-26-week03-nyt-jessicadonoho/tsconfig.json` · [all files in this project](/code/week03-nyt/)

```json:line-numbers
{
  "compilerOptions": {
    "module": "nodenext",
    "target": "esnext",
    "lib": ["esnext"],
    "types": ["node"],
    "rootDir": "./src",
    "outDir": "./dist",
    "sourceMap": true,
    "strict": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "skipLibCheck": true
  },
  "include": ["src"]
}
```
