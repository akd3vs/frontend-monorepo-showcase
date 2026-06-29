# Implementation Plan: UI Professional Refinement

## Overview

This plan implements a CSS custom properties–based design token system with CSS module architecture, dark mode theming, compound component patterns, and visual regression testing. The work is structured so each task leaves the pipeline green (Requirement 20), starting with the standalone `design-tokens` package and building outward through `ui-core` and into `host-shell`.

## Tasks

- [x] 1. Scaffold design-tokens package
  - [x] 1.1 Create package structure and configuration
    - Create `packages/design-tokens/` directory with `package.json` (name: `@frontend-monorepo-showcase/design-tokens`, zero runtime dependencies, exports map for CSS and TypeScript modules), `tsconfig.json`, `tsconfig.build.json`, and `vite.config.ts` (library mode with multiple entry points and `vite-plugin-dts`)
    - Create `src/types.ts` defining `OklchMeta`, `ColorShade`, `ColorScale`, `ColorTokens`, `MotionDurations`, `MotionEasings`, `ElevationTokens`, `BreakpointTokens` interfaces
    - Create `src/config.ts` with OKLCH generation config for each color scale (hue, chroma, lightnessRange)
    - Create placeholder `src/index.ts` barrel export
    - Verify: `nx run @frontend-monorepo-showcase/design-tokens:build` exits cleanly
    - _Requirements: 21.1, 21.2, 21.7_

- [x] 2. Implement OKLCH generation and token CSS
  - [x] 2.1 Implement OKLCH color generation script
    - Create `scripts/generate-tokens.ts` implementing `generateColorScale()` that varies lightness uniformly from shade 50 (light) to shade 900 (dark), `oklchToSrgbHex()` for gamut-mapped sRGB conversion, and `validateContrastRatio()` for WCAG AA checks
    - Generate all 6 color scales (primary, secondary, success, warning, error, neutral) with 10 shades each
    - Output both hex values and OKLCH source coordinates as metadata
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.6_

  - [x] 2.2 Generate token CSS files
    - Create `src/layers.css` with `@layer tokens, base, components, variants, utilities;` declaration
    - Create `src/tokens.css` declaring all CSS custom properties on `:root` inside `@layer tokens` — colors (scales + semantic), spacing, typography, motion durations/easings, elevation, breakpoints — plus `@media (prefers-reduced-motion: reduce)` override zeroing all `--motion-duration-*`
    - Create `src/dark.css` inside `@layer variants` with `[data-theme="dark"]` overrides for all color, elevation tokens (dark palette uses inverted lightness + subtle glow shadows)
    - Create `src/high-contrast.css` inside `@layer variants` with `@media (prefers-contrast: more)` overrides and `@media (forced-colors: active)` rules
    - Verify generated colors maintain WCAG AA contrast ratios (4.5:1 text-on-surface)
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 11.1, 11.2, 11.3, 11.6, 11.7, 12.1, 12.2, 13.1, 13.2, 13.3, 13.4, 13.6, 16.1, 16.2, 16.5, 16.7, 17.5, 18.1, 18.2, 18.4, 18.6, 18.7_

  - [x] 2.3 Implement TypeScript token exports
    - Create `src/colors.ts` exporting color scales with hex values and OKLCH metadata per shade
    - Create `src/spacing.ts` exporting spacing scale object
    - Create `src/typography.ts` exporting font family, size, weight, line-height objects
    - Create `src/motion.ts` exporting `motionDurations` and `motionEasings` constant objects
    - Create `src/elevation.ts` exporting elevation level values (light and dark)
    - Create `src/breakpoints.ts` exporting breakpoint numeric pixel values
    - Update `src/index.ts` barrel to re-export all modules
    - _Requirements: 1.5, 11.4, 12.3, 13.4, 17.6, 21.3, 21.4_

  - [x] 2.4 Write property tests for token generation (Properties 1, 2, 7, 8, 9)
    - **Property 1: Token Naming Convention Compliance** — verify generated CSS custom property names follow `--{category}-{path-segments}` convention
    - **Property 2: Dark Palette Structural Equivalence** — verify light and dark palettes have identical key structure
    - **Property 7: OKLCH Lightness Uniformity** — verify lightness steps are uniform within ±0.02 tolerance
    - **Property 8: Generated Palette WCAG AA Contrast** — verify shade 700 on shade 50 achieves ≥4.5:1
    - **Property 9: Token Objects Include OKLCH Metadata** — verify each shade has hex + oklch with valid ranges
    - Create `src/__tests__/tokens.property.test.ts`
    - **Validates: Requirements 1.3, 2.1, 2.3, 17.1, 17.3, 17.4, 17.6**

  - [x] 2.5 Write property test for dark palette contrast (Property 3)
    - **Property 3: Dark Palette Text-Surface Contrast Ratio** — verify all text-on-surface pairings achieve ≥4.5:1 WCAG contrast
    - Create `src/__tests__/contrast.property.test.ts`
    - **Validates: Requirements 2.2, 6.1, 6.2, 6.4, 6.5**

