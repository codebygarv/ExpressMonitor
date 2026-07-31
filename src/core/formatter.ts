export interface FormatPayloadOptions {
  maxDepth?: number; // Maximum depth before collapsing inner objects (default: 4)
  maxArrayItems?: number; // Maximum array items to show before truncating (default: 10)
}

/**
 * Safely format and truncate deep JSON structures to prevent terminal spam.
 */
export function formatPayload(data: any, options: FormatPayloadOptions = {}, currentDepth: number = 1): any {
  const maxDepth = options.maxDepth != null ? options.maxDepth : 4;
  const maxArrayItems = options.maxArrayItems != null ? options.maxArrayItems : 10;

  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data !== 'object') {
    return data;
  }

  if (data instanceof Date) return data.toISOString();
  if (data instanceof RegExp) return data.toString();
  if (data instanceof Error) return `${data.name}: ${data.message}`;
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer && Buffer.isBuffer(data)) return `[Buffer (${data.length} bytes)]`;

  if (currentDepth > maxDepth) {
    if (Array.isArray(data)) {
      return `[Array(${data.length})]`;
    }
    return '[Object]';
  }

  if (Array.isArray(data)) {
    if (data.length > maxArrayItems) {
      const truncatedSlice = data
        .slice(0, maxArrayItems)
        .map((item) => formatPayload(item, options, currentDepth + 1));
      return [...truncatedSlice, `... ${data.length - maxArrayItems} more items` as any];
    }
    return data.map((item) => formatPayload(item, options, currentDepth + 1));
  }

  const result: Record<string, any> = {};
  for (const key of Object.keys(data)) {
    result[key] = formatPayload(data[key], options, currentDepth + 1);
  }
  return result;
}
