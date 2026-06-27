import { describe, it, expect } from 'vitest';

import { featureFlagRegistry } from './registry';

describe('feature-flags/registry', () => {
  it('contains the expected flags', () => {
    const flagNames = Object.keys(featureFlagRegistry.flags);
    expect(flagNames).toContain('dark-mode');
    expect(flagNames).toContain('new-dashboard-layout');
    expect(flagNames).toContain('real-time-updates');
    expect(flagNames).toContain('devtools-visible');
  });

  it('each flag has name, description, and defaultValue', () => {
    for (const [key, def] of Object.entries(featureFlagRegistry.flags)) {
      expect(def.name).toBe(key);
      expect(def.description).toBeTruthy();
      expect(typeof def.defaultValue).toBe('boolean');
    }
  });

  it('devtools-visible defaults to true', () => {
    expect(featureFlagRegistry.flags['devtools-visible']!.defaultValue).toBe(true);
  });

  it('dark-mode defaults to false', () => {
    expect(featureFlagRegistry.flags['dark-mode']!.defaultValue).toBe(false);
  });
});
