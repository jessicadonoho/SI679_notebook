---
title: "src/db-explore.ts · Week 3 in-class: MongoDB + Vitest"
editLink: false
---

# `src/db-explore.ts`

From **Week 3 in-class: MongoDB + Vitest** · original: `si-679-f-26-week03-nyt-jessicadonoho/src/db-explore.ts` · [all files in this project](/code/week03-nyt/)

```ts:line-numbers
import { MongoClient, ObjectId } from 'mongodb';
import type { Db, Document } from 'mongodb';


const mongoURI: string = 'mongodb://127.0.0.1:27017';
const dbName: string = 'week3db';

let client: MongoClient;
let db: Db;

const connect = async () => {
  client = new MongoClient(mongoURI);
  await client.connect();
  db = client.db(dbName);
};

const disconnect = async () => {
  await client.close();
};

interface Product {
    name: string;
    price: number;
    quantity: number;
  }

const testAdd = async () => {
const product: Product = {
    name: 'Duct Tape',
    price: 5.99,
    quantity: 120
};
const productColl = db.collection('products'); //name from compass
return await productColl.insertOne(product);
};

const testAddMany = async () => {
    const products: Product[] = [
      {
        name: 'Scotch Tape',
        price: 3.99,
        quantity: 100
      },
      {
        name: 'Masking Tape',
        price: 2.01,
        quantity: 77
      }
    ];
    const productColl = db.collection('products');
    return await productColl.insertMany(products);
  };

const getAllTest = async () => {
    const results: Document[] = [];
    const cursor = db.collection('products').find(); //use cursor to hold results
    while (await cursor.hasNext()) {
        const doc = await cursor.next(); //results list
        if (doc) {
        results.push(doc);
        }
}
    return results;
};

const findOneTest = async () => {
    const oneResult = await db.collection('products').findOne({
        //built in query subsystem
      name: 'Duct Tape'
    });
    return oneResult;
  };

const findOneTestId = async () => {
  const oneResult = await db.collection('products').findOne({
    // name: 'Duct Tape',
    _id: new ObjectId('6ab2c6b6ceb60803e14cf059'),
  });
  return oneResult;
};

const findManyTestDetailed = async () => {
    const results: Document[] = [];
    const query = { price: { $lt: 5.0 } }; //find queries on w3
    const cursor = db.collection('products').find(query);
    //object that gives access to results, where in the database it is
    while (await cursor.hasNext()) {//results are ordered, last item doesn't have has next
      const doc = await cursor.next(); //
      if (doc) {
        results.push(doc);
      }
    }
    return results;
  };

const updateOneTest = async () => {
    const query = { name: 'Duct Tape' };
    const update = { $set: { quantity: 150 } }; //will use often
    const result = await db.collection('products').updateOne(query, update);
    return result;
    //update updates all, update one just updates one of the items
    //best to do with the id
};

const deleteOneTest = async () => {
    const query = { _id: new ObjectId('6ab2c6b6ceb60803e14cf059') };
    const result = await db.collection('products').deleteOne(query);
    return result;
  };

const findPricierTest = async()=>{
    const results: Document[]=[];
    const query={price:{$gte:5.0}}
    const cursor = db.collection('products').find(query);
    while (await cursor.hasNext()) {
        const doc = await cursor.next(); 
        if (doc) {
          results.push(doc);
        }
      }
      return results;
}

const updatePriceTest = async()=>{
    const query = { name: 'Scotch Tape' };
    const update = { $set: { price: 4.29 } }; //will use often
    const result = await db.collection('products').updateMany(query, update);
    return result;
}

const deleteByNameTest = async()=>{
    const query = {name: "Masking Tape"};
    const result = await db.collection('products').deleteOne(query);
    return result;
}

const markOnSaleTest = async()=>{
    const query={price:{$lt:5.0}}
    const update = { $set: { onSale: true } }; //will use often
    const result = await db.collection('products').updateMany(query, update);
    return result;
}

const main = async () => {
    await connect();

    // test connection
    // await db.command({ ping: 1 });
    // console.log('client is connected');

    // const result = await testAdd();

    // const result = await testAddMany();

    // const result = await getAllTest();

    // const result = await findOneTest();

    // const result = await findOneTestId();

    // const result = await findManyTestDetailed();

    // const result = await updateOneTest();

    // const result = await deleteOneTest();

    // const result = await findPricierTest();

    // const result = await updatePriceTest();

    // const result = await deleteByNameTest();

    const result = await markOnSaleTest();





    console.log(result);

    await disconnect();
  };



  main();
```
