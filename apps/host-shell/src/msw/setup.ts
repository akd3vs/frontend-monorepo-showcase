import { setupMockEngine } from '@frontend-monorepo-showcase/mock-engine';

let mswReady: Promise<void> | null = null;

/**
 * Initializes the MSW service worker before the application renders.
 * Ensures all fetch requests are intercepted from the very first component mount.
 * Throws if registration fails, blocking unintercepted requests.
 */
export function initMockServiceWorker(): Promise<void> {
  if (mswReady) return mswReady;

  mswReady = setupMockEngine()
    .then(() => {
      /* MSW registered successfully */
    })
    .catch((error: unknown) => {
      console.error('[App] MSW registration failed:', error);
      // Block unintercepted requests by throwing
      throw new Error(
        'Mock service worker failed to register. Application cannot make network requests.',
      );
    });

  return mswReady;
}
