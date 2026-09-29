---
title: "package.json · HW1: SliceDrop API"
editLink: false
---

# `package.json`

From **HW1: SliceDrop API** · original: `si-679-f-26-hw1-jessicadonoho/package.json` · [all files in this project](/code/hw1/)

```json:line-numbers
{
  "name": "slicedrop-solutions",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "vitest run",
    "dev": "tsx src/index.ts",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "build": "tsc -p tsconfig.build.json"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/SI679-internal/SliceDrop-Solutions.git"
  },
  "keywords": [],
  "author": "Jose Rubio",
  "license": "ISC",
  "bugs": {
    "url": "https://github.com/SI679-internal/SliceDrop-Solutions/issues"
  },
  "homepage": "https://github.com/SI679-internal/SliceDrop-Solutions#readme",
  "devDependencies": {
    "@types/express": "^5.0.6",
    "@types/node": "^26.4.1",
    "@types/supertest": "^6.0.3",
    "supertest": "^7.2.2",
    "tsx": "^4.23.13",
    "typescript": "^7.0.2",
    "vitest": "^4.1.11"
  },
  "dependencies": {
    "express": "^5.2.1"
  }
}
```
