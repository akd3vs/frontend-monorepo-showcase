/** OKLCH color metadata for each shade */
export interface OklchMeta {
  l: number; // Lightness 0–1
  c: number; // Chroma 0–0.4
  h: number; // Hue 0–360
}

/** A single color shade with hex value and OKLCH source */
export interface ColorShade {
  hex: string;
  oklch: OklchMeta;
}

/** A complete color scale (50–900) */
export type ColorScale = Record<
  50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900,
  ColorShade
>;

/** Full color token set */
export interface ColorTokens {
  primary: ColorScale;
  secondary: ColorScale;
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
  neutral: ColorScale;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    inverse: string;
  };
}

/** Motion duration tokens */
export interface MotionDurations {
  instant: string;
  fast: string;
  normal: string;
  slow: string;
  slower: string;
}

/** Motion easing tokens */
export interface MotionEasings {
  easeIn: string;
  easeOut: string;
  easeInOut: string;
  spring: string;
}

/** Elevation tokens */
export interface ElevationTokens {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
}

/** Breakpoint tokens (numeric px values) */
export interface BreakpointTokens {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}
