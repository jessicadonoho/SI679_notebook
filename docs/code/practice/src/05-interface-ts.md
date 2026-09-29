---
title: "src/05-interface.ts · TS practice (practice/)"
editLink: false
---

# `src/05-interface.ts`

From **TS practice (practice/)** · original: `practice/src/05-interface.ts` · [all files in this project](/code/practice/)

```ts:line-numbers
interface User {
    name:string;
    age:number;
    email?: string;
}

interface Product {
    name: string;
    price:number;
    getDiscount(percent:number):number;
}
let laptop:Product = {
    name:"macPro",
    price:2000;
    getDiscount(percent:number):number {
        return this.price*(percent/100)
    }
}
```
