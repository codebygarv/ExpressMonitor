# @codebygarv/express-lens

[![npm version](https://badge.fury.io/js/@codebygarv%2Fexpress-lens.svg)](https://badge.fury.io/js/@codebygarv%2Fexpress-lens)
[![npm downloads](https://img.shields.io/npm/dm/@codebygarv/express-lens.svg)](https://www.npmjs.com/package/@codebygarv/express-lens)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js CI](https://github.com/codebygarv/ExpressMonitor/actions/workflows/ci.yml/badge.svg)](https://github.com/codebygarv/ExpressMonitor/actions)

> Zero-dependency HTTP monitoring, APM metrics, percentile latencies (p50/p90/p95/p99), threshold alert callbacks, Prometheus format exporter, slow request profiler, and real-time embedded web dashboard for Express.js applications.

---

## ⚡ Highlights

- **Native TypeScript**: Written entirely in strict TypeScript with complete auto-generated type declarations (`.d.ts`).
- **Zero External Dependencies**: Lightweight and fast, zero extra npm package footprint.
- **Embedded Real-Time Dashboard**: Built-in dark mode dashboard UI with Server-Sent Events (SSE) live streaming.
- **True Percentile Latencies**: Sliding window calculation of **p50, p90, p95, and p99** response times globally and per-route.
- **Threshold Alert Callbacks**: Trigger custom `onAlert` callbacks when error rates cross `X%`, RSS memory exceeds `Y MB`, or average latency spikes.
- **Slow Request Profiler**: Automatically capture and profile requests exceeding `slowThresholdMs` (e.g., 500ms).
- **Prometheus Exporter**: Serves standard Prometheus Exposition format (`text/plain; version=0.0.4`) at `/metrics` ready for Grafana & Prometheus scrapers.
- **cURL Generator & Header Redaction**: Auto-generate cURL commands for captured requests with automatic masking of sensitive credentials (`authorization`, `cookie`, `api-key`).
- **HAR Export & Request Replay**: Download HTTP Archive (HAR 1.2) JSON exports and replay captured HTTP requests.

---

## 📊 Comparison with Morgan & Pino

| Feature | `morgan` | `pino-http` | `@codebygarv/express-lens` |
| :--- | :---: | :---: | :---: |
| **Request Logging** | Text line | JSON log | Colorized ANSI + In-Memory APM |
| **Percentile Latencies (p50/p90/p95/p99)** | ❌ No | ❌ No | ✅ **Built-in** |
| **Threshold Alert Callbacks (`onAlert`)** | ❌ No | ❌ No | ✅ **Built-in** |
| **Slow Request Profiler (`slowThresholdMs`)** | ❌ No | ❌ No | ✅ **Built-in** |
| **Prometheus Exposition Exporter (`/metrics`)** | ❌ No | ❌ No | ✅ **Built-in** |
| **Embedded Web Dashboard (SSE Live Stream)** | ❌ No | ❌ No | ✅ **Built-in** |
| **cURL Command Generation** | ❌ No | ❌ No | ✅ **Built-in** |
| **HAR 1.2 Export & Request Replay** | ❌ No | ❌ No | ✅ **Built-in** |
| **Sensitive Header Redaction** | ❌ No | ⚠️ Custom | ✅ **Automatic** |
| **Memory Overhead** | Low | Low | Bounded Ring Buffer |

---

## 📦 Installation

```bash
npm install @codebygarv/express-lens
```

or with Yarn / pnpm:

```bash
yarn add @codebygarv/express-lens
pnpm add @codebygarv/express-lens
```

---

## 🚀 Quick Start

```javascript
import express from 'express';
import monitor, {
  metricsHandler,
  prometheusHandler,
  dashboardHandler,
} from '@codebygarv/express-lens';

const app = express();

// 1. Attach Express Lens Middleware
app.use(
  monitor({
    slowThresholdMs: 500, // Profile requests slower than 500ms
    alerts: {
      errorRateThreshold: 5, // Alert if error rate >= 5%
      memoryThresholdMb: 500, // Alert if RSS memory >= 500MB
      onAlert: (alert) => {
        console.warn('🚨 EXPRESS LENS ALERT:', alert.message);
      },
    },
  })
);

// 2. Mount Prometheus /metrics endpoint (for Grafana/Prometheus)
app.get('/metrics', prometheusHandler());

// 3. Mount Real-Time Web Dashboard
app.use('/express-lens', dashboardHandler());

// 4. Mount JSON metrics API endpoint
app.get('/express-lens/json', metricsHandler());

// Sample Routes
app.get('/api/users', (req, res) => {
  res.json([{ id: 1, name: 'Alice' }]);
});

app.get('/api/slow', async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 600)); // Triggers Slow Profiler
  res.json({ status: 'done' });
});

app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
  console.log('📈 Dashboard live at http://localhost:3000/express-lens');
  console.log('📊 Prometheus metrics at http://localhost:3000/metrics');
});
```

---

## 🖥️ Live Web Dashboard

Access the embedded live dashboard by mounting `app.use('/express-lens', dashboardHandler())`.

Features included in the dashboard:
- **Live Stream Feed**: Server-Sent Events (SSE) push new requests instantly.
- **Percentile Gauges**: Real-time display of **p50, p90, p95, and p99** latencies.
- **Slow Requests Profiler Tab**: Dedicated view of slow HTTP operations exceeding `slowThresholdMs`.
- **Search & Filter Toolbar**: Search traffic by method (`GET`, `POST`), URL regex, or HTTP status (`2xx`, `4xx`, `5xx`).
- **cURL Copy & HAR Export**: Copy exact cURL strings for any request or download full HAR 1.2 JSON files.

---

## 📈 Prometheus Exporter (`/metrics`)

Express Lens exports standard Prometheus Exposition text (v0.0.4):

```text
# HELP http_requests_total Total number of HTTP requests processed
# TYPE http_requests_total counter
http_requests_total 142

# HELP http_request_duration_seconds Summary of HTTP request durations in seconds
# TYPE http_request_duration_seconds summary
http_request_duration_seconds{quantile="0.5"} 0.012500
http_request_duration_seconds{quantile="0.9"} 0.045000
http_request_duration_seconds{quantile="0.95"} 0.088000
http_request_duration_seconds{quantile="0.99"} 0.120000

# HELP express_lens_memory_rss_bytes Process RSS memory in bytes
# TYPE express_lens_memory_rss_bytes gauge
express_lens_memory_rss_bytes 48200000
```

Add to your `prometheus.yml` scraper configuration:

```yaml
scrape_configs:
  - job_name: 'express-app'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['localhost:3000']
```

---

## ⚙️ Configuration Reference

```javascript
app.use(
  monitor({
    logAnalytics: true, // Default: true. Console log request metrics
    logInterval: 0, // Default: 0 (log each request). > 0 sets batched summary logging (ms)
    colorize: true, // Colorize status codes and latency in terminal
    ignoreRoutes: ['/health', '/metrics'], // Skip tracking for matched paths or regex
    slowThresholdMs: 500, // Profile requests exceeding duration threshold (ms)
    redactHeaders: ['x-custom-token'], // Additional header names to mask as [REDACTED]
    alerts: {
      errorRateThreshold: 5, // Alert when error rate >= 5%
      memoryThresholdMb: 500, // Alert when RSS memory >= 500MB
      avgDurationThresholdMs: 1000, // Alert when average latency >= 1000ms
      onAlert: (alert) => {
        // Callback function triggered on breach
        console.log(alert.type, alert.message, alert.timestamp);
      },
    },
  })
);
```

---

## 📖 API Reference

### `getMetrics()`
Returns a complete JSON snapshot of all tracked metrics:
```javascript
import { getMetrics } from '@codebygarv/express-lens';
console.log(getMetrics());
```

### `getPercentiles(samples?)`
Returns exact percentiles (`p50`, `p90`, `p95`, `p99`) for an array of latency numbers.

### `exportHAR(title?)`
Returns standard HTTP Archive (HAR 1.2) compliant JSON object of recent traffic.

### `replayRequest(requestId, fetchFn?)`
Replays a recorded request by its unique request ID.

### `generateCurl(req)`
Generates copy-pasteable cURL string for a request object with redacted sensitive headers.

---

## 📄 License

[MIT License](LICENSE) — Created with ❤️ by [Garv Thakral](https://github.com/codebygarv).
