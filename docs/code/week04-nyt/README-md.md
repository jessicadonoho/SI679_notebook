---
title: "README.md · Week 4 in-class: REST layers"
editLink: false
---

# `README.md`

From **Week 4 in-class: REST layers** · original: `si-679-f-26-week-04-nyt-jessicadonoho/README.md` · [all files in this project](/code/week04-nyt/)

````md:line-numbers
# Week 4 starter — REST layers

Everything is installed; nothing is written yet. To get going:

```bash
npm install
```

`sampleData/` holds the two JSON files the lecture imports into MongoDB with
Compass: `products.json` and `customers-with-ids.json`.

You will build these folders under `src/` as the lecture goes, from the
database upwards:

```
src/
├── db/            manage access to the database
├── models/        data structures that represent resources
├── services/      application logic
├── controllers/   handle requests and responses
├── routes/        map endpoints to controllers
├── middleware/    general processing for routes
├── app.ts         builds the app and exports it
└── index.ts       connects to the database, then opens the port
```

The scripts are the same as week 3: `npm run dev`, `npm test`,
`npm run typecheck`, `npm run build` then `npm start`. How the project was
put together is in week 3's `SETUP.md`.
````
