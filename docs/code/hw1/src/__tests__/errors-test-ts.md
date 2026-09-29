---
title: "src/__tests__/errors.test.ts · HW1: SliceDrop API"
editLink: false
---

# `src/__tests__/errors.test.ts`

From **HW1: SliceDrop API** · original: `si-679-f-26-hw1-jessicadonoho/src/__tests__/errors.test.ts` · [all files in this project](/code/hw1/)

```ts:line-numbers
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { app } from "../app";
import { CUSTOMER_TOKEN } from "../constants";
import { _resetOrders } from "../data/orders";

beforeEach(() => { _resetOrders(); });

const asCustomer = () => request(app).post("/orders").set("Authorization", `Bearer ${CUSTOMER_TOKEN}`);

describe("404", () => {
  it("answers a path no router handles", async () => {
    const res = await request(app).get("/nope");
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});

describe("400 on an invalid order", () => {
  it("reports every problem it found, not just the first", async () => {
    const res = await asCustomer().send({});
    expect(res.status).toBe(400);
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThanOrEqual(2);
  });

  it("rejects an unknown menu item", async () => {
    const res = await asCustomer().send({
      customerName: "Ada", items: [{ menuItemId: "sushi", quantity: 1 }]
    });
    expect(res.status).toBe(400);
  });

  it("rejects a quantity below 1", async () => {
    const res = await asCustomer().send({
      customerName: "Ada", items: [{ menuItemId: "soda", quantity: 0 }]
    });
    expect(res.status).toBe(400);
  });

  it("rejects a crust the item does not offer", async () => {
    const res = await asCustomer().send({
      customerName: "Ada", items: [{ menuItemId: "hawaiian", quantity: 1, crust: "stuffed" }]
    });
    expect(res.status).toBe(400);
  });

  it("rejects a size the item does not offer", async () => {
    const res = await asCustomer().send({
      customerName: "Ada", items: [{ menuItemId: "soda", quantity: 1, size: "bathtub" }]
    });
    expect(res.status).toBe(400);
  });
});

describe("500 when our own code throws", () => {
  // Forcing a real server-side crash: make the given addOrder blow up, then
  // send a request that is otherwise perfectly valid. A 400 here would mean
  // the error handler is blaming the client for our bug.
  it("does not report a server crash as a client error", async () => {
    vi.resetModules();
    vi.doMock("../data/orders", async () => {
      const real = await vi.importActual<typeof import("../data/orders")>("../data/orders");
      return { ...real, addOrder: () => { throw new Error("boom"); } };
    });

    // A dynamic import() is ESM, and under NodeNext those need the file
    // extension -- unlike the static imports at the top of this file.
    const { app: freshApp } = await import("../app.js");
    const res = await request(freshApp).post("/orders")
      .set("Authorization", `Bearer ${CUSTOMER_TOKEN}`)
      .send({ customerName: "Ada", items: [{ menuItemId: "soda", quantity: 1 }] });

    vi.doUnmock("../data/orders");
    vi.resetModules();

    expect(res.status).toBe(500);
  });
});

describe("400 on malformed JSON", () => {
  it("answers the client, not a crash", async () => {
    const res = await asCustomer()
      .set("Content-Type", "application/json").send("{nope");
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});
```
