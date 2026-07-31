# Embedded Real-Time Web Dashboard

Express Lens includes a zero-dependency, dark mode web dashboard accessible at `/express-lens` with live SSE (Server-Sent Events) streaming.

---

## Features

- **Live Stream Feed**: Push new requests instantly without page refreshes.
- **Percentile Gauges**: Displays **p50, p90, p95, and p99** response latencies.
- **Slow Request Profiler**: View requests exceeding `slowThresholdMs`.
- **Search & Filter**: Filter traffic by HTTP method, path regex, or status code.
- **cURL Copy & HAR Export**: Copy ready-to-paste cURL strings for any request or download full HAR 1.2 JSON files.

---

## Mounting in Express

```typescript
import { dashboardHandler } from '@codebygarv/express-lens';

app.use('/express-lens', dashboardHandler());
```
