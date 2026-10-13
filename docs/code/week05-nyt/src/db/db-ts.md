---
title: "src/db/db.ts · Week 5 in-class: testing"
editLink: false
---

# `src/db/db.ts`

From **Week 5 in-class: testing** · original: `si-679-f-26-week05-nyt-jessicadonoho/src/db/db.ts` · [all files in this project](/code/week05-nyt/)

```ts:line-numbers
import { MongoClient } from 'mongodb';
import type { Db } from 'mongodb';

const MONGO_URI: string = 'mongodb://127.0.0.1:27017';
const DB_NAME: string = 'week5';

let client: MongoClient | null = null;
let database: Db;

export const connect = async (
  uri: string = MONGO_URI,
  dbName: string = DB_NAME
): Promise<void> => {
  client = new MongoClient(uri);
  await client.connect();
  database = client.db(dbName);
};

export const disconnect = async (): Promise<void> => {
  if (client) {
    await client.close();
    client = null;
  }
};

export const getDb = (): Db => database;
```
