---
title: "src/__tests__/orders.test.ts · HW1: SliceDrop API"
editLink: false
---

# `src/__tests__/orders.test.ts`

From **HW1: SliceDrop API** · original: `si-679-f-26-hw1-jessicadonoho/src/__tests__/orders.test.ts` · [all files in this project](/code/hw1/)

```ts:line-numbers
import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../app";
import { CUSTOMER_TOKEN, STAFF_TOKEN } from "../constants";
import { _resetOrders } from "../data/orders";

beforeEach(() => { _resetOrders(); });

const asCustomer = () => request(app).post("/orders").set("Authorization", `Bearer ${CUSTOMER_TOKEN}`);
const asStaff = () => request(app).get("/orders").set("Authorization", `Bearer ${STAFF_TOKEN}`);

const ORDER = {
  customerName: "Ada",
  items: [{ menuItemId: "hawaiian", quantity: 2, size: "large" }]
};

describe("POST /orders", () => {
  it("stores the order and answers 201 with it", async () => {
    const res = await asCustomer().send(ORDER);
    expect(res.status).toBe(201);
    expect(res.body.customerName).toBe("Ada");
    expect(res.body.status).toBe("pending");
    expect(res.body.items).toHaveLength(1);
    // createdAt is a timestamp: assert its shape, never its value.
    expect(typeof res.body.createdAt).toBe("string");
    expect(Number.isNaN(Date.parse(res.body.createdAt))).toBe(false);
    expect(res.body.id).toBeDefined();
  });

  it("gives each order a distinct id", async () => {
    const first = await asCustomer().send(ORDER);
    const second = await asCustomer().send(ORDER);
    expect(first.body.id).not.toBe(second.body.id);
  });
});

describe("GET /orders", () => {
  it("is empty before anything is ordered", async () => {
    const res = await asStaff();
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("filters by status", async () => {
    await asCustomer().send(ORDER);
    await asCustomer().send({
      customerName: "Grace", items: [{ menuItemId: "soda", quantity: 1 }]
    });

    // Every new order starts out "pending", so that filter returns both...
    const pending = await request(app).get("/orders?status=pending")
      .set("Authorization", `Bearer ${STAFF_TOKEN}`);
    expect(pending.status).toBe(200);
    expect(pending.body).toHaveLength(2);

    // ...and any other status returns an empty list rather than an error.
    const completed = await request(app).get("/orders?status=completed")
      .set("Authorization", `Bearer ${STAFF_TOKEN}`);
    expect(completed.status).toBe(200);
    expect(completed.body).toEqual([]);
  });

  it("returns the orders that were placed", async () => {
    await asCustomer().send(ORDER);
    await asCustomer().send({ customerName: "Grace", items: [{ menuItemId: "soda", quantity: 1 }] });
    const res = await asStaff();
    expect(res.body).toHaveLength(2);
    expect(res.body.map((o: any) => o.customerName)).toEqual(["Ada", "Grace"]);
  });
});
```
