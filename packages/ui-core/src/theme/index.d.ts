/**
 * UI_Core Theme Tokens
 *
 * Re-exports TypeScript token objects from @frontend-monorepo-showcase/design-tokens
 * for backward compatibility. Consumers can import directly from design-tokens
 * or continue using this module.
 */
import { spacing as spacingTokens } from '@frontend-monorepo-showcase/design-tokens/spacing';
export { colorTokens, primary, secondary, success, warning, error, neutral, } from '@frontend-monorepo-showcase/design-tokens/colors';
export { spacing, spacingPx } from '@frontend-monorepo-showcase/design-tokens/spacing';
export { fontFamilies, fontSizes, fontWeights, lineHeights } from '@frontend-monorepo-showcase/design-tokens/typography';
export { motionDurations, motionEasings } from '@frontend-monorepo-showcase/design-tokens/motion';
export { elevation, elevationDark } from '@frontend-monorepo-showcase/design-tokens/elevation';
export { breakpoints } from '@frontend-monorepo-showcase/design-tokens/breakpoints';
export declare const colors: {
    readonly primary: {
        readonly 50: "#eff6ff";
        readonly 100: "#dbeafe";
        readonly 200: "#bfdbfe";
        readonly 300: "#93c5fd";
        readonly 400: "#60a5fa";
        readonly 500: "#3b82f6";
        readonly 600: "#2563eb";
        readonly 700: "#1d4ed8";
        readonly 800: "#1e40af";
        readonly 900: "#1e3a8a";
    };
    readonly secondary: {
        readonly 50: "#f5f3ff";
        readonly 100: "#ede9fe";
        readonly 200: "#ddd6fe";
        readonly 300: "#c4b5fd";
        readonly 400: "#a78bfa";
        readonly 500: "#8b5cf6";
        readonly 600: "#7c3aed";
        readonly 700: "#6d28d9";
        readonly 800: "#5b21b6";
        readonly 900: "#4c1d95";
    };
    readonly success: {
        readonly 50: "#f0fdf4";
        readonly 100: "#dcfce7";
        readonly 200: "#bbf7d0";
        readonly 300: "#86efac";
        readonly 400: "#4ade80";
        readonly 500: "#22c55e";
        readonly 600: "#16a34a";
        readonly 700: "#15803d";
        readonly 800: "#166534";
        readonly 900: "#14532d";
    };
    readonly warning: {
        readonly 50: "#fffbeb";
        readonly 100: "#fef3c7";
        readonly 200: "#fde68a";
        readonly 300: "#fcd34d";
        readonly 400: "#fbbf24";
        readonly 500: "#f59e0b";
        readonly 600: "#d97706";
        readonly 700: "#b45309";
        readonly 800: "#92400e";
        readonly 900: "#78350f";
    };
    readonly error: {
        readonly 50: "#fef2f2";
        readonly 100: "#fee2e2";
        readonly 200: "#fecaca";
        readonly 300: "#fca5a5";
        readonly 400: "#f87171";
        readonly 500: "#ef4444";
        readonly 600: "#dc2626";
        readonly 700: "#b91c1c";
        readonly 800: "#991b1b";
        readonly 900: "#7f1d1d";
    };
    readonly neutral: {
        readonly 50: "#fafafa";
        readonly 100: "#f5f5f5";
        readonly 200: "#e5e5e5";
        readonly 300: "#d4d4d4";
        readonly 400: "#a3a3a3";
        readonly 500: "#737373";
        readonly 600: "#525252";
        readonly 700: "#404040";
        readonly 800: "#262626";
        readonly 900: "#171717";
    };
    readonly background: "#ffffff";
    readonly surface: "#f9fafb";
    readonly text: {
        readonly primary: "#111827";
        readonly secondary: "#4b5563";
        readonly disabled: "#9ca3af";
        readonly inverse: "#ffffff";
    };
};
export declare const typography: {
    readonly fontFamilies: {
        readonly sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        readonly mono: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace";
    };
    readonly fontSizes: {
        readonly xs: "0.75rem";
        readonly sm: "0.875rem";
        readonly base: "1rem";
        readonly lg: "1.125rem";
        readonly xl: "1.25rem";
        readonly '2xl': "1.5rem";
        readonly '3xl': "1.875rem";
        readonly '4xl': "2.25rem";
    };
    readonly fontWeights: {
        readonly normal: 400;
        readonly medium: 500;
        readonly semibold: 600;
        readonly bold: 700;
    };
    readonly lineHeights: {
        readonly tight: 1.25;
        readonly normal: 1.5;
        readonly relaxed: 1.75;
    };
};
export type Colors = typeof colors;
export type Spacing = typeof spacingTokens;
export type Typography = typeof typography;
export declare const theme: {
    readonly colors: {
        readonly primary: {
            readonly 50: "#eff6ff";
            readonly 100: "#dbeafe";
            readonly 200: "#bfdbfe";
            readonly 300: "#93c5fd";
            readonly 400: "#60a5fa";
            readonly 500: "#3b82f6";
            readonly 600: "#2563eb";
            readonly 700: "#1d4ed8";
            readonly 800: "#1e40af";
            readonly 900: "#1e3a8a";
        };
        readonly secondary: {
            readonly 50: "#f5f3ff";
            readonly 100: "#ede9fe";
            readonly 200: "#ddd6fe";
            readonly 300: "#c4b5fd";
            readonly 400: "#a78bfa";
            readonly 500: "#8b5cf6";
            readonly 600: "#7c3aed";
            readonly 700: "#6d28d9";
            readonly 800: "#5b21b6";
            readonly 900: "#4c1d95";
        };
        readonly success: {
            readonly 50: "#f0fdf4";
            readonly 100: "#dcfce7";
            readonly 200: "#bbf7d0";
            readonly 300: "#86efac";
            readonly 400: "#4ade80";
            readonly 500: "#22c55e";
            readonly 600: "#16a34a";
            readonly 700: "#15803d";
            readonly 800: "#166534";
            readonly 900: "#14532d";
        };
        readonly warning: {
            readonly 50: "#fffbeb";
            readonly 100: "#fef3c7";
            readonly 200: "#fde68a";
            readonly 300: "#fcd34d";
            readonly 400: "#fbbf24";
            readonly 500: "#f59e0b";
            readonly 600: "#d97706";
            readonly 700: "#b45309";
            readonly 800: "#92400e";
            readonly 900: "#78350f";
        };
        readonly error: {
            readonly 50: "#fef2f2";
            readonly 100: "#fee2e2";
            readonly 200: "#fecaca";
            readonly 300: "#fca5a5";
            readonly 400: "#f87171";
            readonly 500: "#ef4444";
            readonly 600: "#dc2626";
            readonly 700: "#b91c1c";
            readonly 800: "#991b1b";
            readonly 900: "#7f1d1d";
        };
        readonly neutral: {
            readonly 50: "#fafafa";
            readonly 100: "#f5f5f5";
            readonly 200: "#e5e5e5";
            readonly 300: "#d4d4d4";
            readonly 400: "#a3a3a3";
            readonly 500: "#737373";
            readonly 600: "#525252";
            readonly 700: "#404040";
            readonly 800: "#262626";
            readonly 900: "#171717";
        };
        readonly background: "#ffffff";
        readonly surface: "#f9fafb";
        readonly text: {
            readonly primary: "#111827";
            readonly secondary: "#4b5563";
            readonly disabled: "#9ca3af";
            readonly inverse: "#ffffff";
        };
    };
    readonly spacing: {
        readonly xs: "4px";
        readonly sm: "8px";
        readonly md: "12px";
        readonly lg: "16px";
        readonly xl: "24px";
        readonly '2xl': "32px";
        readonly '3xl': "48px";
        readonly '4xl': "64px";
    };
    readonly typography: {
        readonly fontFamilies: {
            readonly sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
            readonly mono: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace";
        };
        readonly fontSizes: {
            readonly xs: "0.75rem";
            readonly sm: "0.875rem";
            readonly base: "1rem";
            readonly lg: "1.125rem";
            readonly xl: "1.25rem";
            readonly '2xl': "1.5rem";
            readonly '3xl': "1.875rem";
            readonly '4xl': "2.25rem";
        };
        readonly fontWeights: {
            readonly normal: 400;
            readonly medium: 500;
            readonly semibold: 600;
            readonly bold: 700;
        };
        readonly lineHeights: {
            readonly tight: 1.25;
            readonly normal: 1.5;
            readonly relaxed: 1.75;
        };
    };
};
export type Theme = typeof theme;
//# sourceMappingURL=index.d.ts.map