# AGENTS.md — Development & Architecture Guide

This document defines repository rules, architecture conventions, and testing guidelines for AI coding assistants working on `@codebygarv/express-lens`.

---

## Project Overview

`@codebygarv/express-lens` is a zero-dependency HTTP monitoring, APM metrics, and debugging library for Express.js applications.

Key Design Principles:
1. **Zero External Runtime Dependencies**: High performance, small footprint.
2. **In-Memory Bounded Data Structures**: Ring buffers for latencies, errors, slow requests, and routes map size capping to guarantee zero memory leaks in production.
3. **Dual Module Support**: Seamless dual ESM (`.mjs`) & CJS (`.cjs` / `.js`) compilation via `tsup`.
4. **Developer Experience**: Real-time SSE web dashboard, cURL generator, Prometheus metrics exporter, and automatic header sanitization.

---

## Directory Architecture

```
/
├── index.js           # Public API entry point
├── index.d.ts         # TypeScript definitions
├── package.json       # Package configuration & metadata
├── README.md          # Primary user documentation
├── CHANGELOG.md       # Version history
├── src/
│   ├── middleware.js  # Main Express tracking middleware
│   ├── store.js       # Metrics store, percentiles, ring buffers, HAR & replay
│   ├── prometheus.js  # Prometheus Exposition format exporter
│   ├── dashboard.js   # Single-page HTML dashboard UI & SSE handler
│   ├── system.js      # OS system metrics with TTL caching
│   └── utils.js       # Percentile math, header redactor, cURL generator
└── test/              # Node.js test runner suite (node --test)
```

---

## Coding Guidelines & Conventions

- **Language**: Modern ES2022+ JavaScript with strict TypeScript definitions in `index.d.ts`.
- **Testing**: Use Node.js built-in test runner `node --test test/*.test.js`.
- **Header Redaction**: Always run `redactHeaders()` when storing or logging request data containing headers (`authorization`, `cookie`, `set-cookie`, `api-key`, etc.).
- **Build**: Run `npm run build` (`tsup`) before releases to ensure CJS and ESM distributions compile cleanly.

---

## Verification Commands

- **Run Unit Tests**: `npm test`
- **Build Bundle**: `npm run build`