- [x] 3. Checkpoint - Verify design-tokens package builds independently
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Wire design-tokens into ui-core
  - [x] 4.1 Add design-tokens dependency and update ui-core build config
    - Add `@frontend-monorepo-showcase/design-tokens: "workspace:*"` to ui-core `package.json` dependencies
    - Update `vite.config.ts` to externalize `@frontend-monorepo-showcase/design-tokens` and configure CSS modules (`localsConvention: 'camelCase'`, `generateScopedName: '[name]__[local]__[hash:base64:5]'`)
    - Create `src/theme/index.ts` that re-exports TypeScript token objects from design-tokens for backward compatibility
    - Verify: `nx run @frontend-monorepo-showcase/ui-core:build` exits cleanly (design-tokens builds first via Nx dependency graph)
    - _Requirements: 1.5, 21.5, 21.6_

  - [x] 4.2 Create ThemeProvider component
    - Create `src/providers/ThemeProvider.tsx` implementing `ThemeProviderProps` interface (`isDarkMode: boolean`, `respectSystemPreference?: boolean`, `children`)
    - Use `useLayoutEffect` to synchronously set `document.documentElement.dataset.theme` to `'dark'` or `'light'`
    - Implement `prefers-color-scheme: dark` media query detection when `respectSystemPreference` is true and no explicit preference
    - Inject theme transition CSS class enabling `transition` on color/background-color/border-color/fill with `var(--motion-duration-slow)`
    - Create `src/providers/ThemeProvider.module.css` with transition styles
    - Handle edge case: ignore invalid `data-theme` values set externally (Req 9.5)
    - Export ThemeProvider from `src/index.ts`
    - _Requirements: 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 4.3 Write unit tests for ThemeProvider
    - Test `data-theme` attribute set to `'dark'` when `isDarkMode` is true
    - Test `data-theme` attribute set to `'light'` when `isDarkMode` is false
    - Test system preference detection with `matchMedia` mock
    - Test `prefers-reduced-motion` disables transitions via CSS (motion tokens zeroed)
    - Test invalid theme value handling (Req 9.5)
    - _Requirements: 3.1, 3.2, 3.4, 9.2, 9.5_

  - [x] 4.4 Write property test for theme transitions (Property 6)
    - **Property 6: Theme Transition Targets Only Color Properties** — verify transition declarations only target color, background-color, border-color, fill, box-shadow
    - Create `src/__tests__/theme-transition.property.test.ts`
    - **Validates: Requirements 9.4**

