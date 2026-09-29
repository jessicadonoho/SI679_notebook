---
title: "package.json · TS basics exercise (ts-intro)"
editLink: false
---

# `package.json`

From **TS basics exercise (ts-intro)** · original: `si-679-f-26-ts-basics-jessicadonoho/package.json` · [all files in this project](/code/ts-basics/)

```json:line-numbers
{
  "name": "ts-intro",
  "version": "1.0.0",
  "description": "Starter project for practicing TypeScript fundamentals by converting a JavaScript book catalog program.",
  "type": "module",
  "private": true,
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit",
    "dev": "tsx src/index.ts",
    "js": "node src/index.js",
    "start": "node dist/index.js"
  },
  "devDependencies": {
    "@types/node": "^22.20.2",
    "tsx": "^4.19.0",
    "typescript": "^5.6.0"
  }
}
```
