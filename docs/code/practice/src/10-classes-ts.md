---
title: "src/10-classes.ts · TS practice (practice/)"
editLink: false
---

# `src/10-classes.ts`

From **TS practice (practice/)** · original: `practice/src/10-classes.ts` · [all files in this project](/code/practice/)

```ts:line-numbers
class Person {
    //properties
    private name:string;
    protected age: number;
    public email: string;

    //constructor
    constructor(name:string, age: number, email:string){
        this.name=name;
        this.age=age;
        this.email=email;
    }
    //methods
    public introduce(): string{
        return `Hi I'm ${this.name} and I'm ${this.age}`
    }

    //getter
    public getName():string{
        return this.name;
    }
    //setter
    public setName(name:string):void{
        this.name = name;
    }
}

//shorter Way

class Employee{
    constructor(
        private id:number,
        public name:string,
        protected department: string,
    ){}
    getDetails():string{
        return `${this.name} works in ${this.department}`
    }
}

let piyush = new Employee(101, "Jesi", "Emgineering")
console.log(piyush.getDetails())
```
