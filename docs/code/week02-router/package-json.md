---
title: "package.json · Week 2 in-class: books router"
editLink: false
---

# `package.json`

From **Week 2 in-class: books router** · original: `week2-router/package.json` · [all files in this project](/code/week02-router/)

```json:line-numbers
{
  "name": "week2-router",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "dev": "tsx watch src/index.ts",
    "typecheck": "tsc --noEmit",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "module",
  "dependencies": {
    "express": "^5.2.1"
  },
  "devDependencies": {
    "@types/express": "^5.0.6",
    "@types/node": "^26.6.2",
    "@types/supertest": "^7.2.1",
    "supertest": "^7.2.2",
    "tsx": "^4.23.13",
    "typescript": "^7.0.2",
    "vitest": "^5.0.1"
  }
}
```
