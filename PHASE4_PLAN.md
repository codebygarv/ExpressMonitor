# Phase 4 Execution Plan: VitePress Documentation Site

This document details the technical plan for **Phase 4**, building a modern, hosted VitePress documentation platform for `@codebygarv/express-lens` with auto-generated TypeDoc API references.

---

## 🎯 Phase Goals

1. **VitePress Setup**: Initialize VitePress static site generator in `docs/` with dark mode, search, sidebar navigation, and feature highlights.
2. **TypeDoc API Generation**: Configure TypeDoc and `typedoc-vitepress-theme` to automatically generate searchable API references from TypeScript docstrings (`index.ts` and `src/**/*.ts`).
3. **GitHub Pages Deployment**: Add automated GitHub Actions workflow `.github/workflows/docs.yml` to build and deploy the documentation site to GitHub Pages on every release.

---

## 📋 Step-by-Step Implementation

### Step 1: VitePress Platform Setup (`docs/`)
- Create `docs/.vitepress/config.ts` with navigation sidebar, badges, social links, and theme overrides.
- Add guide pages:
  - `docs/index.md` (Landing page)
  - `docs/guides/getting-started.md` (Quickstart guide)
  - `docs/guides/dashboard.md` (Web dashboard guide)
  - `docs/guides/prometheus.md` (Prometheus & Grafana setup)
  - `docs/guides/adapters.md` (Fastify, Hono, Next.js integration)
- *Commit*: `docs: add VitePress documentation platform with usage guides`

### Step 2: TypeDoc API Reference Pipeline
- Add `typedoc` and `typedoc-vitepress-theme` dev dependencies.
- Configure `typedoc.json` to generate API markdown inside `docs/api/`.
- Add script `"docs:build": "typedoc && vitepress build docs"` to `package.json`.
- *Commit*: `docs: integrate TypeDoc for automated API reference generation`

### Step 3: GitHub Pages Deployment Workflow (`.github/workflows/docs.yml`)
- Add GitHub Actions workflow to publish `docs/.vitepress/dist` to GitHub Pages.
- *Commit*: `ci: add GitHub Pages deployment workflow for VitePress docs site`

---

## 🧪 Verification Plan

- `npm run docs:dev` (Preview docs site locally at `http://localhost:5173`)
- `npm run docs:build` (Verify static site build)
