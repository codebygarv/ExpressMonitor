import { defineConfig } from 'vitepress';

export default defineConfig({
  base: '/ExpressMonitor/',
  title: 'Express Lens',
  description: 'Zero-dependency HTTP monitoring, APM metrics, percentile latencies, Prometheus format exporter, slow request profiler, and real-time web dashboard for Node.js & Edge.',
  themeConfig: {
    logo: '/logo.png',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/guides/getting-started' },
      { text: 'Dashboard', link: '/guides/dashboard' },
      { text: 'Prometheus', link: '/guides/prometheus' },
      { text: 'Adapters', link: '/guides/adapters' },
      { text: 'API Reference', link: '/api/index' },
    ],
    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Overview', link: '/' },
          { text: 'Getting Started', link: '/guides/getting-started' },
        ],
      },
      {
        text: 'Core Features',
        items: [
          { text: 'Embedded Web Dashboard', link: '/guides/dashboard' },
          { text: 'Prometheus Exporter', link: '/guides/prometheus' },
          { text: 'Multi-Framework Adapters', link: '/guides/adapters' },
        ],
      },
      {
        text: 'API Reference',
        items: [
          { text: 'API Modules', link: '/api/index' },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/codebygarv/ExpressMonitor' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/@codebygarv/express-lens' },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Garv Thakral',
    },
  },
});
