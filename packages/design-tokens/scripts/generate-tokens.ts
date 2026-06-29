/**
 * OKLCH Color Token Generator
 *
 * Generates color scales using OKLCH color space with proper gamut mapping
 * to sRGB hex values. Outputs both hex values and OKLCH source coordinates.
 *
 * Pipeline: OKLCH → OKLab → Linear sRGB → sRGB (gamma-corrected) → Hex
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

// ─── Types ───────────────────────────────────────────────────────────────────

interface OklchConfig {
  hue: number; // 0–360
  chroma: number; // 0–0.4 typical
  lightnessRange: [number, number]; // [shade50Lightness, shade900Lightness]
}

interface GeneratedShade {
  shade: number; // 50, 100, 200, ..., 900
  hex: string; // sRGB hex fallback
  oklch: { l: number; c: number; h: number }; // Source coordinates
}

// ─── Color Conversion ────────────────────────────────────────────────────────

/**
 * Convert OKLCH to OKLab color space.
 * a = c * cos(h), b = c * sin(h)
 */
function oklchToOklab(l: number, c: number, h: number): [number, number, number] {
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);
  return [l, a, b];
}

/**
 * Convert OKLab to linear sRGB.
 * Uses the OKLab → LMS (via M1 inverse) → Linear sRGB (via M2 inverse) pipeline.
 */
function oklabToLinearSrgb(L: number, a: number, b: number): [number, number, number] {
  // OKLab to LMS (cube root space)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  // Undo cube root
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  // LMS to linear sRGB
  const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bOut = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  return [r, g, bOut];
}

/**
 * Apply sRGB gamma encoding to a linear value.
 */
function linearToSrgbGamma(linear: number): number {
  if (linear <= 0.0031308) {
    return 12.92 * linear;
  }
  return 1.055 * Math.pow(linear, 1 / 2.4) - 0.055;
}

/**
 * Convert a single sRGB channel (0–1) to a 2-digit hex string.
 */
function channelToHex(value: number): string {
  const clamped = Math.max(0, Math.min(1, value));
  const byte = Math.round(clamped * 255);
  return byte.toString(16).padStart(2, '0');
}

/**
 * Convert OKLCH coordinates to an sRGB hex color string.
 * Applies gamut mapping by clamping out-of-gamut linear sRGB channels to [0, 1].
 */
export function oklchToSrgbHex(l: number, c: number, h: number): string {
  const [labL, labA, labB] = oklchToOklab(l, c, h);
  const [linR, linG, linB] = oklabToLinearSrgb(labL, labA, labB);

  // Gamut mapping: clamp linear sRGB channels to [0, 1]
  const clampedR = Math.max(0, Math.min(1, linR));
  const clampedG = Math.max(0, Math.min(1, linG));
  const clampedB = Math.max(0, Math.min(1, linB));

  // Apply gamma encoding
  const sR = linearToSrgbGamma(clampedR);
  const sG = linearToSrgbGamma(clampedG);
  const sB = linearToSrgbGamma(clampedB);

  return `#${channelToHex(sR)}${channelToHex(sG)}${channelToHex(sB)}`;
}

// ─── Contrast Ratio ──────────────────────────────────────────────────────────

/**
 * Parse a hex color string to sRGB channels (0–1).
 */
function hexToSrgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return [r, g, b];
}

/**
 * Convert an sRGB channel value to its linearized form for luminance calculation.
 */
function srgbToLinearChannel(c: number): number {
  if (c <= 0.04045) {
    return c / 12.92;
  }
  return Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * Compute relative luminance per WCAG 2.1.
 * L = 0.2126 * R + 0.7152 * G + 0.0722 * B (linearized channels)
 */
function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToSrgb(hex);
  const linR = srgbToLinearChannel(r);
  const linG = srgbToLinearChannel(g);
  const linB = srgbToLinearChannel(b);
  return 0.2126 * linR + 0.7152 * linG + 0.0722 * linB;
}

/**
 * Validate that the contrast ratio between foreground and background
 * meets the specified minimum ratio (WCAG AA = 4.5, WCAG AAA = 7.0).
 */
export function validateContrastRatio(fg: string, bg: string, minRatio: number): boolean {
  const lumFg = relativeLuminance(fg);
  const lumBg = relativeLuminance(bg);
  const lighter = Math.max(lumFg, lumBg);
  const darker = Math.min(lumFg, lumBg);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  return ratio >= minRatio;
}

