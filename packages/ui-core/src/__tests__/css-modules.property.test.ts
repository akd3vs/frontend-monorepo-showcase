import { readFileSync, readdirSync, statSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Helper: Discover and Read CSS Module Files ──────────────────────────────

interface CSSModuleFile {
  name: string;
  path: string;
  content: string;
}

function findCSSModuleFiles(dir: string): CSSModuleFile[] {
  const results: CSSModuleFile[] = [];

  function walk(currentDir: string) {
    const entries = readdirSync(currentDir);
    for (const entry of entries) {
      const fullPath = join(currentDir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (entry.endsWith('.module.css')) {
        results.push({
          name: entry,
          path: fullPath,
          content: readFileSync(fullPath, 'utf-8'),
        });
      }
    }
  }

  walk(dir);
  return results;
}

const COMPONENTS_DIR = resolve(__dirname, '../components');
const cssModuleFiles = findCSSModuleFiles(COMPONENTS_DIR);

// ─── Helper: Extract var() Calls ─────────────────────────────────────────────

interface VarCall {
  full: string;
  propertyName: string;
  fallback: string | null;
  line: number;
  file: string;
}

/**
 * Extracts all var() calls from CSS content, handling nested var() in fallbacks.
 * Supports multi-line var() calls by working on the full content string and mapping
 * positions back to line numbers.
 * Returns the custom property name and fallback (if present).
 */
function extractVarCalls(css: string, fileName: string): VarCall[] {
  const calls: VarCall[] = [];

  // Build a line-number lookup: for any character offset, find the 1-based line number
  const lineBreaks: number[] = [];
  for (let k = 0; k < css.length; k++) {
    if (css[k] === '\n') lineBreaks.push(k);
  }
  function offsetToLine(offset: number): number {
    let lo = 0;
    let hi = lineBreaks.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (lineBreaks[mid]! < offset) lo = mid + 1;
      else hi = mid;
    }
    return lo + 1; // 1-based
  }

  let searchStart = 0;
  while (true) {
    const varStart = css.indexOf('var(', searchStart);
    if (varStart === -1) break;

    // Parse the var() call respecting nested parentheses (supports multi-line)
    let depth = 1;
    let i = varStart + 4; // after 'var('

    while (i < css.length && depth > 0) {
      if (css[i] === '(') depth++;
      else if (css[i] === ')') depth--;
      i++;
    }

    // If depth != 0, we have a malformed var() — skip it
    if (depth !== 0) {
      searchStart = varStart + 4;
      continue;
    }

    const fullCall = css.slice(varStart, i);
    const inner = css.slice(varStart + 4, i - 1); // Content inside var(...)

    // Split by first top-level comma to get property name and fallback
    let commaPos = -1;
    let parenDepth = 0;
    for (let j = 0; j < inner.length; j++) {
      if (inner[j] === '(') parenDepth++;
      else if (inner[j] === ')') parenDepth--;
      else if (inner[j] === ',' && parenDepth === 0) {
        commaPos = j;
        break;
      }
    }

    const propertyName = commaPos === -1 ? inner.trim() : inner.slice(0, commaPos).trim();
    const fallback = commaPos === -1 ? null : inner.slice(commaPos + 1).trim();

    calls.push({
      full: fullCall.replace(/\s+/g, ' '), // normalize whitespace for display
      propertyName,
      fallback: fallback ? fallback.replace(/\s+/g, ' ') : fallback,
      line: offsetToLine(varStart),
      file: fileName,
    });

    searchStart = i;
  }

  return calls;
}

// ─── Helper: Detect Hardcoded Values ─────────────────────────────────────────

/**
 * CSS-inherent values that are acceptable without var() wrapping.
 * These are values that cannot be expressed as design tokens.
 */
const _CSS_INHERENT_VALUES = new Set([
  '0',
  '0px',
  '0%',
  'none',
  'transparent',
  'inherit',
  'initial',
  'unset',
  'revert',
  'currentColor',
  'currentcolor',
  'auto',
  'normal',
]);

/**
 * System color keywords used in forced-colors mode — always acceptable.
 */
const SYSTEM_COLORS = new Set([
  'Canvas',
  'CanvasText',
  'LinkText',
  'VisitedText',
  'ActiveText',
  'ButtonFace',
  'ButtonText',
  'ButtonBorder',
  'Field',
  'FieldText',
  'Highlight',
  'HighlightText',
  'SelectedItem',
  'SelectedItemText',
  'Mark',
  'MarkText',
  'GrayText',
  // Lowercase variants
  'canvas',
  'canvastext',
  'linktext',
  'visitedtext',
  'activetext',
  'buttonface',
  'buttontext',
  'buttonborder',
  'field',
  'fieldtext',
  'highlight',
  'highlighttext',
  'selecteditem',
  'selecteditemtext',
  'mark',
  'marktext',
  'graytext',
]);

/**
 * Acceptable hardcoded pixel values for borders, border-radius, and outlines.
 * These are structural values that are not spacing tokens.
 */
const _ACCEPTABLE_PX_VALUES = new Set(['1px', '2px', '3px', '4px', '5px', '6px', '8px']);

/**
 * CSS properties where percentage values from keyframes are acceptable.
 */
const _KEYFRAME_PERCENTAGE_REGEX = /^\d+%$/;

// Hex color pattern
const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

// RGB/RGBA pattern
const RGB_REGEX = /^rgba?\s*\(/i;

// HSL/HSLA pattern
const HSL_REGEX = /^hsla?\s*\(/i;

interface HardcodedViolation {
  type: 'color' | 'spacing' | 'font-family';
  value: string;
  line: number;
  file: string;
  context: string;
}

/**
 * Checks whether a line is inside a @keyframes block.
 */
function isInsideKeyframes(css: string, lineIndex: number): boolean {
  const lines = css.split('\n');
  let inKeyframes = false;
  let braceDepth = 0;

  for (let i = 0; i <= lineIndex && i < lines.length; i++) {
    const line = lines[i]!;
    if (line.match(/@keyframes\s/)) {
      inKeyframes = true;
    }
    for (const char of line) {
      if (char === '{') braceDepth++;
      else if (char === '}') {
        braceDepth--;
        if (braceDepth === 0 && inKeyframes) {
          inKeyframes = false;
        }
      }
    }
  }

  return inKeyframes;
}

/**
 * Checks whether a line is inside a forced-colors or prefers-contrast media query.
 */
function isInsideForcedColorsOrHighContrast(css: string, lineIndex: number): boolean {
  const lines = css.split('\n');
  let inForcedColors = false;
  let mediaStartDepth = 0;
  let braceDepth = 0;

  for (let i = 0; i <= lineIndex && i < lines.length; i++) {
    const line = lines[i]!;
    if (line.match(/@media\s*\(\s*forced-colors\s*:\s*active\s*\)/)) {
      inForcedColors = true;
      mediaStartDepth = braceDepth;
    }
    for (const char of line) {
      if (char === '{') braceDepth++;
      else if (char === '}') {
        braceDepth--;
        if (inForcedColors && braceDepth <= mediaStartDepth) {
          inForcedColors = false;
        }
      }
    }
  }

  return inForcedColors;
}

/**
 * Extracts the value part from a CSS declaration line.
 * Returns null if it's not a declaration.
 */
function extractDeclarationValue(line: string): { property: string; value: string } | null {
  const trimmed = line.trim();
  // Skip comments, @rules, selectors, braces
  if (trimmed.startsWith('/*') || trimmed.startsWith('//')) return null;
  if (trimmed.startsWith('@') || trimmed.startsWith('{') || trimmed === '}') return null;
  if (!trimmed.includes(':')) return null;
  // Must look like a CSS declaration (not a selector with pseudo-class)
  // Selectors typically have { or don't have ;
  if (trimmed.includes('{')) return null;

  const colonIdx = trimmed.indexOf(':');
  const property = trimmed.slice(0, colonIdx).trim();
  let value = trimmed.slice(colonIdx + 1).trim();
  // Remove trailing semicolon and !important
  value = value
    .replace(/\s*!important\s*$/, '')
    .replace(/;$/, '')
    .trim();

  // Skip CSS custom property declarations (--foo: value)
  if (property.startsWith('--')) return null;

  return { property, value };
}

/**
 * Checks if a value contains a hardcoded color outside of a var() fallback.
 */
function findHardcodedColors(value: string): string[] {
  const violations: string[] = [];

  // Remove var() calls entirely (including fallbacks) — fallbacks are acceptable
  const withoutVar = removeVarCalls(value);

  // Check for hex colors
  const hexMatches = withoutVar.match(/#([0-9a-fA-F]{3,8})\b/g);
  if (hexMatches) {
    for (const hex of hexMatches) {
      if (HEX_COLOR_REGEX.test(hex)) {
        violations.push(hex);
      }
    }
  }

  // Check for rgb/rgba
  if (RGB_REGEX.test(withoutVar)) {
    const rgbMatches = withoutVar.match(/rgba?\s*\([^)]*\)/gi);
    if (rgbMatches) {
      violations.push(...rgbMatches);
    }
  }

  // Check for hsl/hsla
  if (HSL_REGEX.test(withoutVar)) {
    const hslMatches = withoutVar.match(/hsla?\s*\([^)]*\)/gi);
    if (hslMatches) {
      violations.push(...hslMatches);
    }
  }

  return violations;
}

/**
 * Removes all var() calls (including their content) from a CSS value string.
 * This is used to check what remains outside var() references.
 */
function removeVarCalls(value: string): string {
  let result = '';
  let i = 0;

  while (i < value.length) {
    if (value.slice(i, i + 4) === 'var(') {
      // Skip the entire var() call
      let depth = 1;
      i += 4;
      while (i < value.length && depth > 0) {
        if (value[i] === '(') depth++;
        else if (value[i] === ')') depth--;
        i++;
      }
    } else {
      result += value[i];
      i++;
    }
  }

  return result;
}

// ─── Property 4: CSS Variable Fallback Completeness ──────────────────────────
// Feature: ui-professional-refinement, Property 4: CSS Variable Fallback Completeness
// **Validates: Requirements 4.8, 5.5, 1.6**

describe('Property 4: CSS Variable Fallback Completeness', () => {
  it('discovers component CSS module files', () => {
    expect(cssModuleFiles.length).toBeGreaterThan(0);
  });

  it('every var() call in component CSS modules includes a fallback value', () => {
    const allVarCalls: VarCall[] = [];

    for (const file of cssModuleFiles) {
      const calls = extractVarCalls(file.content, file.name);
      allVarCalls.push(...calls);
    }

    expect(allVarCalls.length).toBeGreaterThan(0);

    const violations: string[] = [];
    for (const call of allVarCalls) {
      if (call.fallback === null || call.fallback === '') {
        violations.push(`${call.file}:${call.line} — ${call.full} is missing a fallback value`);
      }
    }

    expect(
      violations,
      `Found var() calls without fallback values:\n${violations.join('\n')}`,
    ).toHaveLength(0);
  });

  it('property-based: randomly selected CSS files and var() calls all have fallbacks', () => {
    // Build a flat list of all var() calls across all files for sampling
    const allVarCalls: VarCall[] = [];
    for (const file of cssModuleFiles) {
      allVarCalls.push(...extractVarCalls(file.content, file.name));
    }

    // Precondition: we have var() calls to test
    expect(allVarCalls.length).toBeGreaterThan(0);

    // Use fast-check to randomly sample var() calls and verify property
    const varCallArb = fc.integer({ min: 0, max: allVarCalls.length - 1 });

    fc.assert(
      fc.property(varCallArb, (index) => {
        const call = allVarCalls[index]!;
        // Every var() call must have a non-empty fallback
        return call.fallback !== null && call.fallback.length > 0;
      }),
      { numRuns: Math.min(100, allVarCalls.length) },
    );
  });

  it('property-based: randomly selected CSS module files contain only var() calls with fallbacks', () => {
    // Ensure no file is skipped by randomly sampling files
    const fileArb = fc.integer({ min: 0, max: cssModuleFiles.length - 1 });

    fc.assert(
      fc.property(fileArb, (fileIdx) => {
        const file = cssModuleFiles[fileIdx]!;
        const calls = extractVarCalls(file.content, file.name);
        // All var() calls in this file must have fallbacks
        return calls.every((call) => call.fallback !== null && call.fallback.length > 0);
      }),
      { numRuns: 100 },
    );
  });
});

// ─── Property 5: CSS Modules Reference Only Token Custom Properties ──────────
// Feature: ui-professional-refinement, Property 5: CSS Modules Reference Only Token Custom Properties
// **Validates: Requirements 5.2, 4.1, 4.2, 4.3, 4.4, 4.5, 11.5**

describe('Property 5: CSS Modules Reference Only Token Custom Properties', () => {
  /**
   * CSS properties that typically hold color values.
   */
  const COLOR_PROPERTIES = new Set([
    'color',
    'background-color',
    'background',
    'border-color',
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color',
    'outline-color',
    'fill',
    'stroke',
    'text-decoration-color',
    'box-shadow',
    'border',
  ]);

  it('discovers component CSS module files', () => {
    expect(cssModuleFiles.length).toBeGreaterThan(0);
  });

  it('no hardcoded color literals appear outside var() calls (except in forced-colors/keyframes)', () => {
    const violations: HardcodedViolation[] = [];

    for (const file of cssModuleFiles) {
      const lines = file.content.split('\n');

      for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const line = lines[lineIdx]!;

        // Skip if inside @keyframes
        if (isInsideKeyframes(file.content, lineIdx)) continue;

        // Skip if inside forced-colors media query (system colors are acceptable there)
        if (isInsideForcedColorsOrHighContrast(file.content, lineIdx)) continue;

        const decl = extractDeclarationValue(line);
        if (!decl) continue;

        // Skip content property (strings are fine)
        if (decl.property === 'content') continue;

        const hardcodedColors = findHardcodedColors(decl.value);
        for (const color of hardcodedColors) {
          // Check if it's a system color keyword
          if (SYSTEM_COLORS.has(color)) continue;

          violations.push({
            type: 'color',
            value: color,
            line: lineIdx + 1,
            file: file.name,
            context: line.trim(),
          });
        }
      }
    }

    expect(
      violations,
      `Found hardcoded color literals outside var() calls:\n${violations
        .map((v) => `  ${v.file}:${v.line} — "${v.value}" in "${v.context}"`)
        .join('\n')}`,
    ).toHaveLength(0);
  });

  it('property-based: randomly selected CSS lines do not contain hardcoded colors outside var()', () => {
    // Collect all non-keyframe, non-forced-colors declaration lines
    interface CSSLine {
      file: string;
      lineIdx: number;
      line: string;
      content: string;
    }

    const declarationLines: CSSLine[] = [];

    for (const file of cssModuleFiles) {
      const lines = file.content.split('\n');
      for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const line = lines[lineIdx]!;
        if (isInsideKeyframes(file.content, lineIdx)) continue;
        if (isInsideForcedColorsOrHighContrast(file.content, lineIdx)) continue;

        const decl = extractDeclarationValue(line);
        if (!decl) continue;
        if (decl.property === 'content') continue;

        declarationLines.push({
          file: file.name,
          lineIdx,
          line: line.trim(),
          content: file.content,
        });
      }
    }

    expect(declarationLines.length).toBeGreaterThan(0);

    const lineArb = fc.integer({ min: 0, max: declarationLines.length - 1 });

    fc.assert(
      fc.property(lineArb, (index) => {
        const declLine = declarationLines[index]!;
        const decl = extractDeclarationValue(declLine.line);
        if (!decl) return true; // Should not happen due to filtering above

        const hardcodedColors = findHardcodedColors(decl.value);
        const nonSystemColors = hardcodedColors.filter((c) => !SYSTEM_COLORS.has(c));
        return nonSystemColors.length === 0;
      }),
      { numRuns: 100 },
    );
  });

  it('no hardcoded font-family names outside var() calls (except as generic fallbacks)', () => {
    // Generic font families are acceptable standalone
    const GENERIC_FONTS = new Set([
      'serif',
      'sans-serif',
      'monospace',
      'cursive',
      'fantasy',
      'system-ui',
      'ui-serif',
      'ui-sans-serif',
      'ui-monospace',
      'ui-rounded',
      'emoji',
      'math',
      'fangsong',
    ]);

    const violations: string[] = [];

    for (const file of cssModuleFiles) {
      const lines = file.content.split('\n');

      for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const line = lines[lineIdx]!;
        if (isInsideForcedColorsOrHighContrast(file.content, lineIdx)) continue;

        const decl = extractDeclarationValue(line);
        if (!decl) continue;

        // Only check font-family property
        if (decl.property !== 'font-family') continue;

        // Remove var() calls (fallbacks inside var() are fine)
        const withoutVar = removeVarCalls(decl.value);
        if (withoutVar.trim() === '' || withoutVar.trim() === ',') continue;

        // Remaining font names after removing var() should only be generic families
        const remainingFonts = withoutVar
          .split(',')
          .map((f) => f.trim().replace(/['"]/g, ''))
          .filter((f) => f.length > 0);

        for (const font of remainingFonts) {
          if (!GENERIC_FONTS.has(font)) {
            violations.push(
              `${file.name}:${lineIdx + 1} — hardcoded font-family "${font}" outside var() fallback`,
            );
          }
        }
      }
    }

    // NOTE: font-family in var() fallbacks like var(--font-family-sans, 'Inter', sans-serif)
    // is acceptable. We're only checking fonts that appear completely outside var().
    expect(
      violations,
      `Found hardcoded font-family names outside var() calls:\n${violations.join('\n')}`,
    ).toHaveLength(0);
  });

  it('property-based: randomly selected CSS files use var() for color properties', () => {
    // For each file, check that color-related properties reference var()
    const fileArb = fc.integer({ min: 0, max: cssModuleFiles.length - 1 });

    fc.assert(
      fc.property(fileArb, (fileIdx) => {
        const file = cssModuleFiles[fileIdx]!;
        const lines = file.content.split('\n');

        for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
          const line = lines[lineIdx]!;
          if (isInsideKeyframes(file.content, lineIdx)) continue;
          if (isInsideForcedColorsOrHighContrast(file.content, lineIdx)) continue;

          const decl = extractDeclarationValue(line);
          if (!decl) continue;
          if (decl.property === 'content') continue;

          // For color-related properties, check there are no hardcoded colors outside var()
          if (COLOR_PROPERTIES.has(decl.property)) {
            const hardcoded = findHardcodedColors(decl.value);
            const nonSystem = hardcoded.filter((c) => !SYSTEM_COLORS.has(c));
            if (nonSystem.length > 0) return false;
          }
        }

        return true;
      }),
      { numRuns: 100 },
    );
  });
});
