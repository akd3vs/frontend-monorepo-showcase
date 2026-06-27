/**
 * Wires error boundary telemetry events into the OpenTelemetry pipeline.
 *
 * Provides a handler function that can be passed to ErrorBoundary's `onError` prop.
 * Each telemetry event becomes an OTel span with error details as attributes.
 */
import { SpanStatusCode } from '@opentelemetry/api';

import { getTracer } from './index';

import type { ErrorBoundaryTelemetryEvent } from '@frontend-monorepo-showcase/ui-core';

/**
 * Handle an error boundary telemetry event by creating an OpenTelemetry span.
 *
 * Use this as the `onError` callback for ErrorBoundary components:
 * ```tsx
 * <ErrorBoundary boundaryId="my-module" onError={handleErrorBoundaryTelemetry}>
 *   ...
 * </ErrorBoundary>
 * ```
 */
export function handleErrorBoundaryTelemetry(
  event: ErrorBoundaryTelemetryEvent,
): void {
  const tracer = getTracer();
  const span = tracer.startSpan('error_boundary.catch', {
    attributes: {
      'error.message': event.errorMessage,
      'error.component_stack': event.componentStack,
      'error.timestamp': event.timestamp,
      'error.boundary_id': event.boundaryId,
    },
  });

  if (event.recoveryAction) {
    span.setAttribute('error.recovery_action', event.recoveryAction);
  }

  span.setStatus({
    code: SpanStatusCode.ERROR,
    message: event.errorMessage,
  });

  span.end();
}
