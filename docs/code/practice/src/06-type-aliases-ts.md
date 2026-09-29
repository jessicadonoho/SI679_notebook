---
title: "src/06-type-aliases.ts · TS practice (practice/)"
editLink: false
---

# `src/06-type-aliases.ts`

From **TS practice (practice/)** · original: `practice/src/06-type-aliases.ts` · [all files in this project](/code/practice/)

```ts:line-numbers
type Point ={
    x:number;
    y:number;
};

let point: Point = {x:10, y:20};

//type vs interface
//interfaces can be extended, types cannot

interface Animal {
    name: string;
}


interface Dog extends Animal {
    breed: string;
}
let myDog: Dog = {
    name: "Buddy",
    breed: "Golden Doodle",
}
```