// ─── Color Scale Generation ──────────────────────────────────────────────────

const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

/**
 * Generate a complete color scale from an OKLCH configuration.
 * Lightness varies uniformly from lightnessRange[0] (shade 50) to lightnessRange[1] (shade 900).
 */
export function generateColorScale(config: OklchConfig): GeneratedShade[] {
  const { hue, chroma, lightnessRange } = config;
  const [lightStart, lightEnd] = lightnessRange;
  const steps = SHADES.length - 1; // 9 intervals for 10 shades

  return SHADES.map((shade, index) => {
    const t = index / steps;
    const l = lightStart + t * (lightEnd - lightStart);

    // Round to 4 decimal places for clean output
    const roundedL = Math.round(l * 10000) / 10000;

    const hex = oklchToSrgbHex(roundedL, chroma, hue);

    return {
      shade,
      hex,
      oklch: { l: roundedL, c: chroma, h: hue },
    };
  });
}

// ─── File Generation ─────────────────────────────────────────────────────────

/**
 * Import config and generate the colors.ts file.
 */
async function main(): Promise<void> {
  // Import the config dynamically
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const configPath = resolve(__dirname, '../src/config.ts');

  // Use dynamic import for the config
  const { colorScaleConfigs } = await import(pathToFileURL(configPath).href);

  const scaleNames = Object.keys(colorScaleConfigs) as string[];
  const generatedScales: Record<string, GeneratedShade[]> = {};

  for (const name of scaleNames) {
    generatedScales[name] = generateColorScale(colorScaleConfigs[name]);
  }

  // Generate the TypeScript source
  const lines: string[] = [];
  lines.push(`/**`);
  lines.push(` * Auto-generated color tokens from OKLCH color space.`);
  lines.push(` * DO NOT EDIT MANUALLY — run \`pnpm generate-tokens\` to regenerate.`);
  lines.push(` */`);
  lines.push(``);
  lines.push(`import type { ColorScale, ColorTokens } from './types';`);
  lines.push(``);

  // Generate each color scale
  for (const name of scaleNames) {
    const shades = generatedScales[name];
    if (!shades) continue;
    lines.push(`/** Generated ${name} color scale (OKLCH source) */`);
    lines.push(`const ${name}: ColorScale = {`);
    for (const shade of shades) {
      const { l, c, h } = shade.oklch;
      lines.push(
        `  ${shade.shade}: { hex: '${shade.hex}', oklch: { l: ${l}, c: ${c}, h: ${h} } },`,
      );
    }
    lines.push(`};`);
    lines.push(``);
  }

  // Generate the combined token export
  lines.push(`/** Complete color tokens including semantic colors */`);
  lines.push(`export const colorTokens: ColorTokens = {`);
  for (const name of scaleNames) {
    lines.push(`  ${name},`);
  }
  lines.push(`  background: '#ffffff',`);
  lines.push(`  surface: '#f9fafb',`);
  lines.push(`  text: {`);
  lines.push(`    primary: '#111827',`);
  lines.push(`    secondary: '#4b5563',`);
  lines.push(`    disabled: '#9ca3af',`);
  lines.push(`    inverse: '#ffffff',`);
  lines.push(`  },`);
  lines.push(`};`);
  lines.push(``);

  // Export individual scales
  lines.push(`export { ${scaleNames.join(', ')} };`);
  lines.push(``);

  const outputPath = resolve(__dirname, '../src/colors.ts');
  writeFileSync(outputPath, lines.join('\n'), 'utf-8');

  console.log(`✓ Generated color tokens at ${outputPath}`);
  console.log(`  Scales: ${scaleNames.join(', ')}`);
  console.log(`  Shades per scale: ${SHADES.length}`);

  // Print contrast validation for key combinations
  console.log(`\n  Contrast validation (text on background):`);
  for (const name of scaleNames) {
    const shades = generatedScales[name];
    if (!shades) continue;
    const shade700 = shades.find((s) => s.shade === 700);
    if (shade700) {
      const passesAA = validateContrastRatio(shade700.hex, '#ffffff', 4.5);
      console.log(`    ${name}-700 (${shade700.hex}) on white: ${passesAA ? 'PASS' : 'FAIL'} AA`);
    }
  }
}

main().catch((err) => {
  console.error('Error generating tokens:', err);
  process.exit(1);
});
