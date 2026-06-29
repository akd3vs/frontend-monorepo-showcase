# Requirements Document

## Introduction

This specification covers the professional refinement of the `ui-core` package's visual layer. The work introduces a dark mode theme governed by the existing feature flag system, migrates components from inline `React.CSSProperties` objects to CSS custom properties, and establishes visual snapshot testing to prevent regressions. The goal is a cohesive, maintainable design system foundation that supports light and dark palettes without runtime style recalculations.

## Glossary

- **UI_Core**: The shared component library package (`@frontend-monorepo-showcase/ui-core`) containing Button, Card, ErrorBoundary, Skeleton, and Table components.
- **Design_Tokens_Package**: The standalone package (`@frontend-monorepo-showcase/design-tokens`) containing all design token definitions, CSS custom property stylesheets, and TypeScript token value exports, independent of any UI framework.
- **Design_Token**: A named value (color, spacing, typography) that captures a single design decision and is expressed as a CSS custom property.
- **CSS_Custom_Property**: A CSS variable declared with the `--` prefix (e.g., `--color-primary-600`) used to propagate design tokens through the component tree.
- **Theme_Provider**: A root-level component or stylesheet that sets CSS custom property values for the active theme (light or dark).
- **Feature_Flag_System**: The host-shell context-based system (`FeatureFlagProvider`, `useFeatureFlag`) that provides runtime boolean toggles persisted to localStorage.
- **Dark_Mode**: An alternative color scheme with reduced luminance backgrounds and adjusted foreground colors, toggled via the `dark-mode` feature flag.
- **Visual_Snapshot_Test**: An automated test that captures a rendered screenshot of a component and compares it pixel-by-pixel against a stored baseline image.
- **Baseline_Image**: A reference screenshot stored in version control representing the expected visual output of a component.
- **Motion_Token**: A named animation value (duration or easing curve) expressed as a CSS custom property governing transition timing.
- **Elevation_Token**: A named shadow/depth value expressed as a CSS custom property, with theme-specific variants for light and dark modes.
- **Breakpoint_Token**: A named viewport width threshold defining responsive layout boundaries, expressed as CSS custom properties and TypeScript constants.
- **Compound_Component**: A React component pattern where a parent component exposes related sub-components that share internal state via React Context.
- **CSS_Layer**: A CSS @layer declaration that explicitly controls cascade priority, eliminating specificity conflicts between token, component, and variant styles.
- **OKLCH**: A perceptually uniform cylindrical color space (Lightness, Chroma, Hue) used for generating color palettes with consistent perceived brightness across shades.
- **Interaction_Test**: A Storybook test using play() functions that simulates user interactions (click, hover, keyboard) and asserts expected behavior changes.
- **Validation_Pipeline**: The ordered sequence of automated quality checks (ESLint, TypeScript compilation, Vitest tests, Storybook build, Nx workspace build) that must all pass for a task to be considered complete.

## Requirements

### Requirement 1: Design Token CSS Custom Properties

**User Story:** As a developer, I want design tokens expressed as CSS custom properties, so that theme values can be changed at runtime without re-rendering React components.

#### Acceptance Criteria

1. THE Design_Tokens_Package SHALL export a CSS file that declares all color, spacing, and typography tokens as CSS_Custom_Properties on the `:root` selector.
2. WHEN the exported CSS file from the Design_Tokens_Package is imported into the application entry point, THE browser SHALL have CSS_Custom_Properties available for every value in the `colors`, `spacing`, and `typography` token sets, totaling no fewer than the number of leaf values in the existing TypeScript token objects.
3. THE CSS_Custom_Properties SHALL follow a naming convention of `--{category}-{name}` where hierarchical tokens use hyphen-separated path segments: shade tokens as `--color-{group}-{shade}` (e.g., `--color-primary-600`), flat color tokens as `--color-{name}` (e.g., `--color-background`, `--color-text-primary`), spacing tokens as `--spacing-{size}` (e.g., `--spacing-lg`, `--spacing-2xl`), and typography tokens as `--font-{sub-category}-{name}` (e.g., `--font-size-base`, `--font-weight-bold`, `--font-family-sans`, `--font-line-height-normal`).
4. WHEN a CSS_Custom_Property value is overridden on an ancestor element or `:root`, THE UI_Core components referencing that token SHALL reflect the new value without a React re-render or JavaScript execution.
5. THE UI_Core package SHALL continue to export the existing TypeScript token objects for backward compatibility (re-exported from the Design_Tokens_Package).
6. IF the exported CSS file is not imported, THEN THE UI_Core components SHALL fall back to inline default values matching the current TypeScript token values, preventing unstyled content.