- [x] 5. Migrate components to CSS modules
  - [x] 5.1 Migrate Button component to CSS modules
    - Create `src/components/Button/Button.module.css` inside `@layer components` with all variant (primary, secondary, ghost) and size (sm, md, lg) styles using `var()` token references with fallbacks
    - Add focus-visible styles, disabled state, high-contrast overrides (`@media (prefers-contrast: more)` and `@media (forced-colors: active)`)
    - Update `Button.tsx` to use CSS module classNames instead of inline styles
    - Remove imports of JavaScript theme token objects for styling values
    - Verify existing Button tests still pass
    - _Requirements: 4.1, 4.6, 4.8, 5.1, 5.2, 5.4, 5.5, 6.1, 6.6, 6.7, 11.5, 16.3, 16.4, 16.8, 18.1, 18.3, 18.6, 18.7_

  - [x] 5.2 Migrate Card component to CSS modules
    - Create `src/components/Card/Card.module.css` inside `@layer components` with surface, border, shadow (`var(--elevation-2)`), header/body/footer spacing using token vars with fallbacks
    - Add high-contrast overrides for border width
    - Update `Card.tsx` to use CSS module classNames
    - Remove imports of JavaScript theme token objects for styling values
    - Verify existing Card tests still pass
    - _Requirements: 4.2, 4.6, 4.8, 5.1, 5.2, 5.4, 5.5, 6.2, 13.5, 16.3, 16.4, 16.8, 18.1_

  - [x] 5.3 Migrate Skeleton component to CSS modules
    - Create `src/components/Skeleton/Skeleton.module.css` inside `@layer components` with base/shimmer colors using token vars, animation with motion tokens
    - Update `Skeleton.tsx` to use CSS module classNames
    - Remove imports of JavaScript `colors` object
    - _Requirements: 4.3, 4.6, 4.8, 5.1, 5.2, 5.4, 5.5, 6.3, 11.5, 16.3, 16.4, 16.8_

  - [x] 5.4 Migrate Table component to CSS modules
    - Create `src/components/Table/Table.module.css` inside `@layer components` with header, row, alternating stripe, border, text colors using token vars with fallbacks
    - Add high-contrast overrides for border width
    - Update `Table.tsx` (or create new implementation) to use CSS module classNames
    - Remove imports of JavaScript theme token objects for styling values
    - _Requirements: 4.4, 4.6, 4.8, 5.1, 5.2, 5.4, 5.5, 6.4, 6.6, 11.5, 16.3, 16.4, 16.8, 18.1_

  - [x] 5.5 Migrate ErrorBoundary component to CSS modules
    - Create `src/components/ErrorBoundary/ErrorBoundary.module.css` inside `@layer components` with background, text, action button colors using token vars with fallbacks
    - Add high-contrast overrides
    - Update `ErrorBoundary.tsx` to use CSS module classNames
    - Remove imports of JavaScript theme token objects for styling values
    - _Requirements: 4.5, 4.6, 4.8, 5.1, 5.2, 5.4, 5.5, 6.5, 6.6, 11.5, 16.3, 16.4, 16.8, 18.1_

  - [x] 5.6 Write property tests for CSS modules (Properties 4, 5)
    - **Property 4: CSS Variable Fallback Completeness** — verify every `var()` call includes a fallback value
    - **Property 5: CSS Modules Reference Only Token Custom Properties** — verify no hardcoded color/spacing/typography literals (except CSS-inherent values)
    - Create `src/__tests__/css-modules.property.test.ts`
    - **Validates: Requirements 4.8, 5.2, 5.5, 1.6**

- [x] 6. Checkpoint - Verify all components render correctly with CSS modules
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement compound component patterns
  - [x] 7.1 Implement Table compound component
    - Create `src/components/Table/TableContext.ts` with `TableContextValue` interface and React Context
    - Refactor `Table.tsx` into compound components: `Table.Header`, `Table.Body`, `Table.Row`, `Table.Cell`, `Table.Footer` rendering semantic HTML (`thead`, `tbody`, `tr`, `td`/`th`, `tfoot`)
    - Add branded TypeScript types for compile-time nesting enforcement
    - Add dev-mode console warning for invalid child components
    - Create `src/components/Table/TableLegacy.tsx` preserving existing prop-based API as a wrapper over compound API
    - Ensure compound context is not accessible outside parent boundary
    - _Requirements: 15.1, 15.3, 15.4, 15.5, 15.6, 15.7_

  - [x] 7.2 Implement Card compound component
    - Create `src/components/Card/CardContext.ts` with `CardContextValue` interface and React Context
    - Refactor `Card.tsx` into compound components: `Card.Header`, `Card.Body`, `Card.Footer`, `Card.Actions` rendering semantic HTML
    - Add dev-mode console warning for invalid child components
    - Preserve existing prop-based API as a convenience wrapper
    - Ensure compound context is not accessible outside parent boundary
    - _Requirements: 15.2, 15.3, 15.4, 15.5, 15.7_

  - [x] 7.3 Write unit tests for compound components
    - Test Table compound renders correct semantic HTML structure
    - Test Card compound renders correct semantic HTML structure
    - Test dev-mode warnings for invalid children
    - Test legacy prop-based API still works unchanged
    - Test context isolation (sub-components throw outside parent)
    - _Requirements: 15.1, 15.2, 15.4, 15.5, 15.7_

