# Changelog

All notable changes to the `@codebygarv/express-lens` package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.2.0] - 2026-07-31

### Added
- **Percentile Latencies (`p50`, `p90`, `p95`, `p99`)**: Sliding window calculation of exact tail response times globally and per route using linear interpolation.
- **Threshold Alert Callbacks (`onAlert`)**: Automated triggers for error rate percentages (`X%`), RSS memory limits (`Y MB`), or latency thresholds.
- **Slow Request Profiler (`slowThresholdMs`)**: Auto-detection, logging, and buffering of slow HTTP requests exceeding configured latency thresholds (default 500ms).
- **Prometheus Exporter (`prometheusHandler` / `getPrometheusMetrics`)**: Standard `/metrics` endpoint returning Prometheus Exposition format (`text/plain; version=0.0.4`) for Grafana & Prometheus scrapers.
- **Embedded Web Dashboard (`dashboardHandler`)**: Single-page dark mode UI with Server-Sent Events (SSE) live streaming, status code filters, and percentile visualizers.
- **cURL Command Generator & Header Redaction**: Auto-generation of copy-pasteable cURL commands with automatic masking of sensitive credentials (`authorization`, `cookie`, `set-cookie`, `x-api-key`, `secret`).
- **HAR 1.2 Export & Request Replay**: `exportHAR()` utility for standard HTTP Archive JSON exports and `replayRequest()` engine.
- **TypeScript Support**: Complete type definitions in `index.d.ts` for all options, metrics, alert triggers, and handlers.

### Changed
- Native ES Module `"type": "module"` configuration in `package.json`.
- Expanded package keywords, repository links, bug tracker, and engine requirements for improved npm search discoverability.
- Upgraded `README.md` with official badges, Morgan & Pino comparison table, and complete feature setup guides.

---

## [2.1.1] - 2026-07-26

### Fixed
- Bumped version to 2.1.1 and prevented duplicate publish workflow triggers.

---

## [2.1.0] - 2026-07-26

### Added
- In-memory metrics store reset via `resetMetrics()`.
- Programmatic JSON metrics endpoint handler `metricsHandler()`.
- Express route filtering via `ignoreRoutes`.
- Terminal colorized logs for HTTP status codes and latencies.
- Bounded route capacity map (`MAX_ROUTES`) to prevent memory leaks under dynamic routes.

---

## [2.0.1] - 2026-07-26

### Fixed
- Resolved dynamic `require` error for native ES Modules.

---

## [2.0.0] - 2026-06-28

### Added
- Dual publishing support for CommonJS (`.js`) and ES Modules (`.mjs`) via `tsup`.
- OS metrics caching (5s TTL) to reduce CPU overhead under high traffic.
- Batched logging via `logInterval` configuration option.
