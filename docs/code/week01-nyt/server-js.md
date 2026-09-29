---
title: "server.js · Week 1 in-class: Express intro"
editLink: false
---

# `server.js`

From **Week 1 in-class: Express intro** · original: `si-679-f-26-week1-nyt-jessicadonoho/server.js` · [all files in this project](/code/week01-nyt/)

```js:line-numbers
import express from 'express';

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/about', (req, res) => {
  res.send('Welcome to the About page!');
});

app.get('/catalog', (req, res)=>{
  const {itemid} = req.query;
  if (isNaN(Number(itemid))) { //NaN not a number
    res.status(400).send("Error: itemid must be a number");
    return;
  }

  res.send(`Oh, you're looking for item ${itemid}?`);

});

app.get('/play/artist/:artistName/song/:songName', (req,res)=>{
  const {artistName, songName} = req.params;
  res.send(`Oh, you want to listen to ${songName} by ${artistName}?`);
})

app.get('/getform', (req, res)=>{
  res.send(
    `<html>
      <body>
        <form action=’/submitform’ method="post">
          <label htmlFor="address">Address:</label><br />
          <input type="text" id="address" name="address" placeholder="123 Main St" /><br />

          <label htmlFor="city">City:</label><br />
          <input type="text" id="city" name="city" placeholder="Smallville" /><br /><br />

          <label htmlFor="zip">Zipcode:</label><br/>
          <input type="text" id="city" name="city" placeholder="01234"/><br/><br/>
          <input type="submit" value="Submit" />
        </form>
      </body>
    </html>`);
})

app.post('/tracks', (req, res)=>{
  const {artist, title, album, year} = req.body;
  let response = {status:"success", trackAdded:{artist:`${artist}`, title:`${title}`, album:`${album}`, year:`${year}`}, timestamp: new Date().toISOString()}
  res.send(JSON.stringify(response))
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
```