### Requirement 2: Dark Mode Color Palette

**User Story:** As a designer, I want a dark mode color palette defined alongside the light palette, so that all components have appropriate contrast in both themes.

#### Acceptance Criteria

1. THE UI_Core package SHALL define a dark color palette that provides alternative values for all token categories present in the light palette: `primary` (shades 50–900), `secondary` (shades 50–900), `success` (shades 50–900), `warning` (shades 50–900), `error` (shades 50–900), `neutral` (shades 50–900), `background`, `surface`, `text.primary`, `text.secondary`, `text.disabled`, and `text.inverse`.
2. THE dark color palette SHALL maintain a minimum contrast ratio of 4.5:1 between each text color (`text.primary`, `text.secondary`, `text.disabled`) and each surface it may appear on (`background`, `surface`), and a minimum contrast ratio of 3:1 for UI component boundaries against their adjacent colors.
3. THE dark color palette SHALL preserve the same semantic color names and token structure (identical object keys at every nesting level) as the light palette.
4. WHEN the user activates the dark theme via a toggle control, THE Theme_Provider SHALL set the `[data-theme="dark"]` attribute on the document root element (`<html>`) and override all CSS_Custom_Properties defined in `:root` with the corresponding dark palette values.
5. WHEN no user preference is stored, THE Theme_Provider SHALL detect the operating system color scheme preference via `prefers-color-scheme: dark` media query and apply the dark palette if the system preference is dark.
6. IF the user switches between light and dark themes, THEN THE Theme_Provider SHALL apply the new palette values within 100 milliseconds without requiring a page reload.

### Requirement 3: Feature Flag Dark Mode Toggle

**User Story:** As a user, I want to toggle dark mode through the application's feature flag panel, so that I can switch themes without reloading the page.

#### Acceptance Criteria

1. WHEN the `dark-mode` feature flag value changes to `true`, THE Theme_Provider SHALL apply the `data-theme="dark"` attribute to the document root element within the same React render cycle, without requiring a page reload.
2. WHEN the `dark-mode` feature flag value changes to `false`, THE Theme_Provider SHALL set the `data-theme` attribute to `"light"` on the document root element within the same React render cycle, without requiring a page reload.
3. THE Theme_Provider SHALL read the dark mode state using the existing `useFeatureFlag('dark-mode')` hook from the Feature_Flag_System.
4. WHEN the application loads and no persisted dark mode state exists in localStorage, THE Theme_Provider SHALL apply the `data-theme="light"` attribute to the document root element (matching the registry default value of `false`).
5. WHEN the application loads and a persisted dark mode state exists in localStorage, THE Feature_Flag_System SHALL restore the persisted value and THE Theme_Provider SHALL apply the corresponding `data-theme` attribute (`"dark"` for `true`, `"light"` for `false`) before the first user-visible render.

### Requirement 4: Component CSS Migration

**User Story:** As a developer, I want UI components to consume CSS custom properties instead of inline style objects, so that themes can be applied without JavaScript re-renders.

#### Acceptance Criteria

1. THE Button component SHALL reference CSS custom properties (e.g., `var(--color-primary-600)`, `var(--spacing-sm)`, `var(--font-size-base)`) for all color, spacing, and typography values that were previously sourced from the imported `colors`, `spacing`, and `typography` theme tokens, and SHALL NOT import or reference the JavaScript theme token objects for those values.
2. THE Card component SHALL reference CSS custom properties for all color, spacing, and typography values that were previously sourced from the imported `colors`, `spacing`, and `typography` theme tokens, and SHALL NOT import or reference the JavaScript theme token objects for those values.
3. THE Skeleton component SHALL reference CSS custom properties for all color values that were previously sourced from the imported `colors` theme tokens (specifically `colors.neutral[200]` for its background), and SHALL NOT import or reference the JavaScript `colors` object for those values.
4. THE Table component SHALL reference CSS custom properties for all color, spacing, and typography values that were previously sourced from the imported `colors`, `spacing`, and `typography` theme tokens, and SHALL NOT import or reference the JavaScript theme token objects for those values.
5. THE ErrorBoundary component SHALL reference CSS custom properties for all color, spacing, and typography values that were previously sourced from the imported `colors`, `spacing`, and `typography` theme tokens, and SHALL NOT import or reference the JavaScript theme token objects for those values.
6. WHEN the active theme changes (by updating CSS custom property values on an ancestor element), THE migrated components SHALL reflect the updated visual styles within 1 animation frame, without triggering a React component re-render (verified by confirming no React lifecycle methods or state updates fire on the migrated components).
7. THE ui-core package SHALL provide a CSS file (importable by consuming applications) that defines all referenced CSS custom properties with default values matching the current theme token values defined in `theme/index.ts`.
8. IF a CSS custom property referenced by a migrated component is not defined in the cascade, THEN THE component SHALL render using the fallback value specified in each `var()` call (e.g., `var(--color-primary-600, #2563eb)`), producing the same visual output as the current inline-style implementation.

