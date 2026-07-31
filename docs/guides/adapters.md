# Multi-Framework Adapters

Express Lens provides subpath exports for major Node.js and Edge web frameworks.

---

## Fastify

```typescript
import Fastify from 'fastify';
import { fastifyExpressLens } from '@codebygarv/express-lens/fastify';

const fastify = Fastify();
await fastify.register(fastifyExpressLens({ slowThresholdMs: 500 }));
```

---

## Hono & Edge (Cloudflare Workers, Bun, Deno)

```typescript
import { Hono } from 'hono';
import { honoExpressLens } from '@codebygarv/express-lens/hono';

const app = new Hono();
app.use('*', honoExpressLens({ slowThresholdMs: 500 }));
```

---

## Next.js (App Router)

```typescript
// app/api/users/route.ts
import { withExpressLens } from '@codebygarv/express-lens/next';

async function handler(req: Request) {
  return Response.json({ users: [] });
}

export const GET = withExpressLens(handler);
```
