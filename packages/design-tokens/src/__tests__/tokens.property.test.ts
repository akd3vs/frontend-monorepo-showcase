import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';

import { generateColorScale, validateContrastRatio } from '../../scripts/generate-tokens';
import { colorScaleConfigs } from '../config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Helper: Read CSS files ──────────────────────────────────────────────────

function readTokensCSS(): string {
  return readFileSync(resolve(__dirname, '../tokens.css'), 'utf-8');
}

function readDarkCSS(): string {
  return readFileSync(resolve(__dirname, '../dark.css'), 'utf-8');
}

function extractCustomProperties(css: string): string[] {
  const regex = /--[\w-]+/g;
  const matches = css.match(regex);
  return matches ? [...new Set(matches)] : [];
}

// ─── Property 1: Token Naming Convention Compliance ──────────────────────────
// Feature: ui-professional-refinement, Property 1: Token Naming Convention Compliance
// **Validates: Requirements 1.3**

describe('Property 1: Token Naming Convention Compliance', () => {
  const VALID_CATEGORIES = ['color', 'spacing', 'font', 'motion', 'elevation', 'breakpoint'];

  it('all CSS custom property names follow --{category}-{path-segments} convention', () => {
    const css = readTokensCSS();
    const properties = extractCustomProperties(css);

    expect(properties.length).toBeGreaterThan(0);

    for (const prop of properties) {
      // Remove leading --
      const name = prop.slice(2);
      const segments = name.split('-');
      const category = segments[0];

      expect(
        VALID_CATEGORIES.includes(category!),
        `Property "${prop}" does not start with a valid category. Got "${category}", expected one of: ${VALID_CATEGORIES.join(', ')}`
      ).toBe(true);

      // Verify at least one additional segment after category
      expect(
        segments.length >= 2,
        `Property "${prop}" must have at least a category and a name segment`
      ).toBe(true);

      // Verify all segments are non-empty and contain only lowercase alphanumeric chars
      for (const segment of segments) {
        expect(
          /^[a-z0-9]+$/.test(segment!),
          `Property "${prop}" contains invalid segment "${segment}". Segments must be lowercase alphanumeric.`
        ).toBe(true);
      }
    }
  });

  it('property-based: random subsets of properties all follow naming convention', () => {
    const css = readTokensCSS();
    const properties = extractCustomProperties(css);

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: properties.length - 1 }),
        (index) => {
          const prop = properties[index]!;
          const name = prop.slice(2);
          const segments = name.split('-');
          const category = segments[0];

          return (
            VALID_CATEGORIES.includes(category!) &&
            segments.length >= 2 &&
            segments.every((s) => /^[a-z0-9]+$/.test(s!))
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 2: Dark Palette Structural Equivalence ─────────────────────────
// Feature: ui-professional-refinement, Property 2: Dark Palette Structural Equivalence
// **Validates: Requirements 2.1, 2.3**

describe('Property 2: Dark Palette Structural Equivalence', () => {
  it('dark.css variable set is a subset of tokens.css (all dark overrides have a corresponding light definition)', () => {
    const lightCSS = readTokensCSS();
    const darkCSS = readDarkCSS();

    const lightProperties = new Set(extractCustomProperties(lightCSS));
    const darkProperties = extractCustomProperties(darkCSS);

    expect(darkProperties.length).toBeGreaterThan(0);

    for (const prop of darkProperties) {
      expect(
        lightProperties.has(prop),
        `Dark token "${prop}" has no corresponding light definition in tokens.css`
      ).toBe(true);
    }
  });

  it('property-based: random dark properties exist in light palette', () => {
    const lightCSS = readTokensCSS();
    const darkCSS = readDarkCSS();

    const lightProperties = new Set(extractCustomProperties(lightCSS));
    const darkProperties = extractCustomProperties(darkCSS);

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: darkProperties.length - 1 }),
        (index) => {
          const prop = darkProperties[index]!;
          return lightProperties.has(prop);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 7: OKLCH Lightness Uniformity ──────────────────────────────────
// Feature: ui-professional-refinement, Property 7: OKLCH Lightness Uniformity
// **Validates: Requirements 17.1, 17.3**

describe('Property 7: OKLCH Lightness Uniformity', () => {
  const validOklchConfig = fc.record({
    hue: fc.double({ min: 0, max: 360, noNaN: true, noDefaultInfinity: true }),
    chroma: fc.double({ min: 0, max: 0.35, noNaN: true, noDefaultInfinity: true }),
    lightnessRange: fc.tuple(
      fc.double({ min: 0.85, max: 0.99, noNaN: true, noDefaultInfinity: true }), // light end (shade 50)
      fc.double({ min: 0.15, max: 0.40, noNaN: true, noDefaultInfinity: true }) // dark end (shade 900)
    ),
  }) as fc.Arbitrary<{ hue: number; chroma: number; lightnessRange: [number, number] }>;

  it('generates uniform lightness steps within +/-0.02 tolerance for any valid config', () => {
    fc.assert(
      fc.property(validOklchConfig, (config) => {
        const scale = generateColorScale(config);
        const lightnesses = scale.map((s) => s.oklch.l);

        const steps: number[] = [];
        for (let i = 1; i < lightnesses.length; i++) {
          steps.push(Math.abs(lightnesses[i]! - lightnesses[i - 1]!));
        }

        const avgStep = steps.reduce((a, b) => a + b, 0) / steps.length;
        return steps.every((step) => Math.abs(step - avgStep) <= 0.02);
      }),
      { numRuns: 100 }
    );
  });

  it('validates uniform lightness for all configured color scales', () => {
    for (const [name, config] of Object.entries(colorScaleConfigs)) {
      const scale = generateColorScale(config);
      const lightnesses = scale.map((s) => s.oklch.l);

      const steps: number[] = [];
      for (let i = 1; i < lightnesses.length; i++) {
        steps.push(Math.abs(lightnesses[i]! - lightnesses[i - 1]!));
      }

      const avgStep = steps.reduce((a, b) => a + b, 0) / steps.length;
      for (const step of steps) {
        expect(
          Math.abs(step - avgStep),
          `Scale "${name}" has non-uniform lightness step: ${step} vs avg ${avgStep}`
        ).toBeLessThanOrEqual(0.02);
      }
    }
  });
});

// ─── Property 8: Generated Palette WCAG AA Contrast ──────────────────────────
// Feature: ui-professional-refinement, Property 8: Generated Palette WCAG AA Contrast
// **Validates: Requirements 17.4**

describe('Property 8: Generated Palette WCAG AA Contrast', () => {
  it('shade 700 on shade 50 achieves >= 4.5:1 contrast ratio for all configured scales', () => {
    for (const [name, config] of Object.entries(colorScaleConfigs)) {
      const scale = generateColorScale(config);
      const shade50 = scale.find((s) => s.shade === 50);
      const shade700 = scale.find((s) => s.shade === 700);

      expect(shade50).toBeDefined();
      expect(shade700).toBeDefined();

      const passes = validateContrastRatio(shade700!.hex, shade50!.hex, 4.5);
      expect(
        passes,
        `Scale "${name}": shade 700 (${shade700!.hex}) on shade 50 (${shade50!.hex}) fails WCAG AA (< 4.5:1)`
      ).toBe(true);
    }
  });

  it('property-based: generated scales with sufficient lightness range achieve WCAG AA contrast', () => {
    // Constrain chroma to low values and ensure a wide lightness range (shade 50 very light,
    // shade 900 very dark) so shade 700 is guaranteed to be dark enough for 4.5:1 contrast.
    // High chroma + certain hues can cause sRGB gamut clamping that reduces effective contrast.
    const validOklchConfig = fc.record({
      hue: fc.double({ min: 0, max: 360, noNaN: true, noDefaultInfinity: true }),
      chroma: fc.double({ min: 0, max: 0.15, noNaN: true, noDefaultInfinity: true }),
      lightnessRange: fc.tuple(
        fc.double({ min: 0.95, max: 0.99, noNaN: true, noDefaultInfinity: true }), // very light shade 50
        fc.double({ min: 0.15, max: 0.30, noNaN: true, noDefaultInfinity: true }) // sufficiently dark shade 900
      ),
    }) as fc.Arbitrary<{ hue: number; chroma: number; lightnessRange: [number, number] }>;

    fc.assert(
      fc.property(validOklchConfig, (config) => {
        const scale = generateColorScale(config);
        const shade50 = scale.find((s) => s.shade === 50)!;
        const shade700 = scale.find((s) => s.shade === 700)!;

        return validateContrastRatio(shade700.hex, shade50.hex, 4.5);
      }),
      { numRuns: 100 }
    );
  });
});

// ─── Property 9: Token Objects Include OKLCH Metadata ────────────────────────
// Feature: ui-professional-refinement, Property 9: Token Objects Include OKLCH Metadata
// **Validates: Requirements 17.6**

describe('Property 9: Token Objects Include OKLCH Metadata', () => {
  it('each shade has hex + oklch with valid ranges for all configured scales', () => {
    for (const [name, config] of Object.entries(colorScaleConfigs)) {
      const scale = generateColorScale(config);

      for (const shade of scale) {
        // hex is a valid 6-digit hex string
        expect(
          /^#[0-9a-f]{6}$/i.test(shade.hex),
          `Scale "${name}" shade ${shade.shade}: hex "${shade.hex}" is not a valid 6-digit hex`
        ).toBe(true);

        // oklch.l in [0, 1]
        expect(shade.oklch.l).toBeGreaterThanOrEqual(0);
        expect(shade.oklch.l).toBeLessThanOrEqual(1);

        // oklch.c in [0, 0.4]
        expect(shade.oklch.c).toBeGreaterThanOrEqual(0);
        expect(shade.oklch.c).toBeLessThanOrEqual(0.4);

        // oklch.h in [0, 360]
        expect(shade.oklch.h).toBeGreaterThanOrEqual(0);
        expect(shade.oklch.h).toBeLessThanOrEqual(360);
      }
    }
  });

  it('property-based: any generated color scale produces valid OKLCH metadata', () => {
    const validOklchConfig = fc.record({
      hue: fc.double({ min: 0, max: 360, noNaN: true, noDefaultInfinity: true }),
      chroma: fc.double({ min: 0, max: 0.4, noNaN: true, noDefaultInfinity: true }),
      lightnessRange: fc.tuple(
        fc.double({ min: 0.5, max: 1.0, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: 0.0, max: 0.5, noNaN: true, noDefaultInfinity: true })
      ),
    }) as fc.Arbitrary<{ hue: number; chroma: number; lightnessRange: [number, number] }>;

    fc.assert(
      fc.property(validOklchConfig, (config) => {
        const scale = generateColorScale(config);

        return scale.every((shade) => {
          const validHex = /^#[0-9a-f]{6}$/i.test(shade.hex);
          const validL = shade.oklch.l >= 0 && shade.oklch.l <= 1;
          const validC = shade.oklch.c >= 0 && shade.oklch.c <= 0.4;
          const validH = shade.oklch.h >= 0 && shade.oklch.h <= 360;
          return validHex && validL && validC && validH;
        });
      }),
      { numRuns: 100 }
    );
  });
});