### Requirement 5: CSS Module Architecture

**User Story:** As a developer, I want component styles organized in co-located CSS modules, so that styles are scoped, maintainable, and do not leak between components.

#### Acceptance Criteria

1. THE UI_Core package SHALL provide a CSS module file (`.module.css`) located in the same directory as its corresponding component source file (e.g., `components/Button/Button.module.css` alongside `components/Button/index.ts`).
2. THE CSS module files SHALL reference Design_Tokens exclusively through CSS_Custom_Properties for color, spacing, and typography values — with the exception of CSS-inherent literals (`0`, `none`, `transparent`, `inherit`, `currentColor`, unitless line-heights, and plain numeric values such as z-index).
3. THE UI_Core build pipeline SHALL process CSS modules and emit the generated CSS as separate `.css` file(s) within the `dist/` directory, importable by consuming applications alongside the JavaScript entry points.
4. THE CSS module class names in the build output SHALL contain a unique hash or component-scoped identifier such that no two components produce the same class name for different style rules.
5. IF a CSS_Custom_Property referenced in a CSS module is not defined at runtime, THEN THE component SHALL render using the CSS-declared fallback value specified in the `var()` function (e.g., `var(--token-name, <fallback>)`).

### Requirement 6: Dark Mode Component Adaptation

**User Story:** As a user, I want all UI components to render correctly in dark mode, so that the interface remains legible and visually consistent when dark mode is active.

#### Acceptance Criteria

1. WHILE the dark theme is active, THE Button component SHALL render using the dark palette CSS_Custom_Properties for background, text, and border colors across all variants (primary, secondary, ghost), maintaining a minimum 4.5:1 contrast ratio between text and its background for each variant.
2. WHILE the dark theme is active, THE Card component SHALL render using the dark palette CSS_Custom_Properties for surface background, border, header text, body text, and footer text, maintaining a minimum 4.5:1 contrast ratio between text colors and their respective background surfaces.
3. WHILE the dark theme is active, THE Skeleton component SHALL render placeholder shapes using the dark palette CSS_Custom_Properties for base and shimmer highlight colors, where the shimmer highlight is visually distinguishable from the base (minimum 1.5:1 contrast ratio between shimmer highlight and skeleton base).
4. WHILE the dark theme is active, THE Table component SHALL render using the dark palette CSS_Custom_Properties for header background, row backgrounds, alternating row stripes, borders, and text colors, maintaining a minimum 4.5:1 contrast ratio between text and row backgrounds.
5. WHILE the dark theme is active, THE ErrorBoundary fallback SHALL render using the dark palette CSS_Custom_Properties for background, heading text, body text, and action button colors, maintaining a minimum 4.5:1 contrast ratio between text and background.
6. WHILE the dark theme is active, THE focus indicators on interactive components (Button, Table controls, ErrorBoundary actions) SHALL maintain a minimum 3:1 contrast ratio against the adjacent dark background color.
7. WHILE the dark theme is active, THE disabled state of interactive components SHALL remain visually distinct from the enabled state, using reduced opacity or muted color tokens from the dark palette that maintain a minimum 3:1 contrast ratio between the disabled element and its background.

### Requirement 7: Visual Snapshot Test Infrastructure

**User Story:** As a developer, I want automated visual snapshot tests for each component, so that unintended visual regressions are caught before merging.

#### Acceptance Criteria

1. THE UI_Core package SHALL include visual snapshot tests that capture rendered screenshots of each component (Button, Card, Skeleton, Table, ErrorBoundary) at viewport widths 320px, 768px, and 1280px.
2. THE visual snapshot tests SHALL capture each component in both light and dark theme states, covering at minimum the default rendered state of each component.
3. THE visual snapshot tests SHALL use Playwright for browser-based screenshot capture.
4. WHEN a visual snapshot test is executed, THE test runner SHALL compare the captured screenshot against the stored Baseline_Image using a pixel-level diff.
5. IF the pixel diff exceeds a configurable threshold (default: 0.1% pixel difference), THEN THE visual snapshot test SHALL fail and report the difference percentage.
6. THE Baseline_Images SHALL be stored in version control within the UI_Core package directory.
7. IF no Baseline_Image exists for a component-viewport-theme combination, THEN THE visual snapshot test SHALL generate and save the screenshot as the new Baseline_Image and pass without comparison.
8. WHEN a developer runs the dedicated update-baselines script, THE test infrastructure SHALL re-capture all component screenshots and overwrite existing Baseline_Images with the newly captured versions.
9. IF a visual snapshot test fails due to a pixel diff exceeding the threshold, THEN THE test runner SHALL output a diff image highlighting the changed regions alongside the expected and actual screenshots.

