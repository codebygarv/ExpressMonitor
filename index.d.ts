import { Request, Response, NextFunction } from 'express';

export interface ExpressMonitorOptions {
  /**
   * Whether to log analytics to the console for every HTTP request.
   * @default true
   */
  logAnalytics?: boolean;
}

/**
 * Express Monitor Middleware
 * A lightweight, plug-and-play monitoring package for Express.js applications.
 * 
 * @param options Configuration options
 * @returns Express middleware function
 */
export default function monitor(options?: ExpressMonitorOptions): (req: Request, res: Response, next: NextFunction) => void;
