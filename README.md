# @codebygarv/express-lens

[![npm version](https://badge.fury.io/js/@codebygarv%2Fexpress-lens.svg)](https://badge.fury.io/js/@codebygarv%2Fexpress-lens)
[![npm downloads](https://img.shields.io/npm/dt/@codebygarv/express-lens.svg)](https://www.npmjs.com/package/@codebygarv/express-lens)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight, plug-and-play monitoring package for Express.js applications. It silently tracks your application's metrics and logs a concise analytics summary inline to the console for every HTTP request.

## Features

- **Zero setup**: Just plug it into your Express app as a middleware.
- **Dual Support**: Natively supports both CommonJS (`require`) and ES Modules (`import`).
- **Inline Analytics Logs**: View realtime metrics for every request without any dashboards getting in the way.
- **Performance Tracking**: Measures response times, average request durations, and memory (RSS) usage.
- **Error Tracking**: Keeps a tally of request errors (HTTP 400+).
- **Route Specific Metrics**: Keeps track of min, max, and total duration per route.

## Installation

You can install `@codebygarv/express-lens` using npm or yarn:

```bash
npm install @codebygarv/express-lens
```

or with Yarn:

```bash
yarn add @codebygarv/express-lens
```

## Usage

This package supports both CommonJS and ES Modules.

### CommonJS (CJS)

```javascript
const express = require('express');
const monitor = require('@codebygarv/express-lens');
```

### ES Modules (ESM)

```javascript
import express from 'express';
import monitor from '@codebygarv/express-lens';
```

### Example Setup

```javascript
const app = express();

// Add the monitor middleware
app.use(monitor());

// Your routes
app.post('/users', (req, res) => {
  res.status(201).json({ message: 'User created' });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

### Example Console Output

When a request hits your server, you will see a log similar to this in your console:

```
[Analytics] GET /users -> 201 (15.42ms) | Total Reqs: 120 | Errors: 0 | Avg: 22.10ms | Mem: 45.21MB
```

## Configuration

The `monitor` middleware takes an optional configuration object.

```javascript
app.use(monitor({
  logAnalytics: true, // Default is true. Set to false to disable console logging entirely.
  logInterval: 0      // Default is 0 (logs every request). Set to > 0 (in milliseconds) for batched logging.
}));
```

### High Performance Mode (Batched Logging)

If your API receives high traffic (e.g., 100+ requests per second), logging every single request will cause significant I/O overhead. You can enable batched logging by passing a `logInterval` (in milliseconds).

```javascript
app.use(monitor({
  logInterval: 5000 // Logs a summary of the last 5 seconds instead of every individual request
}));
```

*Example Output with `logInterval: 5000`:*
```
[Analytics Summary] Interval Reqs: 1250 | Total Reqs: 15000 | Errors: 5 | Avg: 22.10ms | Mem: 45.21MB
```

## Exported Metrics

Internally, `express-lens` tracks the following data:

| Metric | Description |
|--------|-------------|
| Total Requests | Count of all incoming HTTP requests |
| Total Errors | Count of responses with status >= 400 |
| Avg Duration | Average response time across all endpoints |
| Memory (RSS) | Current Resident Set Size of the Node process |
| Route Metrics | Counts, and min/max durations separated by route |

## License

MIT

Developed by [github/codebygarv](https://github.com/codebygarv)
