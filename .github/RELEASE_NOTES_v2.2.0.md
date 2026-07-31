# Express Lens v2.2.0 Release Notes

🚀 **Express Lens v2.2.0** is here! This release brings major observability features, percentile latencies, custom threshold alerts, a Prometheus exporter, a slow request profiler, and an embedded real-time web dashboard.

---

## What's New in v2.2.0

### 📊 Percentile Latencies (`p50`, `p90`, `p95`, `p99`)
- Real-time sliding window calculation of tail latencies globally and per-route.
- Helps identify performance bottlenecks and slow response spikes under load.

### 🚨 Threshold Alert Callbacks (`onAlert`)
- Configure automated alerts for error rates (`errorRateThreshold`), RSS memory limits (`memoryThresholdMb`), or latency thresholds (`avgDurationThresholdMs`).
- Triggers custom `onAlert` callbacks to send webhooks, Slack messages, or logs.

### 🐢 Slow Request Profiler (`slowThresholdMs`)
- Auto-detects and buffers slow HTTP requests taking longer than configured thresholds (default: 500ms).
- Stores full context: URL, method, status code, duration, IP, and sanitized headers.

### 📈 Prometheus Exporter (`prometheusHandler` / `/metrics`)
- Standard Prometheus Exposition text format endpoint ready for Grafana and Prometheus scrapers.

### 🖥️ Embedded Real-Time Web Dashboard (`dashboardHandler`)
- Responsive dark-mode dashboard with Server-Sent Events (SSE) live streaming.
- Built-in search toolbar, method & status filters, cURL copy button, and HAR 1.2 download button.

### 📋 cURL Generator & Sensitive Header Redaction
- Auto-generates ready-to-use cURL commands for captured requests.
- Automatically redacts `authorization`, `cookie`, `set-cookie`, `x-api-key`, and custom sensitive headers.

### 📥 HAR 1.2 Export & Request Replay
- Export request logs to standard HTTP Archive (HAR 1.2) JSON files.
- Programmatic `replayRequest()` engine to re-execute captured requests.

---

## 📦 Installation & Upgrade

```bash
npm install @codebygarv/express-lens@latest
```

## Quick Start Example

```js
import express from 'express';
import monitor, { prometheusHandler, dashboardHandler } from '@codebygarv/express-lens';

const app = express();

app.use(monitor({
  slowThresholdMs: 500,
  alerts: {
    errorRateThreshold: 5,
    onAlert: (alert) => console.warn('Alert:', alert.message)
  }
}));

app.get('/metrics', prometheusHandler());
app.use('/express-lens', dashboardHandler());

app.listen(3000);
```
