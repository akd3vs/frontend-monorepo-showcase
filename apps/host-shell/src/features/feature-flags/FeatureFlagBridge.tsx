/**
 * Feature Flag Bridge
 *
 * Exposes the feature flag API on window.__FEATURE_FLAGS_API__ so that
 * federated remote modules (e.g., devtools-panel) can access feature flags
 * without cross-boundary React context issues.
 *
 * This component should be rendered inside the FeatureFlagProvider.
 */

import { useEffect } from 'react';

import { useFeatureFlags } from './hooks';

declare global {
  interface Window {
    __FEATURE_FLAGS_API__?: {
      getAllFlags: () => Array<{
        name: string;
        description: string;
        defaultValue: boolean;
        currentValue: boolean;
      }>;
      setFlag: (name: string, value: boolean) => void;
    };
  }
}

export function FeatureFlagBridge() {
  const { getAllFlags, setFlag } = useFeatureFlags();

  useEffect(() => {
    window.__FEATURE_FLAGS_API__ = { getAllFlags, setFlag };
    return () => {
      delete window.__FEATURE_FLAGS_API__;
    };
  }, [getAllFlags, setFlag]);

  return null;
}