### Requirement 8: Visual Snapshot Test Coverage

**User Story:** As a developer, I want snapshot tests to cover component variants and interactive states, so that regressions in specific configurations are detected.

#### Acceptance Criteria

1. THE visual snapshot tests SHALL capture a baseline screenshot of Button in all variant (primary, secondary, ghost) and size (sm, md, lg) combinations (9 total), each rendered in both light and dark themes (18 screenshots total).
2. THE visual snapshot tests SHALL capture a baseline screenshot of Button in disabled state for each of the 3 variants at default (md) size, in both light and dark themes (6 screenshots total).
3. THE visual snapshot tests SHALL capture baseline screenshots of Card in two configurations: one with title, body content, and footer present, and one with title and body content only (footer omitted), each in both light and dark themes (4 screenshots total).
4. THE visual snapshot tests SHALL capture baseline screenshots of Table with a populated state containing at least 5 data rows and a separate empty state showing the no-data indicator, each in both light and dark themes (4 screenshots total).
5. THE visual snapshot tests SHALL capture Skeleton in its loading state with CSS animations paused (using `prefers-reduced-motion` or programmatic animation disabling) to produce a deterministic static frame, in both light and dark themes (2 screenshots total).
6. WHEN new component variants are added to UI_Core, THE visual snapshot test suite SHALL fail with a missing-baseline error for any variant that does not have a corresponding stored baseline image, until the developer runs the update-baselines script to generate the new baselines.

### Requirement 9: Theme Transition Behavior

**User Story:** As a user, I want theme changes to apply smoothly, so that switching between light and dark modes is not visually jarring.

#### Acceptance Criteria

1. WHEN the theme changes, THE Theme_Provider SHALL apply a CSS transition on color and background-color properties with a duration between 150ms and 300ms.
2. WHEN the theme changes AND the user has prefers-reduced-motion enabled, THE Theme_Provider SHALL apply the theme change instantly with no CSS transition.
3. WHILE a theme transition is in progress, THE components SHALL not display unstyled content, intermediate color states, or white flashes between the old and new theme values.
4. THE theme transition SHALL apply only to color, background-color, border-color, and fill properties and SHALL NOT affect layout, spacing, dimensions, or transform properties.
5. IF the data-theme attribute value on the document root is set to a value not matching any defined theme, THEN THE Theme_Provider SHALL retain the currently active theme and not initiate a transition.

### Requirement 10: Data Loading State Coordination

**User Story:** As a user, I want loading indicators to remain visible until table data is actually rendered, so that I never see an empty table flash between the loading state and data display.

#### Acceptance Criteria

1. WHILE TanStack Query reports a query status of `loading` or `pending` for a data set bound to a Table component, THE Skeleton component SHALL remain visible and THE Table component SHALL NOT render its empty-state or data-row markup.
2. WHEN TanStack Query transitions a query status from `loading` to `success`, THE page SHALL replace the Skeleton component with the fully populated Table component in the same React render cycle, ensuring zero frames where an empty Table is visible.
3. WHILE a route transition is in progress and new page data has not yet resolved, THE previously rendered page content SHALL remain visible until the incoming page data reaches a `success` status, preventing a blank or empty intermediate state.
4. IF a route transition triggers a new data fetch that takes longer than 200ms, THEN THE page SHALL display a non-blocking loading indicator (such as a top progress bar or subtle overlay skeleton) while keeping the previous page content visible underneath.
5. WHEN TanStack Query provides `placeholderData` or `keepPreviousData` configuration, THE Table component SHALL render the stale data rows (previous query result) while the fresh query is in-flight, and SHALL only swap to the new data rows once the fresh query reaches `success` status.
6. IF a data fetch completes with an empty result set (zero rows), THEN THE Table component SHALL transition directly from the Skeleton loading state to its designated empty-state indicator without displaying an unpopulated table body.
7. THE coordination between Skeleton visibility and data readiness SHALL be implemented via a shared `isDataReady` guard derived from the TanStack Query result, where `isDataReady` is `true` only when `status === 'success'` AND `data` is defined, ensuring the Skeleton hides and Table content renders atomically.
8. WHEN the browser page is refreshed (full reload) on a route containing a data Table, THE Skeleton component SHALL remain visible from initial render until TanStack Query resolves the data fetch to `success` status, with no intermediate frame showing an empty Table body.