- [x] 8. Wire ThemeProvider into host-shell
  - [x] 8.1 Integrate ThemeProvider with feature flag system
    - Import design-tokens CSS files in `apps/host-shell/src/main.tsx` entry point (layers first, then tokens, then dark)
    - Wrap app with `ThemeProvider` component, passing `isDarkMode` from `useFeatureFlag('dark-mode')`
    - Ensure `dark-mode` feature flag is registered in the feature flag registry
    - Verify theme toggle works: flag change → attribute update → CSS repaint without React re-render on components
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 16.7_

- [x] 9. Implement data loading coordination
  - [x] 9.1 Create useDataTable hook and integrate with Table
    - Create `apps/host-shell/src/hooks/useDataTable.ts` (or appropriate location in data-dashboard) implementing `UseDataTableOptions<T>` and `UseDataTableResult<T>` with `isDataReady` guard (`status === 'success' && data !== undefined`)
    - Support `keepPreviousData` / `placeholderData` for stale data display during refetch
    - Integrate Skeleton → Table transition in route components: show Skeleton while `!isDataReady`, show Table when ready, show empty-state indicator when `isEmpty`
    - Handle route transitions: keep previous content visible until new data resolves
    - Add non-blocking loading indicator for fetches > 200ms
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_

  - [x] 9.2 Write unit tests for useDataTable hook
    - Test `isDataReady` is false during loading/pending
    - Test `isDataReady` is true only when `status === 'success' && data !== undefined`
    - Test `isEmpty` correctly identifies zero-row results
    - Test stale data displayed during refetch with `keepPreviousData`
    - _Requirements: 10.1, 10.2, 10.5, 10.6, 10.7_

- [x] 10. Checkpoint - Verify full app renders with theme switching and data loading
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Set up Storybook autodocs and interaction tests
  - [x] 11.1 Configure Storybook autodocs
    - Update `.storybook/main.ts` to enable `autodocs: 'tag'` and add `@storybook/addon-docs`, `@storybook/addon-a11y`, `@storybook/addon-interactions` addons
    - Add JSDoc comments to all component TypeScript interfaces (every prop must have a description)
    - Create/update stories for all components: Button (all variants×sizes), Card (with/without footer), Table (populated + empty), Skeleton (loading), ErrorBoundary (error states)
    - Ensure `build-storybook` script produces static HTML/CSS/JS output
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

  - [x] 11.2 Implement Storybook interaction tests
    - Add `play()` functions to Button stories: hover style change, focus ring on Tab, Enter activation, Space activation, disabled prevents activation
    - Add `play()` functions to Table stories: row hover highlight, header click sort, keyboard Enter sort, Tab focus navigation
    - Duplicate interaction tests with `[data-theme="dark"]` to verify dark mode interactive states
    - Configure `@storybook/test-runner` for CI execution via `test-storybook` script
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7_

- [x] 12. Set up visual snapshot test infrastructure
  - [x] 12.1 Configure Playwright visual testing
    - Create `tests/visual/visual-test.config.ts` with viewport definitions (320px, 768px, 1280px using breakpoint token values), themes array, pixel diff threshold (0.001), baseline/diff directory paths
    - Create Playwright config for visual tests (`playwright.visual.config.ts`) targeting Storybook iframe URLs
    - Set up `__baselines__/` directory structure for storing baseline images
    - Add scripts: `test:visual` (run comparisons), `test:visual:update` (regenerate baselines)
    - Ensure animation pausing for deterministic captures (Skeleton)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 8.5, 12.6_

  - [x] 12.2 Implement visual snapshot tests for all components
    - Create `tests/visual/button.visual.spec.ts` — all 9 variant×size combos × 2 themes + disabled states (24 screenshots)
    - Create `tests/visual/card.visual.spec.ts` — 2 configs × 2 themes (4 screenshots)
    - Create `tests/visual/table.visual.spec.ts` — populated + empty × 2 themes (4 screenshots)
    - Create `tests/visual/skeleton.visual.spec.ts` — animation paused × 2 themes (2 screenshots)
    - Create `tests/visual/errorboundary.visual.spec.ts` — error states × 2 themes (4 screenshots)
    - Add high-contrast variant captures for all components in both themes
    - _Requirements: 7.1, 7.2, 8.1, 8.2, 8.3, 8.4, 8.5, 18.5_

  - [x] 12.3 Generate initial baseline screenshots
    - Run `test:visual:update` to capture and store all baseline images
    - Verify baselines are stored in `tests/visual/__baselines__/` and can be committed to version control
    - Run `test:visual` to confirm all tests pass against freshly generated baselines
    - _Requirements: 7.6, 7.7_

