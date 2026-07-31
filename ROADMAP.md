# Express Lens — Ecosystem Expansion Roadmap

This document outlines the multi-phase engineering roadmap to evolve `@codebygarv/express-lens` into an all-in-one HTTP monitoring, APM metrics, and debugging suite across all major Node.js, Edge, and JavaScript framework runtimes.

---

## 🎯 Strategic Roadmap Overview

```
[Phase 1: Multi-Framework Adapters] ──► [Phase 2: Stream Capture & Truncation]
                 │                                        │
                 ▼                                        ▼
[Phase 3: JSR Publishing Registry]  ──► [Phase 4: VitePress Documentation Site]
```

---

## 📍 Phase Details

### Phase 1: Framework Adapters & Package Exports (`PHASE1_PLAN.md`)
- **Fastify Plugin** (`@codebygarv/express-lens/fastify`)
- **Hono & Edge Middleware** (`@codebygarv/express-lens/hono` — Bun, Deno, Cloudflare Workers)
- **Next.js App Router HOF** (`@codebygarv/express-lens/next` — `withExpressLens`, `dashboardRoute`)
- **Express Middleware** (`@codebygarv/express-lens/express`)

### Phase 2: Stream-Level Body Capture & Smart Truncation
- Wrap raw `req` / `res` data streams (`req.on('data')`, `res.write()`) to collect payloads even without body-parser.
- Smart body truncation options: `maxBodySize` (default: 1024B), `maxDepth` (default: 4), `maxArrayItems` (default: 10).

### Phase 3: JSR Registry Publishing
- Create `jsr.json` package manifest with MIT SPDX license, exports, and description.
- Publish to [JSR.io](https://jsr.io) alongside NPM for Deno & Bun developers.

### Phase 4: VitePress Live Documentation Site
- Build VitePress documentation platform in `docs/` with auto-generated TypeDoc API references.
- Host live documentation on GitHub Pages.
