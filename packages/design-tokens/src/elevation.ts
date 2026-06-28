import type { ElevationTokens } from './types';

/** Elevation (box-shadow) tokens for light theme */
export const elevation: ElevationTokens = {
  0: 'none',
  1: '0 1px 2px rgba(0, 0, 0, 0.05)',
  2: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  3: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
  4: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
};

/** Elevation (box-shadow) tokens for dark theme */
export const elevationDark: ElevationTokens = {
  0: 'none',
  1: '0 1px 2px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
  2: '0 1px 3px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.07)',
  3: '0 4px 6px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.07)',
  4: '0 10px 15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
};
