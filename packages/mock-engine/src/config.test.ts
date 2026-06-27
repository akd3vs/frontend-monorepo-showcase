import { describe, it, expect } from 'vitest';

import { DEFAULT_CONFIG, resolveConfig } from './config.js';

describe('config', () => {
  it('DEFAULT_CONFIG has correct defaults', () => {
    expect(DEFAULT_CONFIG.errorRate).toBe(0.05);
    expect(DEFAULT_CONFIG.minLatencyMs).toBe(100);
    expect(DEFAULT_CONFIG.maxLatencyMs).toBe(2000);
    expect(DEFAULT_CONFIG.enableLogging).toBe(true);
  });

  describe('resolveConfig', () => {
    it('returns defaults when no partial provided', () => {
      const config = resolveConfig();
      expect(config).toEqual(DEFAULT_CONFIG);
    });

    it('returns defaults when empty partial provided', () => {
      const config = resolveConfig({});
      expect(config).toEqual(DEFAULT_CONFIG);
    });

    it('overrides specific values', () => {
      const config = resolveConfig({ errorRate: 0.1, minLatencyMs: 200 });
      expect(config.errorRate).toBe(0.1);
      expect(config.minLatencyMs).toBe(200);
      expect(config.maxLatencyMs).toBe(2000); // untouched default
      expect(config.enableLogging).toBe(true); // untouched default
    });

    it('can disable logging', () => {
      const config = resolveConfig({ enableLogging: false });
      expect(config.enableLogging).toBe(false);
    });
  });
});
