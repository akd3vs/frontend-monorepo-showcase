import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Helper: Read ThemeProvider CSS Module ───────────────────────────────────

function readThemeProviderCSS(): string {
  return readFileSync(
    resolve(__dirname, '../providers/ThemeProvider.module.css'),
    'utf-8'
  );
}

/**
 * Splits a CSS value string by top-level commas, respecting parentheses nesting.
 * This handles `var(--x, fallback)` and `cubic-bezier(0.4, 0, 0.2, 1)` correctly.
 */
function splitByTopLevelCommas(value: string): string[] {
  const parts: string[] = [];
  let current = '';
  let depth = 0;

  for (const char of value) {
    if (char === '(') {
      depth++;
      current += char;
    } else if (char === ')') {
      depth--;
      current += char;
    } else if (char === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    parts.push(current.trim());
  }

  return parts;
}

/**
 * Parses the `transition` shorthand declaration(s) from CSS and extracts
 * the property names being transitioned.
 *
 * Transition shorthand format per item:
 *   <property> <duration> [<timing-function>] [<delay>]
 *
 * Multiple transitions are comma-separated (but commas inside var()/cubic-bezier()
 * are ignored). The property name is always the first token in each segment.
 */
function extractTransitionProperties(css: string): string[] {
  // Match the full transition declaration value(s) — use dotAll to handle multiline
  const transitionRegex = /transition\s*:\s*([^;]+);/gs;
  const properties: string[] = [];

  let match: RegExpExecArray | null;
  while ((match = transitionRegex.exec(css)) !== null) {
    const value = match[1]!;
    // Split by top-level commas (respecting parentheses)
    const items = splitByTopLevelCommas(value);
    for (const item of items) {
      // Normalize whitespace (collapse newlines and multiple spaces)
      const normalized = item.replace(/\s+/g, ' ').trim();
      // The first token is the property name
      const firstToken = normalized.split(' ')[0];
      if (firstToken) {
        properties.push(firstToken);
      }
    }
  }

  return properties;
}

// ─── Property 6: Theme Transition Targets Only Color Properties ──────────────
// Feature: ui-professional-refinement, Property 6: Theme Transition Targets Only Color Properties
// **Validates: Requirements 9.4**

describe('Property 6: Theme Transition Targets Only Color Properties', () => {
  const ALLOWED_TRANSITION_PROPERTIES = new Set([
    'color',
    'background-color',
    'border-color',
    'fill',
    'box-shadow',
  ]);

  // Disallowed properties that might be incorrectly added
  const DISALLOWED_PROPERTIES = [
    'width',
    'height',
    'margin',
    'padding',
    'top',
    'left',
    'right',
    'bottom',
    'transform',
    'opacity',
    'font-size',
    'line-height',
    'letter-spacing',
    'max-width',
    'max-height',
    'min-width',
    'min-height',
    'flex',
    'gap',
    'border-width',
    'border-radius',
    'all',
  ];

  it('ThemeProvider transition declarations only target allowed color-related properties', () => {
    const css = readThemeProviderCSS();
    const transitionProperties = extractTransitionProperties(css);

    expect(transitionProperties.length).toBeGreaterThan(0);

    for (const prop of transitionProperties) {
      expect(
        ALLOWED_TRANSITION_PROPERTIES.has(prop),
        `Transition targets "${prop}" which is not in the allowed set: ${[...ALLOWED_TRANSITION_PROPERTIES].join(', ')}`
      ).toBe(true);
    }
  });

  it('no disallowed layout/dimension/transform properties appear in transitions', () => {
    const css = readThemeProviderCSS();
    const transitionProperties = extractTransitionProperties(css);

    for (const prop of transitionProperties) {
      expect(
        !DISALLOWED_PROPERTIES.includes(prop),
        `Transition should not target layout/dimension/transform property "${prop}"`
      ).toBe(true);
    }
  });

  it('property-based: arbitrary CSS property names outside the allowed set are not present in transitions', () => {
    const css = readThemeProviderCSS();
    const transitionProperties = new Set(extractTransitionProperties(css));

    // Generate arbitrary CSS-like property names and verify none of them
    // (if they are not in the allowed set) appear in the transition declarations
    const arbitraryCssProperty = fc.oneof(
      // Common layout/dimension properties
      fc.constantFrom(
        'width', 'height', 'margin', 'padding', 'top', 'left', 'right', 'bottom',
        'transform', 'opacity', 'font-size', 'line-height', 'letter-spacing',
        'max-width', 'max-height', 'min-width', 'min-height', 'flex', 'gap',
        'border-width', 'border-radius', 'all', 'visibility', 'display',
        'overflow', 'z-index', 'position', 'text-decoration', 'outline',
        'outline-offset', 'word-spacing', 'text-indent', 'clip-path',
        'filter', 'backdrop-filter', 'perspective', 'grid-template-columns',
        'grid-template-rows', 'order', 'flex-grow', 'flex-shrink',
        'animation', 'rotate', 'scale', 'translate'
      ),
      // Generate random hyphenated names that look like CSS properties
      fc.array(
        fc.string({ minLength: 2, maxLength: 8, unit: fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')) }),
        { minLength: 1, maxLength: 3 }
      ).map((parts) => parts.join('-'))
    );

    fc.assert(
      fc.property(arbitraryCssProperty, (prop) => {
        // If the property is in the allowed set, it's fine to appear
        if (ALLOWED_TRANSITION_PROPERTIES.has(prop)) {
          return true;
        }
        // Otherwise it must NOT be in the transition properties
        return !transitionProperties.has(prop);
      }),
      { numRuns: 100 }
    );
  });

  it('all allowed transition properties are actually used (completeness check)', () => {
    const css = readThemeProviderCSS();
    const transitionProperties = new Set(extractTransitionProperties(css));

    for (const allowed of ALLOWED_TRANSITION_PROPERTIES) {
      expect(
        transitionProperties.has(allowed),
        `Expected allowed property "${allowed}" to be present in the theme transition declaration`
      ).toBe(true);
    }
  });
});
