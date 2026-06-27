/**
 * Feature Flags Module
 *
 * Public API for the feature flag system. Consumers should import from this barrel.
 */

export { featureFlagRegistry } from './registry';
export type { FeatureFlagDefinition, FeatureFlagRegistry } from './registry';

export { FeatureFlagProvider, FeatureFlagContext } from './context';
export type { FeatureFlagContextValue } from './context';

export { useFeatureFlag, useFeatureFlags } from './hooks';

export { FeatureFlagBridge } from './FeatureFlagBridge';

export type { PersistedFlagState } from './storage';
export { readPersistedState, writePersistedState, resolveOverrides } from './storage';
