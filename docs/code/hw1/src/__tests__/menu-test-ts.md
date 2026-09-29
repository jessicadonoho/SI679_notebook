---
title: "src/__tests__/menu.test.ts · HW1: SliceDrop API"
editLink: false
---

# `src/__tests__/menu.test.ts`

From **HW1: SliceDrop API** · original: `si-679-f-26-hw1-jessicadonoho/src/__tests__/menu.test.ts` · [all files in this project](/code/hw1/)

```ts:line-numbers
import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../app";

describe("GET /menu", () => {
  it("returns the whole menu", async () => {
    const res = await request(app).get("/menu");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(6);
  });

  it("filters by category", async () => {
    const res = await request(app).get("/menu?category=pizza");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body.every((i: any) => i.category === "pizza")).toBe(true);
  });

  it("returns an empty array for an unknown category", async () => {
    const res = await request(app).get("/menu?category=seafood");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("GET /menu/:id", () => {
  it("returns the item with its customization options", async () => {
    const res = await request(app).get("/menu/hawaiian");
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Hawaiian");
    expect(res.body.sizes).toHaveLength(3);
    expect(res.body.toppings.length).toBeGreaterThan(0);
  });

  it("404s an unknown id", async () => {
    const res = await request(app).get("/menu/sushi");
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});
```
