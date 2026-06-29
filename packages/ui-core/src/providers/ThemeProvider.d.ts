export interface ThemeProviderProps {
    children: React.ReactNode;
    /**
     * Whether dark mode is active.
     * Typically driven by a feature flag: useFeatureFlag('dark-mode')
     */
    isDarkMode: boolean;
    /**
     * When true and no explicit preference exists, detects system preference
     * via prefers-color-scheme media query. Defaults to true.
     */
    respectSystemPreference?: boolean;
}
export declare function ThemeProvider({ children, isDarkMode, respectSystemPreference, }: ThemeProviderProps): React.ReactElement;
//# sourceMappingURL=ThemeProvider.d.ts.map