### Requirement 11: Motion and Animation Design Tokens

**User Story:** As a developer, I want motion tokens (durations, easing curves) defined in the design system, so that animations are consistent and configurable across all components.

#### Acceptance Criteria

1. THE Design_Tokens_Package SHALL define duration Motion_Tokens with the following named values: `instant` (0ms), `fast` (100ms), `normal` (200ms), `slow` (300ms), and `slower` (500ms).
2. THE Design_Tokens_Package SHALL define easing curve Motion_Tokens with the following named values: `ease-in` (cubic-bezier(0.4, 0, 1, 1)), `ease-out` (cubic-bezier(0, 0, 0.2, 1)), `ease-in-out` (cubic-bezier(0.4, 0, 0.2, 1)), and `spring` (cubic-bezier(0.175, 0.885, 0.32, 1.275)).
3. THE Design_Tokens_Package SHALL export all Motion_Tokens as CSS_Custom_Properties following the naming convention `--motion-duration-{name}` for durations (e.g., `--motion-duration-normal`) and `--motion-easing-{name}` for easing curves (e.g., `--motion-easing-ease-out`).
4. THE Design_Tokens_Package SHALL export all Motion_Tokens as TypeScript constant objects (`motionDurations` and `motionEasings`) for backward compatibility with existing JavaScript-based consuming code.
5. THE Button, Card, Table, Skeleton, and ErrorBoundary components SHALL reference Motion_Token CSS_Custom_Properties for all transition-duration and transition-timing-function values, and SHALL NOT use hardcoded duration or easing values in component styles.
6. WHEN the `prefers-reduced-motion: reduce` media query matches, THE Design_Tokens_Package SHALL provide a CSS override file that sets all `--motion-duration-*` CSS_Custom_Properties to `0ms`, disabling animations for users who prefer reduced motion.
7. WHEN the `prefers-reduced-motion: reduce` media query matches, THE easing curve Motion_Tokens SHALL remain unchanged (only durations are zeroed).

### Requirement 12: Responsive Breakpoint Tokens

**User Story:** As a developer, I want formalized breakpoint tokens in the design system, so that responsive behavior is consistent and components can reference shared breakpoint definitions.

#### Acceptance Criteria

1. THE Design_Tokens_Package SHALL define Breakpoint_Tokens with the following named values: `xs` (0px), `sm` (480px), `md` (768px), `lg` (1024px), `xl` (1280px), and `2xl` (1536px).
2. THE Design_Tokens_Package SHALL export Breakpoint_Tokens as CSS_Custom_Properties following the naming convention `--breakpoint-{name}` (e.g., `--breakpoint-md` with value `768px`).
3. THE Design_Tokens_Package SHALL export Breakpoint_Tokens as TypeScript constants (`breakpoints` object) with numeric pixel values for programmatic use in consuming applications.
4. THE Design_Tokens_Package SHALL provide CSS custom media queries (using `@custom-media` syntax or Sass/PostCSS mixins) for each breakpoint (e.g., `@custom-media --viewport-md (min-width: 768px)`) that consuming applications can use for responsive layouts.
5. THE UI_Core components that implement responsive behavior SHALL reference Breakpoint_Token values and SHALL NOT use hardcoded pixel values for media query or container query breakpoints.
6. THE Visual_Snapshot_Tests SHALL use Breakpoint_Token values (`320px` for below `sm`, `768px` for `md`, and `1280px` for `xl`) as viewport widths, referencing the token definitions rather than hardcoded pixel literals in test configuration.

### Requirement 13: Elevation and Shadow Tokens

**User Story:** As a developer, I want elevation tokens with light and dark mode variants, so that depth perception is maintained across themes without hardcoded shadows.

#### Acceptance Criteria

