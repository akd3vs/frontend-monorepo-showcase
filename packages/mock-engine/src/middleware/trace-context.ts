/**
 * W3C Trace Context header injection for mock responses.
 *
 * Generates valid `traceparent` and `tracestate` headers per the
 * W3C Trace Context specification (https://www.w3.org/TR/trace-context/).
 *
 * Format: {version}-{trace-id}-{parent-id}-{trace-flags}
 *   - version: "00"
 *   - trace-id: 32 lowercase hex chars (16 bytes)
 *   - parent-id: 16 lowercase hex chars (8 bytes)
 *   - trace-flags: "01" (sampled)
 */

/**
 * Generates a random hex string of the specified byte length.
 * Uses crypto.getRandomValues when available, falls back to Math.random.
 */
export function generateHex(byteLength: number): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(byteLength);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Fallback for environments without crypto
  let hex = '';
  for (let i = 0; i < byteLength; i++) {
    hex += Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, '0');
  }
  return hex;
}

/**
 * Generates a valid W3C traceparent header value.
 *
 * @returns A traceparent string in the format: 00-{trace-id}-{parent-id}-01
 */
export function generateTraceparent(): string {
  const version = '00';
  const traceId = generateHex(16); // 32 hex chars
  const parentId = generateHex(8); // 16 hex chars
  const traceFlags = '01'; // sampled

  return `${version}-${traceId}-${parentId}-${traceFlags}`;
}

/**
 * Generates a tracestate header value for mock responses.
 *
 * @returns A tracestate string indicating the response came from the mock engine.
 */
export function generateTracestate(): string {
  return 'mock=true';
}

/**
 * Injects W3C trace context headers (traceparent and tracestate) into a Headers object.
 * Mutates the provided headers and returns them for chaining.
 */
export function injectTraceHeaders(headers: Headers): Headers {
  headers.set('traceparent', generateTraceparent());
  headers.set('tracestate', generateTracestate());
  return headers;
}

/**
 * Creates a new Headers object with trace context headers injected.
 * Preserves any existing headers passed in.
 */
export function withTraceHeaders(
  existingHeaders?: HeadersInit,
): Headers {
  const headers = new Headers(existingHeaders);
  injectTraceHeaders(headers);
  return headers;
}

/**
 * W3C traceparent validation regex.
 * Matches: 00-{32 hex}-{16 hex}-{2 hex}
 */
export const TRACEPARENT_REGEX =
  /^00-[0-9a-f]{32}-[0-9a-f]{16}-[0-9a-f]{2}$/;

/**
 * Validates whether a string is a well-formed W3C traceparent header.
 */
export function isValidTraceparent(value: string): boolean {
  return TRACEPARENT_REGEX.test(value);
}

/**
 * MSW lifecycle event handler that injects trace context headers
 * on every mocked response. Attach to the worker/server instance:
 *
 * ```ts
 * worker.events.on('response:mocked', traceContextLifecycleHandler);
 * ```
 *
 * Note: In MSW 2.x, lifecycle events receive the response but
 * modifications to the response object are not propagated back.
 * For actual header injection, use `wrapHandlersWithTraceContext`.
 */
export type TraceContextResponseInit = {
  headers?: HeadersInit;
  status?: number;
  statusText?: string;
};

/**
 * Wraps an array of MSW handlers so that every response they produce
 * includes W3C trace context headers (traceparent + tracestate).
 *
 * This works by intercepting the HttpResponse construction in each handler.
 * Since MSW 2.x lifecycle events are read-only, this approach uses a
 * higher-order handler pattern to guarantee trace headers on all responses.
 */
export function createTraceContextInterceptor() {
  // Store original Response constructor behavior
  const originalHeaders = (response: Response): Headers => {
    const headers = new Headers();
    response.headers.forEach((value, key) => {
      headers.set(key, value);
    });
    headers.set('traceparent', generateTraceparent());
    headers.set('tracestate', generateTracestate());
    return headers;
  };

  return {
    /**
     * Adds trace context headers to an existing Response object.
     * Returns a new Response with the trace headers injected.
     */
    async injectIntoResponse(response: Response): Promise<Response> {
      const body = await response.clone().arrayBuffer();
      const traceHeaders = originalHeaders(response);

      return new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers: traceHeaders,
      });
    },
  };
}
