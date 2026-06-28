import { useLayoutEffect, useRef } from 'react';

import styles from './ThemeProvider.module.css';

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

const VALID_THEMES = ['light', 'dark'] as const;
type ValidTheme = (typeof VALID_THEMES)[number];

function isValidTheme(value: string | undefined): value is ValidTheme {
  return VALID_THEMES.includes(value as ValidTheme);
}

function resolveTheme(
  isDarkMode: boolean,
  respectSystemPreference: boolean
): ValidTheme {
  if (isDarkMode) {
    return 'dark';
  }

  if (respectSystemPreference && typeof window !== 'undefined') {
    const systemPrefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    if (systemPrefersDark) {
      return 'dark';
    }
  }

  return 'light';
}

export function ThemeProvider({
  children,
  isDarkMode,
  respectSystemPreference = true,
}: ThemeProviderProps): React.ReactElement {
  const currentThemeRef = useRef<ValidTheme>('light');

  // Synchronously set theme on mount and when isDarkMode changes
  useLayoutEffect(() => {
    const theme = resolveTheme(isDarkMode, respectSystemPreference);
    currentThemeRef.current = theme;
    document.documentElement.dataset.theme = theme;
  }, [isDarkMode, respectSystemPreference]);

  // Inject transition class on the document element for smooth theme changes
  useLayoutEffect(() => {
    const root = document.documentElement;
    const transitionClass = styles['themeTransition'];
    if (transitionClass) {
      root.classList.add(transitionClass);
    }

    return () => {
      if (transitionClass) {
        root.classList.remove(transitionClass);
      }
    };
  }, []);

  // Observe mutations to data-theme and reset invalid values (Req 9.5)
  useLayoutEffect(() => {
    const root = document.documentElement;

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-theme'
        ) {
          const currentValue = root.dataset.theme;
          if (!isValidTheme(currentValue)) {
            // Reset to the last known valid theme
            root.dataset.theme = currentThemeRef.current;
          }
        }
      }
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return <>{children}</>;
}
