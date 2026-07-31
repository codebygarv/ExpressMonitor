# Phase 1 Execution Plan: Multi-Framework Adapters

This document details the step-by-step technical plan for Phase 1, introducing native framework adapters for **Fastify**, **Hono**, and **Next.js (App Router)**.

---

## 🛠️ Architecture & Package Exports

Package exports in `package.json`:

```json
"exports": {
  ".": {
    "types": "./index.d.ts",
    "import": "./dist/index.js",
    "require": "./dist/index.cjs"
  },
  "./express": {
    "types": "./dist/adapters/express.d.ts",
    "import": "./dist/adapters/express.js",
    "require": "./dist/adapters/express.cjs"
  },
  "./fastify": {
    "types": "./dist/adapters/fastify.d.ts",
    "import": "./dist/adapters/fastify.js",
    "require": "./dist/adapters/fastify.cjs"
  },
  "./hono": {
    "types": "./dist/adapters/hono.d.ts",
    "import": "./dist/adapters/hono.js",
    "require": "./dist/adapters/hono.cjs"
  },
  "./next": {
    "types": "./dist/next.d.ts",
    "import": "./dist/next.js",
    "require": "./dist/next.cjs"
  }
}
```

---

## 📋 Step-by-Step Implementation

### Step 1: Fastify Adapter (`src/adapters/fastify.ts`)
- Fastify plugin wrapping `onRequest` and `onResponse` hooks.
- Calculates latency with high-res timers, records status codes, method metrics, and populates `store`.
- Exposes embedded web dashboard via Fastify route plugin.
- *Commit*: `feat: add Fastify framework adapter and @codebygarv/express-lens/fastify subpath export`

### Step 2: Hono & Edge Adapter (`src/adapters/hono.ts`)
- Hono middleware relying strictly on WinterCG standard Web APIs (`performance.now()`, `ReadableStream`).
- Fully compatible with Cloudflare Workers, Deno, Bun, and Vercel Edge.
- *Commit*: `feat: add Hono & Edge framework adapter and @codebygarv/express-lens/hono subpath export`

### Step 3: Next.js App Router Adapter (`src/next.ts`)
- Higher-Order Function `withExpressLens(handler)` for App Router route handlers.
- Catch-all route handler `dashboardRoute({ ... })` for mounting the live web dashboard in Next.js applications (`app/api/express-lens/[[...route]]/route.ts`).
- *Commit*: `feat: add Next.js App Router adapter HOF and dashboardRoute`

### Step 4: Express Subpath Export (`src/adapters/express.ts`)
- Dedicated subpath export for Express (`@codebygarv/express-lens/express`).
- *Commit*: `feat: add dedicated @codebygarv/express-lens/express package export`

### Step 5: Test Suite & Tsup Multi-Build Entry Points
- Add tests in `test/adapters/fastify.test.js`, `test/adapters/hono.test.js`, `test/adapters/next.test.js`.
- Update `tsup.config.ts` to build entry points for `index.ts`, `src/adapters/express.ts`, `src/adapters/fastify.ts`, `src/adapters/hono.ts`, `src/next.ts`.
- *Commit*: `chore: update build entries and add multi-framework adapter test suite`

---

## 🧪 Verification Plan

- `npm run typecheck` (`tsc --noEmit`)
- `npm test` (`node --import tsx --test test/**/*.test.js`)
- `npm run build` (`tsup`)
