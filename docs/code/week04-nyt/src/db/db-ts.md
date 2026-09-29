---
title: "src/db/db.ts · Week 4 in-class: REST layers"
editLink: false
---

# `src/db/db.ts`

From **Week 4 in-class: REST layers** · original: `si-679-f-26-week-04-nyt-jessicadonoho/src/db/db.ts` · [all files in this project](/code/week04-nyt/)

```ts:line-numbers
import { MongoClient, ObjectId } from 'mongodb';
import type { Db, Document, InsertOneResult } from 'mongodb';

// Where the database server lives, and which database on it we want.
const MONGO_URI: string = 'mongodb://127.0.0.1:27017';
const DB_NAME: string = 'week4';

// Collection names. The rest of the app asks for db.PRODUCTS rather than
// typing the string 'products' in five different places.
const PRODUCTS: string = 'products';

let mongoClient: MongoClient | null = null;
let theDb: Db;

const init = async (
    uri: string = MONGO_URI,
    dbName: string = DB_NAME
): Promise<void> => {
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    theDb = mongoClient.db(dbName);
};

const getAllInCollection = async (
    collectionName: string
): Promise<Document[]> => {
    if (!mongoClient) {
      await init();
    }
    const allDocs = theDb.collection(collectionName).find();
    return await allDocs.toArray();
};

// export const db = {
//     init,
//     getAllInCollection,
//     PRODUCTS
// };

const addToCollection = async (
  collectionName: string,
  docData: Document
): Promise<InsertOneResult> => {
  if (!mongoClient) {
    await init();
  }
  return await theDb.collection(collectionName).insertOne(docData);
};

const getThroughID = async(
    id:string,
    collectionName: string
): Promise<Document | null> => {
    if (!mongoClient){
        await init();
    }
    // FIXED: `new ObjectId(id)` throws if id is not a valid 24-char hex
    // string (e.g. /products/abc), which became a 500 error. Now an invalid
    // id just means "not found", so the controller can send a 404.
    if (!ObjectId.isValid(id)) {
        return null;
    }
    return await theDb.collection(collectionName).findOne({ _id: new ObjectId(id) });

}
// Neither of these is for the app. The app connects once at startup and
// then runs until you stop it, so it never needs to hang up or to empty
// a collection. Tests need both.

const disconnect = async (): Promise<void> => {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
  }
};

// The leading underscore is a convention, not a language feature. It is a
// note to the next reader: this exists for tests, not for the app.
const _clearCollection = async (collectionName: string): Promise<void> => {
  await theDb.collection(collectionName).deleteMany({});
};

export const db = {
  init,
  getAllInCollection,
  addToCollection,
  getThroughID,
  disconnect, 
  _clearCollection,
  PRODUCTS
};
```
