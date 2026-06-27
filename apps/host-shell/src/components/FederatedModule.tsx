import { ErrorBoundary } from '@frontend-monorepo-showcase/ui-core';
import React, { Suspense, useCallback, useRef, useState } from 'react';

import { LoadingIndicator } from './LoadingIndicator';

const MODULE_LOAD_TIMEOUT_MS = 10_000;

/**
 * Wraps a promise with a timeout. Rejects if the promise doesn't resolve within `ms` milliseconds.
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Module load timeout')), ms),
    ),
  ]);
}

export interface FederatedModuleProps {
  /** Dynamic import loader function, e.g. () => import('data_dashboard/DashboardApp') */
  loader: () => Promise<{ default: React.ComponentType }>;
  /** Unique boundary ID for telemetry */
  boundaryId: string;
  /** Callback invoked on navigation action from error boundary */
  onNavigate?: () => void;
  /** Callback for error telemetry */
  onError?: (event: unknown) => void;
  /** Label shown while loading */
  loadingLabel?: string;
}

/**
 * Wraps a federated module in React.lazy() + Suspense + ErrorBoundary.
 *
 * Features:
 * - 10-second timeout on module loads via Promise.race
 * - Retry mechanism that resets error boundary and re-triggers lazy import
 * - Escalation handled by the ui-core ErrorBoundary (3 failures in 60s → persistent error)
 */
export function FederatedModule({
  loader,
  boundaryId,
  onNavigate,
  onError,
  loadingLabel,
}: FederatedModuleProps) {
  // Use a key to force re-creation of the lazy component on retry
  const [retryKey, setRetryKey] = useState(0);
  const lazyRef = useRef<React.LazyExoticComponent<React.ComponentType> | null>(null);

  // Create (or re-create) the lazy component with timeout
  const getLazyComponent = useCallback(() => {
    if (!lazyRef.current || retryKey > 0) {
      lazyRef.current = React.lazy(() =>
        withTimeout(loader(), MODULE_LOAD_TIMEOUT_MS),
      );
    }
    return lazyRef.current;
  }, [loader, retryKey]);

  const LazyComponent = getLazyComponent();

  const handleRetry = useCallback(() => {
    // Reset the lazy ref so a fresh import is triggered
    lazyRef.current = null;
    setRetryKey((prev) => prev + 1);
  }, []);

  return (
    <ErrorBoundary
      boundaryId={boundaryId}
      onNavigate={onNavigate}
      onError={onError}
    >
      <RetryableSuspense
        key={retryKey}
        LazyComponent={LazyComponent}
        loadingLabel={loadingLabel}
        onRetry={handleRetry}
      />
    </ErrorBoundary>
  );
}

/**
 * Inner component that renders the lazy component within Suspense.
 * Separated to allow the ErrorBoundary's retry to trigger re-mount via key change.
 */
function RetryableSuspense({
  LazyComponent,
  loadingLabel,
}: {
  LazyComponent: React.LazyExoticComponent<React.ComponentType>;
  loadingLabel?: string;
  onRetry: () => void;
}) {
  return (
    <Suspense fallback={<LoadingIndicator label={loadingLabel} />}>
      <LazyComponent />
    </Suspense>
  );
}

/**
 * Factory function to create a federated component wrapper.
 * Convenience for declaring federated modules in a consistent way.
 */
export function createFederatedComponent(
  loader: () => Promise<{ default: React.ComponentType }>,
  options?: {
    boundaryId?: string;
    onNavigate?: () => void;
    onError?: (event: unknown) => void;
    loadingLabel?: string;
  },
): React.ComponentType {
  const boundaryId = options?.boundaryId ?? 'federated-module';

  return function FederatedWrapper() {
    return (
      <FederatedModule
        loader={loader}
        boundaryId={boundaryId}
        onNavigate={options?.onNavigate}
        onError={options?.onError}
        loadingLabel={options?.loadingLabel}
      />
    );
  };
}
