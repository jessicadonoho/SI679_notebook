---
title: "tsconfig.json · Week 4 in-class: REST layers"
editLink: false
---

# `tsconfig.json`

From **Week 4 in-class: REST layers** · original: `si-679-f-26-week-04-nyt-jessicadonoho/tsconfig.json` · [all files in this project](/code/week04-nyt/)

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
