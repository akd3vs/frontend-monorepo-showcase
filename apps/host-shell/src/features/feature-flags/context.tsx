/**
 * Feature Flag React Context and Provider
 *
 * Provides feature flag state to the component tree with immediate reactivity.
 * Flag changes trigger re-renders and are persisted to localStorage.
 */

import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { featureFlagRegistry, type FeatureFlagDefinition } from './registry';
import { readPersistedState, resolveOverrides, writePersistedState } from './storage';

export interface FeatureFlagContextValue {
  /** Get the current value of a flag. Returns default if no override exists. */
  getFlag: (name: string) => boolean;
  /** Set a flag override. Triggers re-render and persists to localStorage. */
  setFlag: (name: string, value: boolean) => void;
  /** Get all flag definitions with their current resolved values. */
  getAllFlags: () => Array<FeatureFlagDefinition & { currentValue: boolean }>;
}

export const FeatureFlagContext = createContext<FeatureFlagContextValue | null>(null);

function getInitialOverrides(): Record<string, boolean> {
  const storedState = readPersistedState();
  const knownFlagNames = Object.keys(featureFlagRegistry.flags);
  return resolveOverrides(storedState, knownFlagNames);
}

export function FeatureFlagProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<Record<string, boolean>>(getInitialOverrides);

  const getFlag = useCallback(
    (name: string): boolean => {
      if (name in overrides) {
        return overrides[name]!;
      }
      const definition = featureFlagRegistry.flags[name];
      return definition?.defaultValue ?? false;
    },
    [overrides],
  );

  const setFlag = useCallback(
    (name: string, value: boolean) => {
      setOverrides((prev) => {
        const next = { ...prev, [name]: value };
        writePersistedState(next);
        return next;
      });
    },
    [],
  );

  const getAllFlags = useCallback((): Array<FeatureFlagDefinition & { currentValue: boolean }> => {
    return Object.values(featureFlagRegistry.flags).map((def) => ({
      ...def,
      currentValue: def.name in overrides ? overrides[def.name]! : def.defaultValue,
    }));
  }, [overrides]);

  const contextValue = useMemo<FeatureFlagContextValue>(
    () => ({ getFlag, setFlag, getAllFlags }),
    [getFlag, setFlag, getAllFlags],
  );

  return (
    <FeatureFlagContext.Provider value={contextValue}>
      {children}
    </FeatureFlagContext.Provider>
  );
}
