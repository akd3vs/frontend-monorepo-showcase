/**
 * UI_Core Theme Tokens
 *
 * Re-exports TypeScript token objects from @frontend-monorepo-showcase/design-tokens
 * for backward compatibility. Consumers can import directly from design-tokens
 * or continue using this module.
 */

import { spacing as spacingTokens } from '@frontend-monorepo-showcase/design-tokens/spacing';

// Re-export design-token objects for consumers who want the full token API
export {
  colorTokens,
  primary,
  secondary,
  success,
  warning,
  error,
  neutral,
} from '@frontend-monorepo-showcase/design-tokens/colors';
export { spacing, spacingPx } from '@frontend-monorepo-showcase/design-tokens/spacing';
export { fontFamilies, fontSizes, fontWeights, lineHeights } from '@frontend-monorepo-showcase/design-tokens/typography';
export { motionDurations, motionEasings } from '@frontend-monorepo-showcase/design-tokens/motion';
export { elevation, elevationDark } from '@frontend-monorepo-showcase/design-tokens/elevation';
export { breakpoints } from '@frontend-monorepo-showcase/design-tokens/breakpoints';

// Legacy theme objects for backward compatibility with existing components.
// These use simplified hex-string structures that existing inline-style components expect.
export const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  secondary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  background: '#ffffff',
  surface: '#f9fafb',
  text: {
    primary: '#111827',
    secondary: '#4b5563',
    disabled: '#9ca3af',
    inverse: '#ffffff',
  },
} as const;

export const typography = {
  fontFamilies: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export type Colors = typeof colors;
export type Spacing = typeof spacingTokens;
export type Typography = typeof typography;

export const theme = {
  colors,
  spacing: spacingTokens,
  typography,
} as const;

export type Theme = typeof theme;
