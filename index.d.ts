import { RequestHandler } from 'express';

export interface Percentiles {
  p50: number;
  p90: number;
  p95: number;
  p99: number;
}

export interface RouteMetric {
  count: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  percentiles: Percentiles;
}

export interface RequestEntry {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  status: number;
  durationMs: number;
  headers: Record<string, string | string[]>;
  ip?: string;
  curl?: string;
  slowThresholdMs?: number;
}

export interface AlertTrigger {
  type: 'ERROR_RATE_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED' | 'LATENCY_THRESHOLD_EXCEEDED';
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: string;
}

export interface AlertOptions {
  /** Error rate percentage threshold (0-100) to trigger alert */
  errorRateThreshold?: number;
  /** RSS memory threshold in MB to trigger alert */
  memoryThresholdMb?: number;
  /** Average response latency threshold in ms to trigger alert */
  avgDurationThresholdMs?: number;
  /** Alert callback function */
  onAlert?: (alert: AlertTrigger) => void;
}

export interface ExpressLensOptions {
  /** Enable/disable console analytics logging (default: true) */
  logAnalytics?: boolean;
  /** Batched logging interval in milliseconds (default: 0 for real-time logging) */
  logInterval?: number;
  /** Enable ANSI colors in console log output (default: true) */
  colorize?: boolean;
  /** Array of string prefixes or RegExps to exclude from metric collection */
  ignoreRoutes?: (string | RegExp)[];
  /** Slow request threshold in ms to log/buffer slow endpoints (default: 500ms) */
  slowThresholdMs?: number;
  /** Custom header names to redact in logs and dashboard */
  redactHeaders?: string[];
  /** Threshold alert configuration */
  alerts?: AlertOptions;
}

export interface ExpressLensMetrics {
  totalRequests: number;
  totalErrors: number;
  errorRate: string;
  avgDurationMs: number;
  percentiles: Percentiles;
  statusCodes: Record<number, number>;
  methods: Record<string, number>;
  routes: Record<string, RouteMetric>;
  recentErrors: RequestEntry[];
  slowRequests: RequestEntry[];
  system: {
    uptime: number;
    memory: {
      heapTotal: number;
      heapUsed: number;
      rss: number;
      external: number;
    };
    system: {
      totalMem: number;
      freeMem: number;
      cpus: number;
      loadavg: number[];
    };
  };
}

/**
 * Express Lens Middleware Factory
 */
export default function monitor(options?: ExpressLensOptions): RequestHandler;

/**
 * Get a JSON snapshot of all current metrics.
 */
export function getMetrics(): ExpressLensMetrics;

/**
 * Calculate percentiles (p50, p90, p95, p99) from latency samples.
 */
export function getPercentiles(samples?: number[]): Percentiles;

/**
 * Reset all stored metrics to initial state.
 */
export function resetMetrics(): void;

/**
 * Express handler to serve metrics JSON over HTTP.
 */
export function metricsHandler(): RequestHandler;

/**
 * Get metrics in Prometheus exposition text format.
 */
export function getPrometheusMetrics(): string;

/**
 * Express handler to serve Prometheus format metrics at /metrics.
 */
export function prometheusHandler(): RequestHandler;

/**
 * Express handler to serve embedded real-time web dashboard & SSE events stream.
 */
export function dashboardHandler(): RequestHandler;

/**
 * Export captured requests as standard HAR 1.2 JSON object.
 */
export function exportHAR(title?: string): object;

/**
 * Replay a captured request by ID.
 */
export function replayRequest(requestId: string, fetchFn?: typeof fetch): Promise<{
  success: boolean;
  status?: number;
  durationMs?: number;
  error?: string;
  originalRequestId: string;
}>;

/**
 * Generate cURL command string for a request.
 */
export function generateCurl(req: {
  method?: string;
  url?: string;
  headers?: Record<string, any>;
  body?: any;
}): string;
