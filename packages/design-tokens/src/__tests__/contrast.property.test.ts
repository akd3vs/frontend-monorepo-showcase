/**
 * Feature: ui-professional-refinement, Property 3: Dark Palette Text-Surface Contrast Ratio
 *
 * For any pairing of a text color token (text.primary, text.secondary, text.disabled) with a
 * surface token (background, surface) in the dark palette, the computed WCAG contrast ratio
 * between the text color and the surface color SHALL be ≥ 4.5:1.
 *
 * **Validates: Requirements 2.2, 6.1, 6.2, 6.4, 6.5**
 */

import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

import { validateContrastRatio } from '../../scripts/generate-tokens';

// ─── Token Definitions ───────────────────────────────────────────────────────

/** Dark mode semantic color tokens (from dark.css) */
const darkPalette = {
  background: '#0f172a',
  surface: '#1e293b',
  text: {
    primary: '#f1f5f9',
    secondary: '#94a3b8',
    disabled: '#475569',
  },
} as const;

/** Light mode semantic color tokens (from tokens.css / colors.ts) */
const lightPalette = {
  background: '#ffffff',
  surface: '#f9fafb',
  text: {
    primary: '#111827',
    secondary: '#4b5563',
    disabled: '#9ca3af',
  },
} as const;

const WCAG_AA_RATIO = 4.5;

// ─── Concrete Test Cases ─────────────────────────────────────────────────────

describe('Property 3: Dark Palette Text-Surface Contrast Ratio', () => {
  describe('Dark mode - concrete pairings meet WCAG AA (≥4.5:1)', () => {
    it('text-primary (#f1f5f9) on background (#0f172a) ≥ 4.5:1', () => {
      expect(
        validateContrastRatio(darkPalette.text.primary, darkPalette.background, WCAG_AA_RATIO),
      ).toBe(true);
    });

    it('text-primary (#f1f5f9) on surface (#1e293b) ≥ 4.5:1', () => {
      expect(
        validateContrastRatio(darkPalette.text.primary, darkPalette.surface, WCAG_AA_RATIO),
      ).toBe(true);
    });

    it('text-secondary (#94a3b8) on background (#0f172a) ≥ 4.5:1', () => {
      expect(
        validateContrastRatio(darkPalette.text.secondary, darkPalette.background, WCAG_AA_RATIO),
      ).toBe(true);
    });

    it('text-secondary (#94a3b8) on surface (#1e293b) ≥ 4.5:1', () => {
      expect(
        validateContrastRatio(darkPalette.text.secondary, darkPalette.surface, WCAG_AA_RATIO),
      ).toBe(true);
    });
  });

  describe('Light mode - concrete pairings meet WCAG AA (≥4.5:1)', () => {
    it('text-primary (#111827) on background (#ffffff) ≥ 4.5:1', () => {
      expect(
        validateContrastRatio(lightPalette.text.primary, lightPalette.background, WCAG_AA_RATIO),
      ).toBe(true);
    });

    it('text-primary (#111827) on surface (#f9fafb) ≥ 4.5:1', () => {
      expect(
        validateContrastRatio(lightPalette.text.primary, lightPalette.surface, WCAG_AA_RATIO),
      ).toBe(true);
    });

    it('text-secondary (#4b5563) on background (#ffffff) ≥ 4.5:1', () => {
      expect(
        validateContrastRatio(lightPalette.text.secondary, lightPalette.background, WCAG_AA_RATIO),
      ).toBe(true);
    });

    it('text-secondary (#4b5563) on surface (#f9fafb) ≥ 4.5:1', () => {
      expect(
        validateContrastRatio(lightPalette.text.secondary, lightPalette.surface, WCAG_AA_RATIO),
      ).toBe(true);
    });
  });

  // ─── Property-Based Test ─────────────────────────────────────────────────

  describe('Property-based: all text-on-surface pairings maintain ≥4.5:1 contrast', () => {
    /** Arbitrary that selects the matching surface color for a given palette */
    const textOnSurfaceArb = fc.oneof(
      // Dark palette pairings
      fc.record({
        text: fc.oneof(
          fc.constant(darkPalette.text.primary),
          fc.constant(darkPalette.text.secondary),
        ),
        surface: fc.oneof(
          fc.constant(darkPalette.background),
          fc.constant(darkPalette.surface),
        ),
        mode: fc.constant('dark' as const),
      }),
      // Light palette pairings
      fc.record({
        text: fc.oneof(
          fc.constant(lightPalette.text.primary),
          fc.constant(lightPalette.text.secondary),
        ),
        surface: fc.oneof(
          fc.constant(lightPalette.background),
          fc.constant(lightPalette.surface),
        ),
        mode: fc.constant('light' as const),
      }),
    );

    it('all text-on-surface token pairings achieve WCAG AA contrast ratio', () => {
      fc.assert(
        fc.property(textOnSurfaceArb, ({ text, surface, mode }) => {
          const passes = validateContrastRatio(text, surface, WCAG_AA_RATIO);
          if (!passes) {
            throw new Error(
              `[${mode}] text ${text} on surface ${surface} fails WCAG AA (≥${WCAG_AA_RATIO}:1)`,
            );
          }
          return true;
        }),
        { numRuns: 100 },
      );
    });
  });
});
