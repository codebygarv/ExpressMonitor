# Phase 3 Execution Plan: JSR Registry Publishing

This document details the technical plan for **Phase 3**, configuring `@codebygarv/express-lens` for publication on the [JSR (JavaScript Registry)](https://jsr.io) alongside NPM.

---

## 🎯 Phase Goals

1. **JSR Compliance**: Ensure code and exports conform to JSR publishing requirements (MIT SPDX license identifier, zero slow-types errors, explicit return types).
2. **JSR Manifest (`jsr.json`)**: Configure `jsr.json` with package scope `@codebygarv/express-lens`, description, version, and export mappings.
3. **Automated Publishing Workflow**: Add GitHub Actions workflow `.github/workflows/jsr-publish.yml` to publish releases automatically on git tag push.

---

## 📋 Step-by-Step Implementation

### Step 1: JSR Manifest (`jsr.json`)
Create `jsr.json`:
```json
{
  "name": "@codebygarv/express-lens",
  "version": "2.3.0",
  "description": "Zero-dependency HTTP monitoring, APM metrics, percentile latencies, Prometheus format exporter, slow request profiler, and real-time web dashboard for Express, Fastify, Hono, and Next.js.",
  "license": "MIT",
  "exports": {
    ".": "./index.ts",
    "./express": "./src/adapters/express.ts",
    "./fastify": "./src/adapters/fastify.ts",
    "./hono": "./src/adapters/hono.ts",
    "./next": "./src/next.ts"
  }
}
```
- *Commit*: `chore: add jsr.json manifest for JSR registry publishing`

### Step 2: Explicit Types for JSR Compatibility
- Ensure all public exports have explicit return types (resolves JSR slow types warnings).
- *Commit*: `fix: add explicit TypeScript return types for JSR type validation`

### Step 3: JSR Release CI Workflow (`.github/workflows/jsr-publish.yml`)
- Add GitHub Actions workflow using `npx jsr publish`.
- *Commit*: `ci: add JSR release workflow`

---

## 🧪 Verification Plan

- `npx jsr publish --dry-run`
- `npm run typecheck` (`tsc --noEmit`)
