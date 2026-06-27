/**
 * Feature flag definition with its current resolved value.
 */
interface FeatureFlagEntry {
    name: string;
    description: string;
    defaultValue: boolean;
    currentValue: boolean;
}
/**
 * The feature flags API shape exposed by the host via window.__FEATURE_FLAGS_API__.
 */
interface FeatureFlagsAPI {
    getAllFlags: () => FeatureFlagEntry[];
    setFlag: (name: string, value: boolean) => void;
}
declare global {
    interface Window {
        __FEATURE_FLAGS_API__?: FeatureFlagsAPI;
    }
}
/**
 * Floating devtools widget with feature flag toggles.
 *
 * Collapsed state: Small fixed-position button (bottom-right).
 * Expanded state: Panel listing all feature flags with toggles.
 *
 * Consumes the feature flag API from window.__FEATURE_FLAGS_API__
 * which is set by the host-shell FeatureFlagProvider.
 *
 * Can be disabled via VITE_DISABLE_DEVTOOLS environment variable.
 */
export default function DevtoolsWidget(): import("react").JSX.Element | null;
export {};
//# sourceMappingURL=DevtoolsWidget.d.ts.map