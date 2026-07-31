import store from './store.ts';

/**
 * Returns the embedded single-page HTML dashboard UI template.
 * @returns HTML document
 */
export function getDashboardHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Express Lens — Live Dashboard & HTTP Debugger</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: #111827;
      --border: #1f2937;
      --text: #f9fafb;
      --text-muted: #9ca3af;
      --accent: #6366f1;
      --accent-hover: #4f46e5;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --cyan: #06b6d4;
      --code-bg: #1e293b;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', system-ui, sans-serif; }
    body { background-color: var(--bg); color: var(--text); padding: 1.5rem; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem; }
    .brand { display: flex; align-items: center; gap: 0.75rem; }
    .brand h1 { font-size: 1.5rem; font-weight: 700; background: linear-gradient(135deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .badge { background: #312e81; color: #a5b4fc; padding: 0.25rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
    .controls { display: flex; gap: 0.75rem; }
    button { background: var(--card-bg); border: 1px solid var(--border); color: var(--text); padding: 0.5rem 1rem; border-radius: 0.375rem; font-weight: 500; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 0.5rem; }
    button:hover { background: var(--border); border-color: #374151; }
    button.btn-primary { background: var(--accent); border-color: var(--accent); }
    button.btn-primary:hover { background: var(--accent-hover); }
    
    .grid-metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 0.5rem; padding: 1.25rem; }
    .card-title { font-size: 0.85rem; color: var(--text-muted); font-weight: 500; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .card-value { font-size: 1.75rem; font-weight: 700; color: var(--text); }
    .percentiles-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-top: 0.5rem; }
    .percentile-item { background: #1a2234; padding: 0.35rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; text-align: center; }
    .percentile-label { color: var(--text-muted); font-size: 0.65rem; }

    .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; gap: 1rem; flex-wrap: wrap; }
    .search-box { flex: 1; min-width: 250px; background: var(--card-bg); border: 1px solid var(--border); border-radius: 0.375rem; padding: 0.5rem 0.75rem; color: var(--text); font-size: 0.875rem; }
    .search-box:focus { outline: 1px solid var(--accent); }
    
    table { width: 100%; border-collapse: collapse; background: var(--card-bg); border-radius: 0.5rem; overflow: hidden; border: 1px solid var(--border); }
    th, td { text-align: left; padding: 0.75rem 1rem; border-bottom: 1px solid var(--border); font-size: 0.875rem; }
    th { background: #182235; color: var(--text-muted); font-weight: 600; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; }
    tr:hover { background: #162032; }
    
    .status-pill { padding: 0.2rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 600; display: inline-block; font-family: 'Fira Code', monospace; }
    .status-2xx { background: #064e3b; color: #34d399; }
    .status-3xx { background: #164e63; color: #67e8f9; }
    .status-4xx { background: #78350f; color: #fbbf24; }
    .status-5xx { background: #7f1d1d; color: #fca5a5; }
    
    .method-pill { font-weight: 700; font-family: 'Fira Code', monospace; font-size: 0.8rem; }
    .method-GET { color: #60a5fa; }
    .method-POST { color: #34d399; }
    .method-PUT { color: #fbbf24; }
    .method-DELETE { color: #f87171; }
    .method-PATCH { color: #c084fc; }

    .code-block { font-family: 'Fira Code', monospace; font-size: 0.8rem; background: var(--code-bg); padding: 0.5rem; border-radius: 0.25rem; border: 1px solid var(--border); overflow-x: auto; color: #e2e8f0; white-space: pre-wrap; }
    .tab-nav { display: flex; gap: 0.5rem; margin-bottom: 1rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
    .tab-btn { background: none; border: none; color: var(--text-muted); padding: 0.5rem 1rem; cursor: pointer; font-size: 0.9rem; font-weight: 600; }
    .tab-btn.active { color: var(--accent); border-bottom: 2px solid var(--accent); border-radius: 0; }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <h1>Express Lens</h1>
      <span class="badge">v2.2.0 Dashboard</span>
    </div>
    <div class="controls">
      <button id="pauseBtn" onclick="togglePause()">⏸ Pause Feed</button>
      <button onclick="downloadHAR()">📥 Export HAR 1.2</button>
      <button class="btn-primary" onclick="refreshMetrics()">🔄 Refresh</button>
    </div>
  </header>

  <div class="grid-metrics">
    <div class="card">
      <div class="card-title">Total Requests</div>
      <div class="card-value" id="valTotalRequests">0</div>
    </div>
    <div class="card">
      <div class="card-title">Error Rate</div>
      <div class="card-value" style="color: var(--danger);" id="valErrorRate">0.00%</div>
    </div>
    <div class="card">
      <div class="card-title">Avg Latency</div>
      <div class="card-value" style="color: var(--cyan);" id="valAvgDuration">0.00ms</div>
    </div>
    <div class="card">
      <div class="card-title">Percentile Latencies (ms)</div>
      <div class="percentiles-grid">
        <div class="percentile-item"><div class="percentile-label">P50</div><strong id="valP50">0</strong></div>
        <div class="percentile-item"><div class="percentile-label">P90</div><strong id="valP90">0</strong></div>
        <div class="percentile-item"><div class="percentile-label">P95</div><strong id="valP95">0</strong></div>
        <div class="percentile-item"><div class="percentile-label">P99</div><strong id="valP99">0</strong></div>
      </div>
    </div>
  </div>

  <div class="tab-nav">
    <button class="tab-btn active" onclick="switchTab('live')">Live Requests</button>
    <button class="tab-btn" onclick="switchTab('slow')">Slow Requests Profiler</button>
    <button class="tab-btn" onclick="switchTab('routes')">Route Performance</button>
  </div>

  <div id="liveTab">
    <div class="toolbar">
      <input type="text" class="search-box" id="searchInput" placeholder="Filter requests by URL, Method, or Status..." onkeyup="filterTable()">
    </div>
    <table>
      <thead>
        <tr>
          <th>Time</th>
          <th>Method</th>
          <th>URL</th>
          <th>Status</th>
          <th>Duration</th>
          <th>IP</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="requestsBody">
        <tr><td colspan="7" style="text-align: center; color: var(--text-muted);">Waiting for HTTP traffic...</td></tr>
      </tbody>
    </table>
  </div>

  <div id="slowTab" style="display: none;">
    <table>
      <thead>
        <tr>
          <th>Time</th>
          <th>Method</th>
          <th>URL</th>
          <th>Status</th>
          <th>Duration</th>
          <th>Threshold</th>
        </tr>
      </thead>
      <tbody id="slowBody">
        <tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No slow requests detected yet.</td></tr>
      </tbody>
    </table>
  </div>

  <div id="routesTab" style="display: none;">
    <table>
      <thead>
        <tr>
          <th>Route Key</th>
          <th>Hits</th>
          <th>Avg Latency</th>
          <th>Min Latency</th>
          <th>Max Latency</th>
          <th>P95 Latency</th>
        </tr>
      </thead>
      <tbody id="routesBody">
        <tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No route metrics captured.</td></tr>
      </tbody>
    </table>
  </div>

  <script>
    let isPaused = false;
    let sseSource = null;

    function switchTab(tab) {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      document.getElementById('liveTab').style.display = tab === 'live' ? 'block' : 'none';
      document.getElementById('slowTab').style.display = tab === 'slow' ? 'block' : 'none';
      document.getElementById('routesTab').style.display = tab === 'routes' ? 'block' : 'none';
      event.target.classList.add('active');
    }

    function togglePause() {
      isPaused = !isPaused;
      document.getElementById('pauseBtn').innerText = isPaused ? '▶ Resume Feed' : '⏸ Pause Feed';
    }

    function refreshMetrics() {
      fetch('/express-lens/metrics-json')
        .then(res => res.json())
        .then(data => updateDashboard(data))
        .catch(err => console.error('Failed to load metrics:', err));
    }

    function updateDashboard(metrics) {
      document.getElementById('valTotalRequests').innerText = metrics.totalRequests || 0;
      document.getElementById('valErrorRate').innerText = metrics.errorRate || '0.00%';
      document.getElementById('valAvgDuration').innerText = (metrics.avgDurationMs || 0) + 'ms';
      if (metrics.percentiles) {
        document.getElementById('valP50').innerText = metrics.percentiles.p50 || 0;
        document.getElementById('valP90').innerText = metrics.percentiles.p90 || 0;
        document.getElementById('valP95').innerText = metrics.percentiles.p95 || 0;
        document.getElementById('valP99').innerText = metrics.percentiles.p99 || 0;
      }

      if (metrics.routes) {
        const routesBody = document.getElementById('routesBody');
        routesBody.innerHTML = '';
        for (const [key, stats] of Object.entries(metrics.routes)) {
          const tr = document.createElement('tr');
          tr.innerHTML = \`
            <td class="code-block">\${key}</td>
            <td>\${stats.count}</td>
            <td>\${stats.avgDuration}ms</td>
            <td>\${stats.minDuration}ms</td>
            <td>\${stats.maxDuration}ms</td>
            <td>\${stats.percentiles ? stats.percentiles.p95 : 0}ms</td>
          \`;
          routesBody.appendChild(tr);
        }
      }

      if (metrics.slowRequests && metrics.slowRequests.length > 0) {
        const slowBody = document.getElementById('slowBody');
        slowBody.innerHTML = '';
        metrics.slowRequests.forEach(req => {
          const tr = document.createElement('tr');
          tr.innerHTML = \`
            <td>\${new Date(req.timestamp).toLocaleTimeString()}</td>
            <td class="method-pill method-\${req.method}">\${req.method}</td>
            <td>\${req.url}</td>
            <td><span class="status-pill status-\${Math.floor(req.status / 100)}xx">\${req.status}</span></td>
            <td style="color: var(--danger); font-weight: 700;">\${req.durationMs}ms</td>
            <td>\${req.slowThresholdMs}ms</td>
          \`;
          slowBody.appendChild(tr);
        });
      }
    }

    function copyCurl(curlStr) {
      navigator.clipboard.writeText(curlStr).then(() => alert('cURL command copied to clipboard!'));
    }

    function downloadHAR() {
      window.location.href = '/express-lens/har';
    }

    function connectSSE() {
      sseSource = new EventSource('/express-lens/events');
      sseSource.onmessage = function(event) {
        if (isPaused) return;
        const req = JSON.parse(event.data);
        addRequestRow(req);
        refreshMetrics();
      };
    }

    function addRequestRow(req) {
      const tbody = document.getElementById('requestsBody');
      if (tbody.children.length === 1 && tbody.children[0].children.length === 1) {
        tbody.innerHTML = '';
      }
      const tr = document.createElement('tr');
      const statusClass = 'status-' + Math.floor(req.status / 100) + 'xx';
      const curlEscaped = (req.curl || '').replace(/'/g, "\\'");
      tr.innerHTML = \`
        <td>\${new Date(req.timestamp).toLocaleTimeString()}</td>
        <td class="method-pill method-\${req.method}">\${req.method}</td>
        <td>\${req.url}</td>
        <td><span class="status-pill \${statusClass}">\${req.status}</span></td>
        <td>\${req.durationMs}ms</td>
        <td>\${req.ip || '127.0.0.1'}</td>
        <td><button onclick="copyCurl('\${curlEscaped}')">📋 cURL</button></td>
      \`;
      tbody.insertBefore(tr, tbody.firstChild);
      if (tbody.children.length > 100) tbody.removeChild(tbody.lastChild);
    }

    function filterTable() {
      const query = document.getElementById('searchInput').value.toLowerCase();
      const rows = document.getElementById('requestsBody').getElementsByTagName('tr');
      for (let row of rows) {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
      }
    }

    refreshMetrics();
    connectSSE();
  </script>
</body>
</html>`;
}

/**
 * Express middleware route handler to serve the interactive web dashboard & SSE events stream.
 * @returns Express request handler (req, res, next)
 */
export function dashboardHandler() {
  return function (req: any, res: any, next: any): void {
    const url = req.url || req.originalUrl || '';

    // 1. SSE Events endpoint
    if (url.includes('/events')) {
      if (typeof res.setHeader === 'function') {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
      }
      res.write(`data: ${JSON.stringify({ type: 'CONNECTED' })}\n\n`);
      store.sseClients.add(res);

      req.on('close', () => {
        store.sseClients.delete(res);
      });
      return;
    }

    // 2. Metrics JSON endpoint for dashboard refresh
    if (url.includes('/metrics-json')) {
      if (typeof res.setHeader === 'function') {
        res.setHeader('Content-Type', 'application/json');
      }
      const data = JSON.stringify(store.getMetrics());
      if (typeof res.send === 'function') return res.send(data);
      if (typeof res.json === 'function') return res.json(store.getMetrics());
      return res.end(data);
    }

    // 3. HAR Export Download endpoint
    if (url.includes('/har')) {
      if (typeof res.setHeader === 'function') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="express-lens-export.har"');
      }
      const harData = JSON.stringify(store.exportHAR(), null, 2);
      if (typeof res.send === 'function') return res.send(harData);
      return res.end(harData);
    }

    // 4. Main HTML Dashboard Page
    if (typeof res.setHeader === 'function') {
      res.setHeader('Content-Type', 'text/html');
    }
    const html = getDashboardHTML();
    if (typeof res.send === 'function') {
      res.send(html);
    } else if (typeof res.end === 'function') {
      res.end(html);
    }
  };
}
