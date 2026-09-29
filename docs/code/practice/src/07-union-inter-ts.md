---
title: "src/07-union-inter.ts · TS practice (practice/)"
editLink: false
---

# `src/07-union-inter.ts`

From **TS practice (practice/)** · original: `practice/src/07-union-inter.ts` · [all files in this project](/code/practice/)

```ts:line-numbers
//Union types (OR)
type Status ="pending" | "approved" | "rejected";
//status can take multiple values

let setStatus = (status:Status):void => {
    console.log(`Status set to ${status}`)
}

setStatus("approved")

//intersection types (AND)
interface Colorful {
    color:string;
}
interface Circle {
    radius:number;
}
type ColorfulCircle = Colorful & Circle

let myCircle:ColorfulCircle = {
    color:"red",
    radius:10,
}

//string literal types
let direction: "north" | "south" | "east" | "west";
direction ="north";

//numberic literal types
let diceRoll : 1|2|3|4|5|6;
```
