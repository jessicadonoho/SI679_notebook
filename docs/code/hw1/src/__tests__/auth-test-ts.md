---
title: "src/__tests__/auth.test.ts · HW1: SliceDrop API"
editLink: false
---

# `src/__tests__/auth.test.ts`

From **HW1: SliceDrop API** · original: `si-679-f-26-hw1-jessicadonoho/src/__tests__/auth.test.ts` · [all files in this project](/code/hw1/)

```ts:line-numbers
import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../app";
import { CUSTOMER_TOKEN, STAFF_TOKEN } from "../constants";
import { _resetOrders } from "../data/orders";

beforeEach(() => { _resetOrders(); });

const ORDER = { customerName: "Ada", items: [{ menuItemId: "soda", quantity: 1 }] };

describe("POST /orders requires a customer token", () => {
  it("rejects a request with no Authorization header", async () => {
    const res = await request(app).post("/orders").send(ORDER);
    expect(res.status).toBe(401);
  });

  it("rejects an unrecognized token", async () => {
    const res = await request(app).post("/orders")
      .set("Authorization", "Bearer nope").send(ORDER);
    expect(res.status).toBe(401);
  });

  it("accepts the customer token", async () => {
    const res = await request(app).post("/orders")
      .set("Authorization", `Bearer ${CUSTOMER_TOKEN}`).send(ORDER);
    expect(res.status).toBe(201);
  });
});

describe("GET /orders requires a staff token", () => {
  it("rejects a request with no Authorization header", async () => {
    const res = await request(app).get("/orders");
    expect(res.status).toBe(401);
  });

  it("rejects an unrecognized token", async () => {
    const res = await request(app).get("/orders")
      .set("Authorization", "Bearer nope");
    expect(res.status).toBe(401);
  });

  it("rejects the customer token -- it is the wrong one for this route", async () => {
    const res = await request(app).get("/orders")
      .set("Authorization", `Bearer ${CUSTOMER_TOKEN}`);
    expect(res.status).toBe(401);
  });

  it("accepts the staff token", async () => {
    const res = await request(app).get("/orders")
      .set("Authorization", `Bearer ${STAFF_TOKEN}`);
    expect(res.status).toBe(200);
  });
});

describe("auth runs before validation", () => {
  it("answers 401, not 400, for a bad body with no token", async () => {
    const res = await request(app).post("/orders").send({});
    expect(res.status).toBe(401);
  });
});
```
