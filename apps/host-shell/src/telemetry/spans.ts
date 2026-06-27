/**
 * Span creation utilities for OpenTelemetry.
 *
 * Creates spans for:
 * - Route transitions (from → to, duration)
 * - Module loads (module name, duration, success/failure)
 * - Data fetches (query key, duration, success/failure)
 */
import { SpanStatusCode, type Span } from '@opentelemetry/api';

import { getTracer } from './index';

/**
 * Create a span recording a route transition event.
 */
export function createRouteTransitionSpan(
  from: string,
  to: string,
  durationMs: number,
): Span {
  const tracer = getTracer();
  const span = tracer.startSpan('route.transition', {
    attributes: {
      'route.from': from,
      'route.to': to,
      'route.duration_ms': durationMs,
    },
  });

  span.setStatus({ code: SpanStatusCode.OK });
  span.end();
  return span;
}

/**
 * Create a span recording a federated module load event.
 */
export function createModuleLoadSpan(
  moduleName: string,
  durationMs: number,
  success: boolean,
  error?: string,
): Span {
  const tracer = getTracer();
  const span = tracer.startSpan('module.load', {
    attributes: {
      'module.name': moduleName,
      'module.duration_ms': durationMs,
      'module.success': success,
    },
  });

  if (error) {
    span.setAttribute('module.error', error);
  }

  span.setStatus({
    code: success ? SpanStatusCode.OK : SpanStatusCode.ERROR,
    message: error,
  });

  span.end();
  return span;
}

/**
 * Create a span recording a data fetch event (e.g., TanStack Query).
 */
export function createDataFetchSpan(
  queryKey: string,
  durationMs: number,
  success: boolean,
): Span {
  const tracer = getTracer();
  const span = tracer.startSpan('data.fetch', {
    attributes: {
      'fetch.query_key': queryKey,
      'fetch.duration_ms': durationMs,
      'fetch.success': success,
    },
  });

  span.setStatus({
    code: success ? SpanStatusCode.OK : SpanStatusCode.ERROR,
  });

  span.end();
  return span;
}
