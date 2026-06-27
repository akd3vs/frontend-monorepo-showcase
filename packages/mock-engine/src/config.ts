/**
 * Configuration interface for the Mock Engine.
 */
export interface MockEngineConfig {
  /** Probability of injecting an error response (0.0 - 1.0, default 0.05) */
  errorRate: number;
  /** Minimum simulated latency in milliseconds (default 100) */
  minLatencyMs: number;
  /** Maximum simulated latency in milliseconds (default 2000) */
  maxLatencyMs: number;
  /** Whether to log unmatched requests and errors to console (default true) */
  enableLogging: boolean;
}

/**
 * Default configuration values for the Mock Engine.
 */
export const DEFAULT_CONFIG: MockEngineConfig = {
  errorRate: 0.05,
  minLatencyMs: 100,
  maxLatencyMs: 2000,
  enableLogging: true,
};

/**
 * Merges partial user config with defaults.
 */
export function resolveConfig(
  partial?: Partial<MockEngineConfig>,
): MockEngineConfig {
  return { ...DEFAULT_CONFIG, ...partial };
}
