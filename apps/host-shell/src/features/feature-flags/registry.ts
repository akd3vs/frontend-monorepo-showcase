/**
 * Feature Flag Registry
 *
 * Central registry of all feature flags with their definitions and default values.
 * New flags should be added here with a descriptive name and default value.
 */

export interface FeatureFlagDefinition {
  name: string;
  description: string;
  defaultValue: boolean;
}

export interface FeatureFlagRegistry {
  flags: Record<string, FeatureFlagDefinition>;
}

export const featureFlagRegistry: FeatureFlagRegistry = {
  flags: {
    'dark-mode': {
      name: 'dark-mode',
      description: 'Enable dark theme',
      defaultValue: false,
    },
    'new-dashboard-layout': {
      name: 'new-dashboard-layout',
      description: 'Use new dashboard grid layout',
      defaultValue: false,
    },
    'real-time-updates': {
      name: 'real-time-updates',
      description: 'Enable WebSocket real-time data',
      defaultValue: false,
    },
    'devtools-visible': {
      name: 'devtools-visible',
      description: 'Show devtools panel',
      defaultValue: true,
    },
  },
};
