/**
 * Feature Flag Hooks
 *
 * Provides convenient React hooks for consuming feature flag state.
 */

import { useContext } from 'react';

import { FeatureFlagContext, type FeatureFlagContextValue } from './context';

/**
 * Returns the current boolean value for a single feature flag.
 * Triggers re-render when the flag value changes.
 *
 * @param flagName - The registered flag name (e.g. 'dark-mode')
 * @returns The resolved flag value (override > default > false)
 */
export function useFeatureFlag(flagName: string): boolean {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlag must be used within a FeatureFlagProvider');
  }
  return context.getFlag(flagName);
}

/**
 * Returns the full feature flag context for advanced usage (e.g. devtools panel).
 * Provides access to getFlag, setFlag, and getAllFlags.
 */
export function useFeatureFlags(): FeatureFlagContextValue {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }
  return context;
}
