/**
 * Express Lens Utility Functions
 */

/**
 * Default headers that should be redacted for security.
 */
const SENSITIVE_HEADERS = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  'x-auth-token',
  'secret',
  'password',
  'proxy-authorization',
]);

/**
 * Calculates a specific percentile from an array of numbers.
 * Uses linear interpolation for exact results.
 * @param {number[]} values - Array of numerical values (latencies)
 * @param {number} percentile - Percentile to calculate (0 to 100)
 * @returns {number} The calculated percentile value
 */
export function calculatePercentile(values, percentile) {
  if (!values || values.length === 0) return 0;
  if (values.length === 1) return Number(values[0].toFixed(2));

  const sorted = [...values].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);

  if (lowerIndex === upperIndex) {
    return Number(sorted[lowerIndex].toFixed(2));
  }

  const weight = index - lowerIndex;
  const interpolated = sorted[lowerIndex] + (sorted[upperIndex] - sorted[lowerIndex]) * weight;
  return Number(interpolated.toFixed(2));
}

/**
 * Redacts sensitive HTTP headers.
 * @param {Object} headers - Key-value pair of headers
 * @param {string[]} [customSensitiveHeaders=[]] - Additional headers to redact
 * @returns {Object} Sanitized headers object
 */
export function redactHeaders(headers = {}, customSensitiveHeaders = []) {
  if (!headers || typeof headers !== 'object') return {};

  const sensitiveSet = new Set([...SENSITIVE_HEADERS, ...customSensitiveHeaders.map((h) => h.toLowerCase())]);
  const sanitized = {};

  for (const [key, value] of Object.entries(headers)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveSet.has(lowerKey)) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Generates a copy-pasteable cURL command string for an HTTP request.
 * @param {Object} req - Request info { method, url, headers, body }
 * @returns {string} Formatted cURL command
 */
export function generateCurl(req = {}) {
  const method = (req.method || 'GET').toUpperCase();
  const url = req.url || '/';
  const headers = redactHeaders(req.headers || {});

  let curl = `curl -X ${method} "${url}"`;

  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === 'content-length') continue;
    const escapedValue = String(value).replace(/"/g, '\\"');
    curl += ` \\\n  -H "${key}: ${escapedValue}"`;
  }

  if (req.body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    let bodyStr = '';
    if (typeof req.body === 'object') {
      bodyStr = JSON.stringify(req.body);
    } else {
      bodyStr = String(req.body);
    }
    const escapedBody = bodyStr.replace(/"/g, '\\"');
    curl += ` \\\n  --data "${escapedBody}"`;
  }

  return curl;
}
