import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  readPersistedState,
  writePersistedState,
  resolveOverrides,
  type PersistedFlagState,
} from './storage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('feature-flags/storage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('readPersistedState', () => {
    it('returns null when no data is stored', () => {
      expect(readPersistedState()).toBeNull();
    });

    it('returns null for invalid JSON', () => {
      localStorageMock.setItem('feature-flags', 'not-json');
      expect(readPersistedState()).toBeNull();
    });

    it('returns null for invalid shape (missing version)', () => {
      localStorageMock.setItem(
        'feature-flags',
        JSON.stringify({ overrides: {}, updatedAt: '2024-01-01T00:00:00Z' }),
      );
      expect(readPersistedState()).toBeNull();
    });

    it('returns null for invalid shape (overrides is not object)', () => {
      localStorageMock.setItem(
        'feature-flags',
        JSON.stringify({ version: 1, overrides: 'bad', updatedAt: '2024-01-01T00:00:00Z' }),
      );
      expect(readPersistedState()).toBeNull();
    });

    it('returns valid persisted state', () => {
      const state: PersistedFlagState = {
        version: 1,
        overrides: { 'dark-mode': true },
        updatedAt: '2024-01-15T10:30:00.000Z',
      };
      localStorageMock.setItem('feature-flags', JSON.stringify(state));

      const result = readPersistedState();
      expect(result).toEqual(state);
    });
  });

  describe('writePersistedState', () => {
    it('writes overrides with version and timestamp', () => {
      const overrides = { 'dark-mode': true, 'real-time-updates': false };
      writePersistedState(overrides);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'feature-flags',
        expect.any(String),
      );

      const written = JSON.parse(
        localStorageMock.setItem.mock.calls[0]![1] as string,
      ) as PersistedFlagState;
      expect(written.version).toBe(1);
      expect(written.overrides).toEqual(overrides);
      expect(written.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('does not throw when localStorage is unavailable', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => writePersistedState({ 'dark-mode': true })).not.toThrow();
    });
  });

  describe('resolveOverrides', () => {
    const knownFlags = ['dark-mode', 'new-dashboard-layout', 'real-time-updates', 'devtools-visible'];

    it('returns empty object when no stored state', () => {
      expect(resolveOverrides(null, knownFlags)).toEqual({});
    });

    it('returns stored overrides when version matches and flags are known', () => {
      const stored: PersistedFlagState = {
        version: 1,
        overrides: { 'dark-mode': true, 'real-time-updates': true },
        updatedAt: '2024-01-15T10:30:00.000Z',
      };

      const result = resolveOverrides(stored, knownFlags);
      expect(result).toEqual({ 'dark-mode': true, 'real-time-updates': true });
    });

    it('filters out overrides for unknown flags (same version)', () => {
      const stored: PersistedFlagState = {
        version: 1,
        overrides: { 'dark-mode': true, 'removed-flag': false },
        updatedAt: '2024-01-15T10:30:00.000Z',
      };

      const result = resolveOverrides(stored, knownFlags);
      expect(result).toEqual({ 'dark-mode': true });
      expect(result).not.toHaveProperty('removed-flag');
    });

    it('merges known overrides on version mismatch', () => {
      const stored: PersistedFlagState = {
        version: 99, // different version
        overrides: { 'dark-mode': true, 'old-flag': false },
        updatedAt: '2024-01-15T10:30:00.000Z',
      };

      const result = resolveOverrides(stored, knownFlags);
      expect(result).toEqual({ 'dark-mode': true });
      expect(result).not.toHaveProperty('old-flag');
    });
  });
});