1. THE Design_Tokens_Package SHALL define Elevation_Tokens at five named levels: `level-0` (flat/no shadow), `level-1` (slight elevation), `level-2` (card elevation), `level-3` (dropdown elevation), and `level-4` (modal elevation).
2. THE light theme Elevation_Token values SHALL use traditional `box-shadow` with increasing spread and blur values: `level-0` (none), `level-1` (0 1px 2px rgba(0,0,0,0.05)), `level-2` (0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)), `level-3` (0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)), and `level-4` (0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)).
3. THE dark theme Elevation_Token values SHALL use either subtle light-glow shadows or border-based elevation indicators that remain visible against dark backgrounds, distinct from the light theme values.
4. THE Design_Tokens_Package SHALL export Elevation_Tokens as CSS_Custom_Properties following the naming convention `--elevation-{level}` (e.g., `--elevation-1`, `--elevation-2`).
5. THE Card component SHALL reference the `--elevation-2` CSS_Custom_Property for its box-shadow value and SHALL NOT use a hardcoded `box-shadow` declaration.
6. WHILE the dark theme is active (indicated by `[data-theme="dark"]` on the document root), THE Elevation_Token CSS_Custom_Properties SHALL be overridden with the dark-appropriate shadow or border values.
7. WHEN the theme transitions between light and dark, THE elevation visual change SHALL follow the same transition timing as other theme properties (governed by Motion_Tokens).

### Requirement 14: Component API Auto-Documentation

**User Story:** As a developer consuming the library, I want auto-generated API documentation for each component, so that I can discover props, types, and usage without reading source code.

#### Acceptance Criteria

1. THE UI_Core Storybook configuration SHALL enable the autodocs feature for all exported components (Button, Card, Table, Skeleton, ErrorBoundary).
2. WHEN a component story page is rendered in Storybook, THE documentation page SHALL display: a component description, an auto-generated prop table derived from the component's TypeScript interface, at least one usage example, and a showcase of all component variants.
3. THE auto-generated prop table SHALL render JSDoc comments from component TypeScript interface properties as the description column for each prop row.
4. WHEN a component TypeScript interface is defined, THE interface SHALL include JSDoc comments on every prop explaining the prop's purpose and any constraints (e.g., valid values, defaults).
5. THE Storybook build (via `build-storybook` script) SHALL produce a static documentation site as HTML/CSS/JS files in the Storybook output directory, deployable alongside the application without a running Node.js server.
6. IF a new prop is added to a component's TypeScript interface without a JSDoc comment, THEN THE Storybook prop table SHALL display the prop name and type but show an empty description, signaling incomplete documentation.

### Requirement 15: Compound Component Patterns

**User Story:** As a developer, I want components to use compound component patterns (composable sub-components), so that I can demonstrate advanced React architecture and provide flexible APIs.

#### Acceptance Criteria

1. THE Table component SHALL expose Compound_Component sub-components: `Table.Header`, `Table.Body`, `Table.Row`, `Table.Cell`, and `Table.Footer`, each rendered as semantically appropriate HTML elements (`thead`, `tbody`, `tr`, `td`/`th`, `tfoot`).
2. THE Card component SHALL expose Compound_Component sub-components: `Card.Header`, `Card.Body`, `Card.Footer`, and `Card.Actions`, each rendered as semantically appropriate HTML elements.
3. THE Compound_Component sub-components of Table and Card SHALL share parent state (such as theme context or layout configuration) via a dedicated React Context created by the parent component.
4. WHILE in development mode (`process.env.NODE_ENV === 'development'`), THE parent Compound_Component (Table or Card) SHALL emit a console warning if an invalid child component (one that is not a recognized sub-component) is rendered as a direct child.
5. THE existing prop-based API for Table and Card (e.g., `columns`, `data`, `title`, `footer` props) SHALL remain functional and unchanged, serving as a convenience wrapper over the compound component API.
6. THE TypeScript types for Compound_Component sub-components SHALL enforce correct nesting: `Table.Row` SHALL only be accepted as a child of `Table.Body` or `Table.Header`, and `Table.Cell` SHALL only be accepted as a child of `Table.Row`, with type errors produced for incorrect nesting at compile time.
7. THE Compound_Component context SHALL not be accessible outside the parent component boundary (the context provider SHALL only be rendered by the parent component, preventing external access to internal state).

### Requirement 16: CSS @layer Cascade Management

**User Story:** As a developer, I want CSS organized into explicit cascade layers, so that specificity conflicts are eliminated and the priority between tokens, base styles, component styles, and variants is deterministic.

#### Acceptance Criteria

