# Getting Started with Express Lens

`@codebygarv/express-lens` provides complete APM HTTP monitoring, slow request profiling, percentile latencies, and an embedded web dashboard with zero external dependencies.

---

## Installation

### NPM / Yarn / pnpm
```bash
npm install @codebygarv/express-lens
yarn add @codebygarv/express-lens
pnpm add @codebygarv/express-lens
```

### Deno / JSR
```bash
deno add jsr:@codebygarv/express-lens
```

---

## Quickstart (Express.js)

```typescript
import express from 'express';
import monitor, { metricsHandler, prometheusHandler, dashboardHandler } from '@codebygarv/express-lens';

const app = express();

// Attach monitoring middleware
app.use(monitor({
  slowThresholdMs: 500,
  maxBodySize: 1024,
}));

// Mount endpoints
app.use('/express-lens', dashboardHandler());
app.get('/metrics', prometheusHandler());
app.get('/metrics-json', metricsHandler());

app.listen(3000, () => {
  console.log('🚀 Server running at http://localhost:3000');
  console.log('📈 Dashboard at http://localhost:3000/express-lens');
});
```
