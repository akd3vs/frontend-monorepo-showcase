import { setupWorker } from 'msw/browser';

import { resolveConfig } from './config.js';
import { createRestHandlers, createFallbackHandler, createGraphQLHandlers  } from './handlers/index.js';

import type { MockEngineConfig } from './config.js';

/**
 * Sets up and starts the MSW service worker with all mock handlers registered.
 * Includes REST handlers, GraphQL handlers, and a fallback handler for unmatched requests.
 *
 * @param partial - Optional partial configuration to override defaults
 * @returns The started MSW worker instance
 * @throws Logs error to console if service worker registration fails
 */
export async function setupMockEngine(
  partial?: Partial<MockEngineConfig>,
): Promise<ReturnType<typeof setupWorker>> {
  const config = resolveConfig(partial);
  const handlers = [
    ...createRestHandlers(config),
    ...createGraphQLHandlers({
      errorRate: config.errorRate,
      minLatencyMs: config.minLatencyMs,
      maxLatencyMs: config.maxLatencyMs,
    }),
    createFallbackHandler(config),
  ];

  const worker = setupWorker(...handlers);

  try {
    await worker.start({
      onUnhandledRequest: 'bypass',
    });
  } catch (error) {
    console.error(
      '[MockEngine] Service worker registration failed:',
      error instanceof Error ? error.message : error,
    );
    throw error;
  }

  return worker;
}
