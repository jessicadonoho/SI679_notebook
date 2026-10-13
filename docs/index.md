---
layout: home

hero:
  name: SI 679 Notebook
  text: Backend Development
  tagline: My study notes for the course, built from lecture notes, readings, and the code we write in class.
  actions:
    - theme: brand
      text: Start with Page 0
      link: /foundations
    - theme: alt
      text: Cheat Sheet
      link: /cheatsheet
    - theme: alt
      text: Browse the source code
      link: /code/

features:
  - icon: 🌲
    title: Grounded in the course
    details: Every page is built from the week's lecture notes, readings, and in-class code. Anything added from outside the course is marked "Extra context".
  - icon: 🪵
    title: Code you can read
    details: Each page walks through the important parts of the in-class code and links to the full, synced source files.
  - icon: 🍄
    title: Self-check
    details: Every page ends with gotchas and review questions, with answers hidden until you want them.
---

## About the course

SI 679 builds backend web services in **TypeScript** with **Node.js** and **Express**. It starts with a bare HTTP server, then adds routing and middleware, automated tests with Vitest and supertest, a **MongoDB** database, a layered REST API structure (routes → controllers → services → repositories), and unit tests with mocks and spies.

## Weeks

| Page | Topic | Main code |
|---|---|---|
| [Page 0: JS & TS Foundations](/foundations) | JavaScript refresher, TypeScript types, **`type` vs `interface`** | `practice/`, TS basics exercise |
| [Week 1: Servers & Express Intro](/weeks/week-01) | Client–server model, web servers, first Express app | Week 1 in-class `server.js` |
| [Week 2: Routing, Middleware & Testing](/weeks/week-02) | Express routing & middleware, unit testing | Books router, HW1 SliceDrop |
| [Week 3: MongoDB & Testing with a Database](/weeks/week-03) | MongoDB integration, testing with Vitest | Products + MongoDB driver |
| [Week 4: REST APIs & Layered Architecture](/weeks/week-04) | REST API design, project structure in layers | REST layers starter |
| [Week 5: Testing (E2E, Unit, Mocks & Spies)](/weeks/week-05) | Repositories & business logic, custom errors, e2e and unit tests with `vi.fn` / `vi.spyOn` | `/products` testing starter |

## Start MongoDB

`mongod` is the MongoDB server program. It has to be running before your code (or Compass or `mongosh`) can connect to the database at `mongodb://127.0.0.1:27017`. Start it in its own terminal and leave that terminal open:

```bash
mongod --dbpath ~/data/mdata
```

`--dbpath` tells `mongod` which folder holds the database files. Stop the server with `Ctrl+C`. To poke at the data from another terminal, run `mongosh`, then `use week3db`, then `db.products.find()`. More in [Week 3](/weeks/week-03).

Writing code? The **[Cheat Sheet](/cheatsheet)** collects every pattern on one page: routes, `req`/`res`, status codes, middleware, MongoDB CRUD, the layer template, and test setup.

::: tip How to use this notebook
Read the **Overview** and **Key concepts** first, then open the **Code walkthrough** next to the linked source file. Try the **Review questions** before opening the answers.
:::
