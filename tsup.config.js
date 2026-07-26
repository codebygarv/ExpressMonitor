import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['index.js'],
  format: ['cjs', 'esm'],
  clean: true,
  footer({ format }) {
    if (format === 'cjs') {
      return {
        js: 'if (typeof module !== "undefined" && module.exports) { module.exports = monitor; module.exports.default = monitor; }',
      };
    }
  },
});
