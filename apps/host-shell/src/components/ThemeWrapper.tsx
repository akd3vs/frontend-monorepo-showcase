/**
 * ThemeWrapper
 *
 * Bridges the feature flag system with the ThemeProvider from ui-core.
 * Must be rendered inside FeatureFlagProvider to access the dark-mode flag.
 */

import { ThemeProvider } from '@frontend-monorepo-showcase/ui-core';

import { useFeatureFlag } from '../features/feature-flags';

import type { ReactNode } from 'react';


interface ThemeWrapperProps {
  children: ReactNode;
}

export function ThemeWrapper({ children }: ThemeWrapperProps) {
  const isDarkMode = useFeatureFlag('dark-mode');

  return (
    <ThemeProvider isDarkMode={isDarkMode} respectSystemPreference={false}>
      {children}
    </ThemeProvider>
  );
}
