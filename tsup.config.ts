import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'index.ts',
    'adapters/express': 'src/adapters/express.ts',
    'adapters/fastify': 'src/adapters/fastify.ts',
    'adapters/hono': 'src/adapters/hono.ts',
    next: 'src/next.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  target: 'node16',
});
