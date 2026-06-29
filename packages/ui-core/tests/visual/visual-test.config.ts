/**
 * Visual snapshot test configuration.
 *
 * Viewport widths reference the breakpoint token definitions from the
 * design-tokens package (Requirement 12.6):
 * - 320px: below `sm` (480px)
 * - 768px: `md` breakpoint
 * - 1280px: `xl` breakpoint
 */

export const VIEWPORTS = {
  mobile: { width: 320, height: 568 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
} as const;

export const THEMES = ['light', 'dark'] as const;

/** Maximum pixel difference ratio before a test fails (0.1%) */
export const PIXEL_DIFF_THRESHOLD = 0.001;

/** Directory where baseline screenshots are stored (relative to ui-core root) */
export const BASELINE_DIR = 'tests/visual/__baselines__';

/** Directory where diff images are written on failure (relative to ui-core root) */
export const DIFF_DIR = 'tests/visual/__diffs__';

/** CSS injected before every screenshot to disable animations for deterministic captures */
export const ANIMATION_FREEZE_CSS = `
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
  }
`;
