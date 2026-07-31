import type { IncomingMessage, ServerResponse } from 'node:http';

export interface StreamCaptureOptions {
  maxBodySize?: number; // Maximum bytes to capture before dropping further chunks (default: 1024)
}

export interface CapturedStreamResult {
  body: string;
  truncated: boolean;
  sizeBytes: number;
}

/**
 * Utility to safely collect raw stream body chunks up to maxBodySize limit.
 */
export function createStreamCapturer(maxBodySize: number = 1024) {
  let chunks: Buffer[] = [];
  let currentSize = 0;
  let truncated = false;

  return {
    onData(chunk: any) {
      if (truncated) return;
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      currentSize += buf.length;

      if (currentSize > maxBodySize) {
        const allowedBytes = maxBodySize - (currentSize - buf.length);
        if (allowedBytes > 0) {
          chunks.push(buf.subarray(0, allowedBytes));
        }
        truncated = true;
      } else {
        chunks.push(buf);
      }
    },
    getResult(): CapturedStreamResult {
      const buffer = Buffer.concat(chunks);
      let bodyText = '';
      try {
        bodyText = buffer.toString('utf-8');
      } catch {
        bodyText = '[Binary Data]';
      }
      return {
        body: bodyText,
        truncated,
        sizeBytes: currentSize,
      };
    },
  };
}
