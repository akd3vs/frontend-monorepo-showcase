/**
 * Property-Based Test: Feature Flag Reactivity and Persistence (Property 15)
 *
 * Feature: enterprise-frontend-monorepo, Property 15: Feature Flag Reactivity and Persistence
 * Testing Framework: Vitest + fast-check
 *
 * **Validates: Requirements 16.4, 16.5**
 *
 * For any registered feature flag, toggling its value SHALL immediately cause all
 * components consuming that flag (via useFeatureFlag) to re-render with the updated
 * value. Additionally, for any set of flag overrides stored in localStorage, reloading
 * the application SHALL restore those exact override values (round-trip persistence).
 */
import { act, render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  FeatureFlagProvider,
  useFeatureFlag,
  useFeatureFlags,
} from '../features/feature-flags';
import {
  readPersistedState,
  writePersistedState,
  resolveOverrides,
} from '../features/feature-flags/storage';
import { featureFlagRegistry } from '../features/feature-flags/registry';

// ─── localStorage mock ─────────────────────────────────────────────────────────

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

// ─── Arbitraries ────────────────────────────────────────────────────────────────

/** Arbitrary for flag names drawn from the actual registry */
const knownFlagNames = Object.keys(featureFlagRegistry.flags);

const flagNameArb = fc.constantFrom(...knownFlagNames);

/** Arbitrary for a set of flag overrides (subset of known flags with random booleans) */
const flagOverridesArb = fc.uniqueArray(flagNameArb, { minLength: 1, maxLength: knownFlagNames.length }).chain(
  (names) =>
    fc.tuple(...names.map(() => fc.boolean())).map((values) => {
      const overrides: Record<string, boolean> = {};
      names.forEach((name, i) => {
        overrides[name] = values[i]!;
      });
      return overrides;
    }),
);

// ─── Test helper components ─────────────────────────────────────────────────────

let renderCount = 0;

function FlagConsumer({ flagName }: { flagName: string }) {
  const value = useFeatureFlag(flagName);
  renderCount++;
  return <div data-testid="flag-value">{String(value)}</div>;
}

function FlagToggler({
  flagName,
  children,
}: {
  flagName: string;
  children: React.ReactNode;
}) {
  const { setFlag, getFlag } = useFeatureFlags();
  return (
    <div>
      <button
        data-testid="toggle-btn"
        onClick={() => setFlag(flagName, !getFlag(flagName))}
      >
        Toggle
      </button>
      {children}
    </div>
  );
}

// ─── Property 15: Feature Flag Reactivity and Persistence ───────────────────────

describe('Property 15: Feature Flag Reactivity and Persistence', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    renderCount = 0;
  });

  afterEach(() => {
    // Cleanup any lingering DOM
  });

  describe('Reactivity: toggling a flag causes immediate re-render with updated value', () => {
    it('for any registered flag, toggling updates the consuming component immediately', () => {
      fc.assert(
        fc.property(flagNameArb, (flagName) => {
          localStorageMock.clear();
          renderCount = 0;

          const { unmount } = render(
            <FeatureFlagProvider>
              <FlagToggler flagName={flagName}>
                <FlagConsumer flagName={flagName} />
              </FlagToggler>
            </FeatureFlagProvider>,
          );

          // Get the initial value from the registry default
          const defaultValue = featureFlagRegistry.flags[flagName]!.defaultValue;
          const initialDisplay = screen.getByTestId('flag-value');
          expect(initialDisplay.textContent).toBe(String(defaultValue));

          const initialRenderCount = renderCount;

          // Toggle the flag
          act(() => {
            screen.getByTestId('toggle-btn').click();
          });

          // The consumer re-rendered with the negated value
          expect(renderCount).toBeGreaterThan(initialRenderCount);
          expect(screen.getByTestId('flag-value').textContent).toBe(
            String(!defaultValue),
          );

          // Toggle again
          act(() => {
            screen.getByTestId('toggle-btn').click();
          });

          // Value flips back
          expect(screen.getByTestId('flag-value').textContent).toBe(
            String(defaultValue),
          );

          unmount();
        }),
        { numRuns: 100 },
      );
    });

    it('for any flag and arbitrary toggle sequence, final value matches expected', () => {
      fc.assert(
        fc.property(
          flagNameArb,
          fc.integer({ min: 1, max: 10 }),
          (flagName, toggleCount) => {
            localStorageMock.clear();
            renderCount = 0;

            const { unmount } = render(
              <FeatureFlagProvider>
                <FlagToggler flagName={flagName}>
                  <FlagConsumer flagName={flagName} />
                </FlagToggler>
              </FeatureFlagProvider>,
            );

            const defaultValue = featureFlagRegistry.flags[flagName]!.defaultValue;

            // Toggle the flag toggleCount times
            for (let i = 0; i < toggleCount; i++) {
              act(() => {
                screen.getByTestId('toggle-btn').click();
              });
            }

            // After an even number of toggles the value should equal default,
            // after an odd number it should be negated
            const expectedValue = toggleCount % 2 === 0 ? defaultValue : !defaultValue;
            expect(screen.getByTestId('flag-value').textContent).toBe(
              String(expectedValue),
            );

            unmount();
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('Persistence: localStorage round-trip preserves all flag overrides', () => {
    it('for any set of flag overrides, write then read back produces the same overrides', () => {
      fc.assert(
        fc.property(flagOverridesArb, (overrides) => {
          localStorageMock.clear();

          // Write overrides to localStorage
          writePersistedState(overrides);

          // Read back
          const persisted = readPersistedState();
          expect(persisted).not.toBeNull();
          expect(persisted!.overrides).toEqual(overrides);
          expect(persisted!.version).toBe(1);
          expect(persisted!.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
        }),
        { numRuns: 100 },
      );
    });

    it('for any overrides, resolveOverrides after round-trip returns the same overrides for known flags', () => {
      fc.assert(
        fc.property(flagOverridesArb, (overrides) => {
          localStorageMock.clear();

          // Write then read
          writePersistedState(overrides);
          const persisted = readPersistedState();

          // Resolve the overrides against known flag names
          const resolved = resolveOverrides(persisted, knownFlagNames);

          // Since all keys in our arbitrary are from knownFlagNames,
          // the resolved overrides must exactly match the input
          expect(resolved).toEqual(overrides);
        }),
        { numRuns: 100 },
      );
    });

    it('for any overrides, the FeatureFlagProvider restores persisted values on mount', () => {
      fc.assert(
        fc.property(flagOverridesArb, (overrides) => {
          localStorageMock.clear();

          // Pre-populate localStorage before mounting the provider
          writePersistedState(overrides);

          // Pick one flag to verify
          const flagName = Object.keys(overrides)[0]!;
          const expectedValue = overrides[flagName]!;

          const { unmount } = render(
            <FeatureFlagProvider>
              <FlagConsumer flagName={flagName} />
            </FeatureFlagProvider>,
          );

          expect(screen.getByTestId('flag-value').textContent).toBe(
            String(expectedValue),
          );

          unmount();
        }),
        { numRuns: 100 },
      );
    });
  });
});
