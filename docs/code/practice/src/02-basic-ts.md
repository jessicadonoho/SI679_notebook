---
title: "src/02-basic.ts · TS practice (practice/)"
editLink: false
---

# `src/02-basic.ts`

From **TS practice (practice/)** · original: `practice/src/02-basic.ts` · [all files in this project](/code/practice/)

```ts:line-numbers
let username: string ="jesiluv";
let age:number = 25;
let isAdmin: boolean = true;

//Arrays
let numbers:number[] = [1,2,3]
let names:string[]=["jesiluv", "piyush"]

let person:[string, number] = ["Piyush", 25];

//Enum
enum Color {
    Red, Green, Blue
}

let favoriteColor : Color = Color.Blue;

//ANY, avoid when possible

//Unknown (safer than any)

let subscribe = (message:string):void => {
    console.log(message);
}
//void for functions that don't return
//null and undefined also exist
```