1. THE UI_Core package SHALL declare CSS cascade layers in the following priority order (lowest to highest): `tokens`, `base`, `components`, `variants`, `utilities`.
2. THE `tokens` CSS_Layer SHALL contain all CSS_Custom_Property declarations (design token definitions for colors, spacing, typography, motion, elevation, and breakpoints).
3. THE `base` CSS_Layer SHALL contain CSS reset and normalize rules that establish baseline element styles.
4. THE `components` CSS_Layer SHALL contain all component-scoped CSS module styles (Button, Card, Table, Skeleton, ErrorBoundary).
5. THE `variants` CSS_Layer SHALL contain variant-specific style overrides including dark mode (`[data-theme="dark"]`), responsive adjustments, and state-based variations.
6. THE `utilities` CSS_Layer SHALL contain any utility classes provided by the design system for consuming application use.
7. THE layer order declaration (`@layer tokens, base, components, variants, utilities;`) SHALL appear once in a root stylesheet that is imported before any component-level CSS in the consuming application's entry point.
8. THE UI_Core component styles SHALL NOT use `!important` declarations; cascade priority SHALL be managed exclusively through the CSS_Layer system.
9. IF a consuming application defines additional CSS layers, THEN THE UI_Core layer declarations SHALL not conflict because the UI_Core root stylesheet declares its own layer order independently.

### Requirement 17: OKLCH Perceptually Uniform Color Generation

**User Story:** As a developer, I want color palette shades generated using OKLCH color space, so that the palette has perceptually uniform lightness steps and demonstrates modern color science.

#### Acceptance Criteria

1. THE Design_Tokens_Package color scales (primary, secondary, success, warning, error) with shades 50 through 900 SHALL be generated using OKLCH color space calculations with uniform lightness distribution across the 10 shade steps.
2. THE generated OKLCH color values SHALL be converted to sRGB hexadecimal format for the CSS_Custom_Property values, ensuring compatibility with all browsers that support CSS custom properties.
3. THE Design_Tokens_Package SHALL include a build-time configuration file or script that defines the base hue (H) and chroma (C) for each color scale, and algorithmically generates all 10 shades by varying the lightness (L) component uniformly from light (shade 50) to dark (shade 900).
4. THE generated color palette SHALL maintain WCAG AA contrast ratios (minimum 4.5:1) between text-designated shades and background-designated shades within each color scale (e.g., shade 700 text on shade 50 background).
5. WHEN the browser supports the CSS `color()` function with OKLCH syntax (detected via `@supports (color: oklch(0.5 0.2 240))`), THE CSS_Custom_Properties SHALL use OKLCH values as a progressive enhancement layer alongside the sRGB hex fallback.
6. THE TypeScript token objects for colors SHALL include both the sRGB hex value (as the primary value) and the source OKLCH coordinates (lightness, chroma, hue) as metadata for each shade, enabling downstream tooling to reference the perceptual color values.

### Requirement 18: High Contrast Mode Support

**User Story:** As a user with visual needs, I want the UI to adapt when I enable high contrast mode on my OS, so that elements are more distinguishable and readable.

#### Acceptance Criteria

1. WHEN the `prefers-contrast: more` media query matches, THE Theme_Provider SHALL increase border widths to a minimum of 2px on all interactive components (Button) and container components (Card, Table).
2. WHEN the `prefers-contrast: more` media query matches, THE color palette overrides SHALL increase contrast ratios to a minimum of 7:1 (WCAG AAA) for all text colors (`text.primary`, `text.secondary`) against their respective background surfaces (`background`, `surface`).
3. WHEN the `prefers-contrast: more` media query matches, THE focus indicators on interactive components SHALL use a minimum 3px solid outline with a color that achieves at least 3:1 contrast against the adjacent background.
4. THE high contrast adjustments SHALL be applied via CSS_Custom_Property overrides within the `variants` CSS_Layer (using the `@media (prefers-contrast: more)` media query), without modifying base component logic or structure.
5. THE Visual_Snapshot_Tests SHALL include high-contrast variant captures for all components (Button, Card, Table, Skeleton, ErrorBoundary) in both light and dark themes.
6. WHEN the `forced-colors: active` media query matches, THE UI_Core components SHALL rely on system-provided colors and SHALL NOT override the system color keywords (`Canvas`, `CanvasText`, `LinkText`, `ButtonFace`, `ButtonText`).
7. IF both `prefers-contrast: more` and `forced-colors: active` are active simultaneously, THEN THE UI_Core components SHALL defer to the forced-colors behavior (system colors take precedence over the custom high-contrast overrides).

### Requirement 19: Storybook Interaction Tests

**User Story:** As a developer, I want Storybook interaction tests that verify hover, focus, and keyboard navigation behavior, so that the design system's interactive states are tested beyond visual appearance.

#### Acceptance Criteria

