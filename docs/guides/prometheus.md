# Prometheus Exporter & Grafana Setup

Express Lens exposes standard Prometheus Exposition format metrics (`text/plain; version=0.0.4`) ready for Prometheus & Grafana.

---

## Endpoint Setup

```typescript
import { prometheusHandler } from '@codebygarv/express-lens';

app.get('/metrics', prometheusHandler());
```

---

## Prometheus Scraper Config (`prometheus.yml`)

```yaml
scrape_configs:
  - job_name: 'express-lens-app'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['localhost:3000']
```
