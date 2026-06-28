import { render, cleanup } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ThemeProvider } from '../providers/ThemeProvider';

// Helper to reset document state between tests
function resetDocument() {
  document.documentElement.dataset.theme = '';
  delete document.documentElement.dataset.theme;
  document.documentElement.className = '';
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    resetDocument();
  });

  afterEach(() => {
    cleanup();
    resetDocument();
  });

  // ─── Requirement 3.1: data-theme="dark" when isDarkMode is true ────────────

  describe('data-theme attribute (Req 3.1, 3.2)', () => {
    it('sets data-theme to "dark" when isDarkMode is true', () => {
      render(
        <ThemeProvider isDarkMode={true} respectSystemPreference={false}>
          <div>child</div>
        </ThemeProvider>,
      );
      expect(document.documentElement.dataset.theme).toBe('dark');
    });

    it('sets data-theme to "light" when isDarkMode is false', () => {
      render(
        <ThemeProvider isDarkMode={false} respectSystemPreference={false}>
          <div>child</div>
        </ThemeProvider>,
      );
      expect(document.documentElement.dataset.theme).toBe('light');
    });

    it('updates data-theme when isDarkMode prop changes', () => {
      const { rerender } = render(
        <ThemeProvider isDarkMode={false} respectSystemPreference={false}>
          <div>child</div>
        </ThemeProvider>,
      );
      expect(document.documentElement.dataset.theme).toBe('light');

      rerender(
        <ThemeProvider isDarkMode={true} respectSystemPreference={false}>
          <div>child</div>
        </ThemeProvider>,
      );
      expect(document.documentElement.dataset.theme).toBe('dark');
    });
  });

  // ─── Requirement 3.4: System preference detection ─────────────────────────

  describe('system preference detection (Req 3.4)', () => {
    it('detects prefers-color-scheme: dark when respectSystemPreference is true and isDarkMode is false', () => {
      const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      vi.stubGlobal('matchMedia', matchMediaMock);

      render(
        <ThemeProvider isDarkMode={false} respectSystemPreference={true}>
          <div>child</div>
        </ThemeProvider>,
      );
      expect(document.documentElement.dataset.theme).toBe('dark');

      vi.unstubAllGlobals();
    });

    it('defaults to light when system does not prefer dark and isDarkMode is false', () => {
      const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      vi.stubGlobal('matchMedia', matchMediaMock);

      render(
        <ThemeProvider isDarkMode={false} respectSystemPreference={true}>
          <div>child</div>
        </ThemeProvider>,
      );
      expect(document.documentElement.dataset.theme).toBe('light');

      vi.unstubAllGlobals();
    });

    it('ignores system preference when respectSystemPreference is false', () => {
      const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      vi.stubGlobal('matchMedia', matchMediaMock);

      render(
        <ThemeProvider isDarkMode={false} respectSystemPreference={false}>
          <div>child</div>
        </ThemeProvider>,
      );
      expect(document.documentElement.dataset.theme).toBe('light');

      vi.unstubAllGlobals();
    });

    it('isDarkMode=true takes precedence over system preference', () => {
      const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
        matches: false, // system prefers light
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      vi.stubGlobal('matchMedia', matchMediaMock);

      render(
        <ThemeProvider isDarkMode={true} respectSystemPreference={true}>
          <div>child</div>
        </ThemeProvider>,
      );
      expect(document.documentElement.dataset.theme).toBe('dark');

      vi.unstubAllGlobals();
    });
  });

  // ─── Requirement 9.2: prefers-reduced-motion disables transitions ─────────

  describe('prefers-reduced-motion (Req 9.2)', () => {
    it('theme transition class is added to document element', () => {
      render(
        <ThemeProvider isDarkMode={false} respectSystemPreference={false}>
          <div>child</div>
        </ThemeProvider>,
      );
      // The ThemeProvider adds a CSS module class for transitions
      // We verify the document element has at least one class added
      expect(document.documentElement.classList.length).toBeGreaterThan(0);
    });

    it('theme transition class is removed on unmount', () => {
      const { unmount } = render(
        <ThemeProvider isDarkMode={false} respectSystemPreference={false}>
          <div>child</div>
        </ThemeProvider>,
      );

      expect(document.documentElement.classList.length).toBeGreaterThan(0);
      unmount();
      expect(document.documentElement.classList.length).toBe(0);
    });
  });

  // ─── Requirement 9.5: Invalid theme value handling ─────────────────────────

  describe('invalid theme value handling (Req 9.5)', () => {
    it('resets invalid data-theme value back to current valid theme', async () => {
      render(
        <ThemeProvider isDarkMode={false} respectSystemPreference={false}>
          <div>child</div>
        </ThemeProvider>,
      );
      expect(document.documentElement.dataset.theme).toBe('light');

      // Programmatically set an invalid theme
      document.documentElement.dataset.theme = 'invalid-theme';

      // MutationObserver callbacks are async in jsdom, wait for microtask
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(document.documentElement.dataset.theme).toBe('light');
    });

    it('resets empty string data-theme value back to current valid theme', async () => {
      render(
        <ThemeProvider isDarkMode={true} respectSystemPreference={false}>
          <div>child</div>
        </ThemeProvider>,
      );
      expect(document.documentElement.dataset.theme).toBe('dark');

      // Set to empty string (invalid)
      document.documentElement.dataset.theme = '';

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(document.documentElement.dataset.theme).toBe('dark');
    });

    it('allows valid "dark" value to be set externally without reset', async () => {
      render(
        <ThemeProvider isDarkMode={false} respectSystemPreference={false}>
          <div>child</div>
        </ThemeProvider>,
      );
      expect(document.documentElement.dataset.theme).toBe('light');

      // Setting a valid value externally — observer should not reset it
      document.documentElement.dataset.theme = 'dark';

      await new Promise((resolve) => setTimeout(resolve, 0));

      // The observer sees 'dark' as valid so it won't reset
      expect(document.documentElement.dataset.theme).toBe('dark');
    });

    it('allows valid "light" value to be set externally without reset', async () => {
      render(
        <ThemeProvider isDarkMode={true} respectSystemPreference={false}>
          <div>child</div>
        </ThemeProvider>,
      );
      expect(document.documentElement.dataset.theme).toBe('dark');

      document.documentElement.dataset.theme = 'light';

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(document.documentElement.dataset.theme).toBe('light');
    });

    it('resets random string values to current theme', async () => {
      render(
        <ThemeProvider isDarkMode={true} respectSystemPreference={false}>
          <div>child</div>
        </ThemeProvider>,
      );

      document.documentElement.dataset.theme = 'neon-purple';

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(document.documentElement.dataset.theme).toBe('dark');
    });
  });

  // ─── Children rendering ────────────────────────────────────────────────────

  describe('children rendering', () => {
    it('renders children content', () => {
      const { getByText } = render(
        <ThemeProvider isDarkMode={false} respectSystemPreference={false}>
          <span>Hello World</span>
        </ThemeProvider>,
      );
      expect(getByText('Hello World')).toBeDefined();
    });
  });
});
