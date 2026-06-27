import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

import { describe, it, expect } from 'vitest';

/**
 * Tree-shaking validation tests for UI_Core.
 *
 * Verifies that each component is built as an independent chunk,
 * meaning importing a single component does NOT pull in code from
 * other components. This validates the multi-entry Vite library build.
 *
 * These tests require the package to be built first (dist/esm/ must exist).
 * They are skipped when the build output is not present (e.g., in CI test
 * jobs that run before the build step).
 */
const distDir = resolve(__dirname, '../../dist/esm');
const distExists = existsSync(distDir);

describe.skipIf(!distExists)('Tree-shaking: component isolation', () => {
  const componentFiles = ['Button.js', 'Card.js', 'Table.js', 'Skeleton.js', 'ErrorBoundary.js'];

  it('each component has its own separate ESM bundle file', () => {
    for (const file of componentFiles) {
      const filePath = resolve(distDir, file);
      const content = readFileSync(filePath, 'utf-8');
      expect(content.length).toBeGreaterThan(0);
    }
  });

  it('Button.js does not reference Card, Table, Skeleton, or ErrorBoundary exports', () => {
    const content = readFileSync(resolve(distDir, 'Button.js'), 'utf-8');
    // Should not contain other component identifiers as exports or class/function names
    expect(content).not.toContain('Card');
    expect(content).not.toContain('Table');
    expect(content).not.toContain('Skeleton');
    expect(content).not.toContain('ErrorBoundary');
  });

  it('Card.js does not reference Button, Table, Skeleton, or ErrorBoundary exports', () => {
    const content = readFileSync(resolve(distDir, 'Card.js'), 'utf-8');
    expect(content).not.toContain('Button');
    expect(content).not.toContain('Table');
    expect(content).not.toContain('Skeleton');
    expect(content).not.toContain('ErrorBoundary');
  });

  it('Table.js does not reference Button, Card, Skeleton, or ErrorBoundary exports', () => {
    const content = readFileSync(resolve(distDir, 'Table.js'), 'utf-8');
    expect(content).not.toContain('Button');
    expect(content).not.toContain('Card');
    expect(content).not.toContain('Skeleton');
    expect(content).not.toContain('ErrorBoundary');
  });

  it('Skeleton.js does not reference Button, Card, Table, or ErrorBoundary exports', () => {
    const content = readFileSync(resolve(distDir, 'Skeleton.js'), 'utf-8');
    expect(content).not.toContain('Button');
    expect(content).not.toContain('Card');
    expect(content).not.toContain('Table');
    expect(content).not.toContain('ErrorBoundary');
  });

  it('ErrorBoundary.js does not reference Button, Card, Table, or Skeleton exports', () => {
    const content = readFileSync(resolve(distDir, 'ErrorBoundary.js'), 'utf-8');
    expect(content).not.toContain('Button');
    expect(content).not.toContain('Card');
    expect(content).not.toContain('Table');
    expect(content).not.toContain('Skeleton');
  });

  it('theme.js is independent from all components', () => {
    const content = readFileSync(resolve(distDir, 'theme.js'), 'utf-8');
    expect(content).not.toContain('Button');
    expect(content).not.toContain('Card');
    expect(content).not.toContain('Table');
    expect(content).not.toContain('Skeleton');
    expect(content).not.toContain('ErrorBoundary');
  });
});
