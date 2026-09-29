---
title: "src/09-assertion-guards.ts · TS practice (practice/)"
editLink: false
---

# `src/09-assertion-guards.ts`

From **TS practice (practice/)** · original: `practice/src/09-assertion-guards.ts` · [all files in this project](/code/practice/)

```ts:line-numbers
//type assertions
let someValue:unknown ="subscribe to me";
let strLength:number = (someValue as string).length;

let strLength2:number = (<string>someValue)//. adds access to many methods

//Type guards
let processValue = (value:string|number)=>{
    if (typeof value ==="string"){
        console.log(value.toUpperCase());
    }else{
        console.log(value.)
    }
}
```
