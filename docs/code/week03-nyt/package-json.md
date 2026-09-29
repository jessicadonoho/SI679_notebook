---
title: "package.json · Week 3 in-class: MongoDB + Vitest"
editLink: false
---

# `package.json`

From **Week 3 in-class: MongoDB + Vitest** · original: `si-679-f-26-week03-nyt-jessicadonoho/package.json` · [all files in this project](/code/week03-nyt/)

```json:line-numbers
{
  "name": "week03-starter",
  "version": "1.0.0",
  "description": "SI 679 week 3 — MongoDB and Vitest",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "explore": "tsx watch src/db-explore.ts",
    "build": "tsc",
    "typecheck": "tsc --noEmit",
    "start": "node dist/index.js",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "express": "^5.2.1",
    "mongodb": "^7.6.0"
  },
  "devDependencies": {
    "@types/express": "^5.0.6",
    "@types/node": "^22.20.4",
    "@types/supertest": "^7.2.1",
    "mongodb-memory-server": "^11.3.0",
    "supertest": "^7.3.0",
    "tsx": "^4.23.15",
    "typescript": "^7.0.2",
    "vitest": "^5.0.1"
  },
  "allowScripts": {
    "esbuild": false,
    "fsevents": false,
    "mongodb-memory-server": false
  },
  "config": {
    "mongodbMemoryServer": {
      "disablePostinstall": "1"
    }
  }
}
```
