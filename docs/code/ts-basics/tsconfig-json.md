---
title: "tsconfig.json · TS basics exercise (ts-intro)"
editLink: false
---

# `tsconfig.json`

From **TS basics exercise (ts-intro)** · original: `si-679-f-26-ts-basics-jessicadonoho/tsconfig.json` · [all files in this project](/code/ts-basics/)

```json:line-numbers
{
  "compilerOptions": {
    "target": "ES2015",
    "lib": ["ES2015"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "types": ["node"]
  },
  "include": ["src"]
}
```