- [x] 13. Final checkpoint - Full pipeline validation
  - Ensure all tests pass, ask the user if questions arise.
  - Run `nx run-many -t lint,typecheck,test,build` confirming zero errors across all affected workspaces
  - Verify Storybook build exits cleanly
  - Confirm no new `@ts-ignore`, `eslint-disable`, or `.skip` modifiers without justification comments
  - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7, 20.8_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Requirement 20 (pipeline green) applies to EVERY task — each must independently build and pass all checks
- The design-tokens package must build before ui-core (enforced by Nx dependency graph)
- CSS layer order declaration (`layers.css`) must be imported FIRST in consuming app entry points
- Backward compatibility of TypeScript token objects is maintained via re-exports in `ui-core/src/theme/index.ts`

## Lessons Learned (Post-Implementation)

These discoveries affected the implementation approach and should be understood before executing tasks:

1. **Dark mode CSS**: Remove `@layer` wrapper from `dark.css` and `high-contrast.css` — CSS custom properties don't participate in layer cascade
2. **Module Federation views**: data-dashboard views must use inline styles with `var()` references, NOT ui-core compound components (CSS modules don't transfer across federation boundary)
3. **CSS imports location**: Place design-tokens CSS imports in `__root.tsx`, NOT `main.tsx` (MF bootstrap transform breaks resolution)
4. **Vite aliases**: Use array format `[{ find, replacement }]` with most-specific paths first
5. **npm workspaces**: Use `"*"` not `"workspace:*"` for local package references
6. **ThemeWrapper**: Pass `respectSystemPreference={false}` — feature flag is sole authority for dark mode
7. **Vitest in CI**: Each app's `vitest.config.ts` needs resolve aliases for design-tokens CSS + `css: true`
8. **CI tools**: Pre-install `http-server`, `wait-on`, `concurrently` as devDependencies (don't rely on npx in CI)
9. **Nx in CI**: Use `NX_SKIP_NX_CACHE=true` to avoid incompatible cache artifacts
10. **Visual regression in CI**: Storybook interaction tests via `test-storybook` are unreliable in CI — verify Storybook build instead
11. **ESM configs**: All `vite.config.ts` files in `"type": "module"` packages need `dirname(fileURLToPath(import.meta.url))` instead of `__dirname`
12. **Security ESLint config**: Must register `jsx-a11y` plugin (even without enabling rules) to avoid "Definition for rule not found" errors from inline disable comments

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3"] },
    { "id": 3, "tasks": ["2.4", "2.5", "4.1"] },
    { "id": 4, "tasks": ["4.2"] },
    { "id": 5, "tasks": ["4.3", "4.4", "5.1"] },
    { "id": 6, "tasks": ["5.2", "5.3"] },
    { "id": 7, "tasks": ["5.4", "5.5"] },
    { "id": 8, "tasks": ["5.6", "7.1"] },
    { "id": 9, "tasks": ["7.2", "7.3"] },
    { "id": 10, "tasks": ["8.1"] },
    { "id": 11, "tasks": ["9.1"] },
    { "id": 12, "tasks": ["9.2", "11.1"] },
    { "id": 13, "tasks": ["11.2"] },
    { "id": 14, "tasks": ["12.1"] },
    { "id": 15, "tasks": ["12.2"] },
    { "id": 16, "tasks": ["12.3"] }
  ]
}
```
