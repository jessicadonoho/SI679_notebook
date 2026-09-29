---
title: "src/books-router.ts · Week 2 in-class: books router"
editLink: false
---

# `src/books-router.ts`

From **Week 2 in-class: books router** · original: `week2-router/src/books-router.ts` · [all files in this project](/code/week02-router/)

```ts:line-numbers
// books-router.ts

import express from 'express';
import type { Request, Response, NextFunction } from 'express';


import { BookStatus, type Book } from './types.js';
import { addBook, getAllBooks, removeBook } from './books-service.js';

const secretKey = 'SI679';
const checkAuth = (req: Request, res: Response, next: NextFunction): void => {
  const {authorization} = req.headers;
  // authorization should look like "Bearer SI679"
  // We just want the 2nd part, which we compare against the secretKey
  if (authorization && secretKey === authorization.split(' ')[1]) {
    next();
  } else {
    res.sendStatus(403); // forbidden!
  }
}

const validateBookParams = (req: Request, res: Response, next: NextFunction): void => {
    const {title, author} = req.body;
    if (title && author && title !== '' && author !== '') {
      next();
    } else {
      res
        .status(400)
        .send('Book data must include non-blank "title" and "author" fields.');
    }
  }


const logger = (req: Request, res: Response, next: NextFunction): void => {
    console.log(
      req.method,
      `/books${req.path}`,
      req.hostname
    );
    next();
}

export const booksRouter = express.Router();
booksRouter.use(logger);



booksRouter.use(express.json());

// note that we change the route from '/books' to '/'
booksRouter.post(
    '/',
    [checkAuth, validateBookParams],
    (req: Request, res: Response) => {
  const {title, author, year} = req.body;
  const status: BookStatus = BookStatus.STATUS_AVAILABLE; // default 
  const id = Date.now();
  const bookToAdd: Book = {
    id, title, author, year, status
  }
  addBook(bookToAdd);
  res.json(bookToAdd);
});


booksRouter.get('/', (req: Request, res: Response) => {
    const books = getAllBooks();
    res.json(books);
  });

booksRouter.delete('/', checkAuth, (req: Request, res: Response) => {
    removeBook(Number(req.body.id));
    res.sendStatus(200);
});

booksRouter.get('/badroute', (req:Request, res:Response)=>{
    throw Error("This is a bad route");
})

// filter request
// booksRouter.get('/', (req:Request, res:Response)=>{
//     console.log('HIT /books handler', req.query);
//     const {title, author, year} = req.query;
//     const books = getAllBooks();
//     let response=books;
//     if (title){
//         response=response.filter(book=>book.title===title)
//     }
//     if (author){
//         response=response.filter(book=>book.author===author)

//     }
//     if (year){
//         if (isNaN(Number(year))) { //NaN not a number
//             res.status(400).send("Error: itemid must be a number");
//             return;
//           }
//         response=response.filter(book=>book.year===Number(year))

//     }
//     res.json(response)
// })
```
