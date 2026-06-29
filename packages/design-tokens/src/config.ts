/** OKLCH generation configuration per color scale */
export interface OklchConfig {
  hue: number; // 0–360
  chroma: number; // 0–0.4 typical
  lightnessRange: [number, number]; // [shade50Lightness, shade900Lightness]
}

/** OKLCH generation config for each color scale */
export const colorScaleConfigs: Record<string, OklchConfig> = {
  primary: { hue: 225, chroma: 0.18, lightnessRange: [0.97, 0.3] },
  secondary: { hue: 270, chroma: 0.17, lightnessRange: [0.97, 0.28] },
  success: { hue: 145, chroma: 0.16, lightnessRange: [0.97, 0.3] },
  warning: { hue: 45, chroma: 0.18, lightnessRange: [0.97, 0.35] },
  error: { hue: 25, chroma: 0.19, lightnessRange: [0.97, 0.3] },
  neutral: { hue: 0, chroma: 0.0, lightnessRange: [0.98, 0.15] },
};