1. THE UI_Core Storybook SHALL include Interaction_Test stories (using `play()` functions) for each interactive component: Button, and Table (with sortable headers).
2. THE Interaction_Tests for Button SHALL verify: hover state applies expected style changes, focus ring appears on keyboard Tab navigation, the button activates on Enter key press, the button activates on Space key press, and disabled buttons do not activate on click or keyboard events.
3. THE Interaction_Tests for Table SHALL verify: row hover highlighting is applied, header click triggers sort behavior, keyboard navigation moves focus between interactive table elements, and sorted column indicator is visible after header activation.
4. THE Interaction_Tests SHALL verify dark mode interactive states by running the same interactions with `[data-theme="dark"]` applied, confirming that focus rings remain visible and hover states are visually distinguishable against dark backgrounds.
5. THE Interaction_Tests SHALL be executable via the `@storybook/test-runner` package in CI environments using the `test-storybook` script.
6. IF an Interaction_Test detects that a focus ring is not visible (no outline or box-shadow change on focus) or a hover state is not applied (no background-color or opacity change on hover), THEN THE test SHALL fail with a descriptive assertion message identifying the component, the interaction type, and the expected style change.
7. THE Table Interaction_Tests SHALL verify: row hover highlighting applies a distinct background color, header click toggles ascending/descending sort, keyboard Enter on a header cell triggers sort, and tab navigation moves focus sequentially through interactive header cells.

### Requirement 20: Continuous Pipeline Validation Per Task

**User Story:** As a developer, I want every implementation task to leave the codebase in a green state (all tests, linting, type-checking, and builds passing), so that regressions are never introduced incrementally and each commit is deployable.

#### Acceptance Criteria

1. WHEN an implementation task is completed, THE Validation_Pipeline SHALL pass all five stages in sequence: ESLint with zero errors across all affected workspaces, TypeScript strict-mode compilation with zero type errors, Vitest test suite with all tests passing, Storybook build exiting cleanly (exit code 0), and Nx build for all affected workspaces exiting cleanly (exit code 0).
2. IF any single stage of the Validation_Pipeline fails after a task is completed, THEN THE task SHALL NOT be considered done until the developer resolves the failure and the full pipeline passes.
3. THE Validation_Pipeline SHALL evaluate all affected workspaces (not only the workspace containing the modified files), using Nx affected detection (`nx affected -t lint,typecheck,test,build`) to determine the scope of validation.
4. THE Validation_Pipeline SHALL be executable via a single command (`nx run-many -t lint,typecheck,test,build`) so that developers can run it locally before committing changes.
5. WHEN code is committed as part of an implementation task, THE committed code SHALL NOT introduce any new `@ts-ignore` comments, `eslint-disable` directives, or `.skip` modifiers on test cases, unless each suppression is accompanied by an adjacent justification comment explaining why the suppression is necessary and what conditions would allow its removal.
6. THE codebase state after each task's commit SHALL be independently buildable and deployable — no work-in-progress states, no broken intermediate builds, and no reliance on subsequent commits to restore a passing pipeline.
7. IF a previously passing pipeline stage begins failing due to changes in an upstream dependency (workspace or external package), THEN THE task introducing the upstream change SHALL include fixes for all downstream failures before the task is considered complete.
8. THE Validation_Pipeline execution time for a single affected workspace SHALL complete within 5 minutes on a standard development machine, ensuring the feedback loop remains practical for per-task validation.

### Requirement 21: Standalone Design Tokens Package

**User Story:** As a developer, I want design tokens published as an independent package with no framework dependencies, so that tokens can be consumed by any application (React, Vue, native, email) without coupling to the UI component library.

#### Acceptance Criteria

1. THE Monorepo SHALL contain a `packages/design-tokens/` workspace with its own package.json declaring the package name `@frontend-monorepo-showcase/design-tokens`.
2. THE design-tokens package SHALL have zero runtime dependencies (no React, no framework libraries).
3. THE design-tokens package SHALL export CSS files via package.json "exports" field: `./css` for root token declarations, `./css/layers` for @layer order, `./css/dark` for dark theme overrides, `./css/high-contrast` for high-contrast overrides.
4. THE design-tokens package SHALL export TypeScript modules via package.json "exports" field with per-category entry points: `./colors`, `./spacing`, `./typography`, `./motion`, `./elevation`, `./breakpoints`.
5. THE ui-core package SHALL declare `@frontend-monorepo-showcase/design-tokens` as a dependency and SHALL NOT duplicate token definitions.
6. WHEN consuming applications import CSS from design-tokens, THE CSS custom properties SHALL be available globally without requiring ui-core to be installed.
7. THE design-tokens package SHALL build independently (before ui-core) and SHALL be usable as a standalone dependency in projects that do not use React.
