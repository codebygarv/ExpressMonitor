# @codebygarv/express-lens

[![npm version](https://badge.fury.io/js/@codebygarv%2Fexpress-lens.svg)](https://badge.fury.io/js/@codebygarv%2Fexpress-lens)
[![npm downloads](https://img.shields.io/npm/dt/@codebygarv/express-lens.svg)](https://www.npmjs.com/package/@codebygarv/express-lens)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight, plug-and-play monitoring and logging package for Express.js applications. It silently tracks your application's real-time performance metrics, logs colorized analytics inline to the console, and exposes programmatic JSON metrics endpoints out-of-the-box.

## Features

- **Zero setup**: Just plug it into your Express app as a middleware.
- **Dual Support**: Natively supports both CommonJS (`require`) and ES Modules (`import`).
- **Colorized Analytics Logs**: Realtime HTTP logs with ANSI color-coded status codes and latency.
- **Performance & Error Tracking**: Response times, memory (RSS/Heap), status tallies, and recent error log buffer.
- **Memory Leak Protection**: Auto-bounded route capacity map (`MAX_ROUTES`).
- **Programmatic API**: Export metrics via `getMetrics()` or expose a ready-to-use `/metrics` HTTP endpoint.
- **Route Filtering**: Ignore health check or noise endpoints using `ignoreRoutes`.

## Why `@codebygarv/express-lens`? (Comparison with Morgan)

`morgan` is a basic request logger that outputs static text lines. `@codebygarv/express-lens` acts as an **all-in-one lightweight APM & logger** that keeps continuous in-memory metrics without needing external dashboards or databases.

| Feature | `morgan` | `@codebygarv/express-lens` |
| :--- | :---: | :---: |
| **Request Logging** | Raw text line | Colorized metric-rich log line |
| **Aggregated Metrics (Total Reqs, Avg Latency)** | ❌ No | ✅ Yes |
| **Error Tally & Buffer (HTTP 4xx / 5xx)** | ❌ No | ✅ Yes |
| **Process Memory (RSS/Heap) Tracking** | ❌ No | ✅ Yes |
| **Per-Route Performance (Min / Max / Avg)** | ❌ No | ✅ Yes |
| **Programmatic API & JSON Endpoint** | ❌ No | ✅ `getMetrics()` & `metricsHandler()` |
| **High-Traffic Batched Logging (`logInterval`)** | ❌ No | ✅ Yes |
| **Dual CommonJS & Native ES Module Support** | ⚠️ Partial | ✅ Native CJS & ESM (`.js` & `.mjs`) |

## Installation

```bash
npm install @codebygarv/express-lens
```

or with Yarn:

```bash
yarn add @codebygarv/express-lens
```

## Usage

### CommonJS (CJS)

```javascript
const express = require('express');
const monitor = require('@codebygarv/express-lens');
const { getMetrics, metricsHandler } = require('@codebygarv/express-lens');
```

### ES Modules (ESM)

```javascript
import express from 'express';
import monitor, { getMetrics, metricsHandler } from '@codebygarv/express-lens';
```

### Quick Setup Example

```javascript
const express = require('express');
const monitor = require('@codebygarv/express-lens');

const app = express();

// Add the monitor middleware
app.use(monitor({
  ignoreRoutes: ['/health', '/favicon.ico']
}));

// Expose a JSON metrics endpoint for dashboards / health checks
app.get('/express-lens/metrics', metricsHandler());

// Your routes
app.get('/users', (req, res) => {
  res.json([{ id: 1, name: 'Alice' }]);
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

## Programmatic APIs

### `getMetrics()`
Returns a complete JSON snapshot of all tracked metrics:

```javascript
const { getMetrics } = require('@codebygarv/express-lens');

console.log(getMetrics());
```

*Sample Output:*
```json
{
  "totalRequests": 142,
  "totalErrors": 2,
  "errorRate": "1.41%",
  "avgDurationMs": 18.35,
  "statusCodes": { "200": 140, "404": 2 },
  "methods": { "GET": 120, "POST": 22 },
  "routes": {
    "GET /users": { "count": 120, "avgDuration": 15.2, "minDuration": 4.1, "maxDuration": 42.8 }
  },
  "recentErrors": [
    {
      "timestamp": "2026-07-26T11:00:00.000Z",
      "method": "GET",
      "url": "/unknown",
      "status": 404,
      "durationMs": 2.1
    }
  ],
  "system": {
    "uptime": 124.5,
    "memory": { "heapTotal": 35430400, "heapUsed": 21500000, "rss": 48200000 }
  }
}
```

### `metricsHandler()`
Serves the `getMetrics()` JSON payload over HTTP directly as an Express handler.

### `resetMetrics()`
Resets all internal metric counters to 0.

## Configuration Options

```javascript
app.use(monitor({
  logAnalytics: true,               // Default: true. Set to false to disable console output.
  logInterval: 0,                   // Default: 0 (logs every request). Set > 0 (in ms) for batched logging.
  colorize: true,                   // Default: true. Colorizes status codes and latencies in terminal.
  ignoreRoutes: ['/health', '/metrics'] // Routes to ignore from logging & tracking.
}));
```

## License

MIT

Developed by [github/codebygarv](https://github.com/codebygarv)
