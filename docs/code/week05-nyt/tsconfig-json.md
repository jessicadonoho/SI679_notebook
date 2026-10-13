---
title: "tsconfig.json · Week 5 in-class: testing"
editLink: false
---

# `tsconfig.json`

From **Week 5 in-class: testing** · original: `si-679-f-26-week05-nyt-jessicadonoho/tsconfig.json` · [all files in this project](/code/week05-nyt/)

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
