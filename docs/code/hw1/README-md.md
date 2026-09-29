---
title: "README.md · HW1: SliceDrop API"
editLink: false
---

# `README.md`

From **HW1: SliceDrop API** · original: `si-679-f-26-hw1-jessicadonoho/README.md` · [all files in this project](/code/hw1/)

````md:line-numbers
# HW1 — SliceDrop: Menu and Orders API

**The assignment instructions live in Confluence, not in this repo:**

### 👉 [HW1 — SliceDrop: Menu and Orders API](https://umich-mia.atlassian.net/wiki/spaces/~557058dba62ba90269416b914522a50b5edc96/pages/419790852)

That page is the spec. It is kept up to date; this repo is not. If something
is clarified or corrected during the week, it changes there and you will see
it immediately — there is nothing to pull.

## The short version

```bash
npm install
npm test        # everything fails; that is the starting point
```

Your job is to make the tests in `src/__tests__/` pass. Look for the `TODO`
comments in:

- `src/app.ts` — 404 handling and the error handler
- `src/middleware/auth.ts`
- `src/routers/menu.ts` and `src/routers/orders.ts`
- `src/validation/validate-order.ts`

Everything else is given. Push to `main` whenever you like — every push is
graded, and your last one before the deadline is the one that counts.

**Where this README and the Confluence page disagree, the page wins. Where
the page and a test disagree, the test wins.**
````
