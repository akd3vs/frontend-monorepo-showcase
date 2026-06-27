import React, { Suspense } from 'react';

import { LoadingIndicator } from '../components/LoadingIndicator';
import { SilentErrorBoundary } from '../components/SilentErrorBoundary';

const MODULE_LOAD_TIMEOUT_MS = 10_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Module load timeout')), ms),
    ),
  ]);
}

const LazyDevtoolsWidget = React.lazy(() =>
  withTimeout(import('devtools_panel/DevtoolsWidget'), MODULE_LOAD_TIMEOUT_MS),
);

/**
 * Federated Devtools Panel module.
 * Wrapped in a SilentErrorBoundary — on failure, logs a warning and renders nothing.
 * The host application continues operating normally.
 */
export function DevtoolsWidget() {
  return (
    <SilentErrorBoundary moduleName="devtools-panel">
      <Suspense fallback={<LoadingIndicator label="Loading devtools…" />}>
        <LazyDevtoolsWidget />
      </Suspense>
    </SilentErrorBoundary>
  );
}
