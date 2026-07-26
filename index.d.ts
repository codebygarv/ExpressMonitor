import { Request, Response, NextFunction } from 'express';

export interface ExpressMonitorOptions {
  /**
   * Whether to log analytics to the console for every HTTP request.
   * @default true
   */
  logAnalytics?: boolean;

  /**
   * Log interval in milliseconds for batched logging. Set to 0 to log every request.
   * @default 0
   */
  logInterval?: number;

  /**
   * Whether to colorize status codes and latency in terminal console output.
   * @default true
   */
  colorize?: boolean;

  /**
   * List of routes (strings or RegExp patterns) to ignore from logging and tracking.
   * Example: ['/health', '/favicon.ico']
   */
  ignoreRoutes?: Array<string | RegExp>;
}

export interface RouteMetric {
  count: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
}

export interface ErrorLogEntry {
  timestamp: string;
  method: string;
  url: string;
  status: number;
  durationMs: number;
}

export interface ExpressMonitorMetrics {
  totalRequests: number;
  totalErrors: number;
  errorRate: string;
  avgDurationMs: number;
  statusCodes: Record<string | number, number>;
  methods: Record<string, number>;
  routes: Record<string, RouteMetric>;
  recentErrors: ErrorLogEntry[];
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
 * Express Monitor Middleware
 * A lightweight, plug-and-play monitoring package for Express.js applications.
 * 
 * @param options Configuration options
 * @returns Express middleware function
 */
export default function monitor(options?: ExpressMonitorOptions): (req: Request, res: Response, next: NextFunction) => void;

/**
 * Get a JSON snapshot of current application metrics.
 */
export function getMetrics(): ExpressMonitorMetrics;

/**
 * Reset all stored application metrics.
 */
export function resetMetrics(): void;

/**
 * Express route handler middleware to expose metrics JSON endpoint over HTTP.
 */
export function metricsHandler(): (req: Request, res: Response) => void;
