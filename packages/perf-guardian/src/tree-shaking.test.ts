import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { analyzeTreeShaking } from './tree-shaking.js';

import type { TreeShakingEntry } from './types.js';

// Mock fast-glob and fs
vi.mock('fast-glob', () => ({
  default: { sync: vi.fn() },
}));

vi.mock('node:fs', () => ({
  statSync: vi.fn(),
}));

// eslint-disable-next-line import-x/order
import fg from 'fast-glob';
// eslint-disable-next-line import-x/order
import { statSync } from 'node:fs';

const mockFgSync = fg.sync as ReturnType<typeof vi.fn>;
const mockStatSync = statSync as ReturnType<typeof vi.fn>;

describe('analyzeTreeShaking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return pass when smallest artifact is under threshold', () => {
    const thresholds: TreeShakingEntry[] = [
      { library: 'ui-core', maxExpectedSizeKb: 10 },
    ];

    // First call: packages/ui-core/dist/esm/*.js
    mockFgSync.mockReturnValueOnce([
      '/project/packages/ui-core/dist/esm/Button.js',
      '/project/packages/ui-core/dist/esm/Card.js',
      '/project/packages/ui-core/dist/esm/Table.js',
    ]);

    mockStatSync
      .mockReturnValueOnce({ size: 5120 }) // Button.js = 5 KB
      .mockReturnValueOnce({ size: 8192 }) // Card.js = 8 KB
      .mockReturnValueOnce({ size: 3072 }); // Table.js = 3 KB

    const results = analyzeTreeShaking(thresholds, '/project');

    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({
      name: 'tree-shaking:ui-core',
      measuredSizeKb: 3,
      budgetThresholdKb: 10,
      status: 'pass',
      overageKb: null,
    });
  });

  it('should return fail when smallest artifact exceeds threshold', () => {
    const thresholds: TreeShakingEntry[] = [
      { library: 'ui-core', maxExpectedSizeKb: 2 },
    ];

    mockFgSync.mockReturnValueOnce([
      '/project/packages/ui-core/dist/esm/Button.js',
      '/project/packages/ui-core/dist/esm/Card.js',
    ]);

    mockStatSync
      .mockReturnValueOnce({ size: 5120 }) // Button.js = 5 KB
      .mockReturnValueOnce({ size: 3072 }); // Card.js = 3 KB

    const results = analyzeTreeShaking(thresholds, '/project');

    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({
      name: 'tree-shaking:ui-core',
      measuredSizeKb: 3,
      budgetThresholdKb: 2,
      status: 'fail',
      overageKb: 1,
    });
  });

  it('should fallback to dist/*.js when dist/esm/ is empty', () => {
    const thresholds: TreeShakingEntry[] = [
      { library: 'ui-core', maxExpectedSizeKb: 10 },
    ];

    // First call: packages/ui-core/dist/esm/*.js - no files
    mockFgSync.mockReturnValueOnce([]);
    // Second call: packages/ui-core/dist/*.js - has files
    mockFgSync.mockReturnValueOnce([
      '/project/packages/ui-core/dist/Button.js',
    ]);

    mockStatSync.mockReturnValueOnce({ size: 2048 }); // 2 KB

    const results = analyzeTreeShaking(thresholds, '/project');

    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({
      name: 'tree-shaking:ui-core',
      measuredSizeKb: 2,
      budgetThresholdKb: 10,
      status: 'pass',
      overageKb: null,
    });
  });

  it('should handle no artifacts found gracefully', () => {
    const thresholds: TreeShakingEntry[] = [
      { library: 'nonexistent-lib', maxExpectedSizeKb: 10 },
    ];

    mockFgSync.mockReturnValueOnce([]); // dist/esm/*.js
    mockFgSync.mockReturnValueOnce([]); // dist/*.js

    const results = analyzeTreeShaking(thresholds, '/project');

    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({
      name: 'tree-shaking:nonexistent-lib (no artifacts found)',
      measuredSizeKb: 0,
      budgetThresholdKb: 10,
      status: 'pass',
      overageKb: null,
    });
  });

  it('should analyze multiple libraries independently', () => {
    const thresholds: TreeShakingEntry[] = [
      { library: 'ui-core', maxExpectedSizeKb: 5 },
      { library: 'mock-engine', maxExpectedSizeKb: 20 },
    ];

    // ui-core
    mockFgSync.mockReturnValueOnce([
      '/project/packages/ui-core/dist/esm/Button.js',
    ]);
    // mock-engine
    mockFgSync.mockReturnValueOnce([
      '/project/packages/mock-engine/dist/esm/handlers.js',
      '/project/packages/mock-engine/dist/esm/setup.js',
    ]);

    mockStatSync
      .mockReturnValueOnce({ size: 4096 }) // ui-core Button.js = 4 KB
      .mockReturnValueOnce({ size: 30720 }) // mock-engine handlers.js = 30 KB
      .mockReturnValueOnce({ size: 10240 }); // mock-engine setup.js = 10 KB

    const results = analyzeTreeShaking(thresholds, '/project');

    expect(results).toHaveLength(2);
    expect(results[0].status).toBe('pass');
    expect(results[0].measuredSizeKb).toBe(4);
    expect(results[1].status).toBe('pass');
    expect(results[1].measuredSizeKb).toBe(10);
  });

  it('should produce correct JSON output shape per spec', () => {
    const thresholds: TreeShakingEntry[] = [
      { library: 'ui-core', maxExpectedSizeKb: 3 },
    ];

    mockFgSync.mockReturnValueOnce([
      '/project/packages/ui-core/dist/esm/Button.js',
    ]);
    mockStatSync.mockReturnValueOnce({ size: 5120 }); // 5 KB

    const results = analyzeTreeShaking(thresholds, '/project');
    const report = results[0];

    // Validate all required fields exist per spec: name, measuredSizeKb, budgetThresholdKb, status, overageKb
    expect(report).toHaveProperty('name');
    expect(report).toHaveProperty('measuredSizeKb');
    expect(report).toHaveProperty('budgetThresholdKb');
    expect(report).toHaveProperty('status');
    expect(report).toHaveProperty('overageKb');
    expect(typeof report.name).toBe('string');
    expect(typeof report.measuredSizeKb).toBe('number');
    expect(typeof report.budgetThresholdKb).toBe('number');
    expect(['pass', 'fail']).toContain(report.status);
    expect(report.overageKb).toBe(2);
  });

  it('should skip files that cannot be stat\'d', () => {
    const thresholds: TreeShakingEntry[] = [
      { library: 'ui-core', maxExpectedSizeKb: 10 },
    ];

    mockFgSync.mockReturnValueOnce([
      '/project/packages/ui-core/dist/esm/Button.js',
      '/project/packages/ui-core/dist/esm/Broken.js',
    ]);

    mockStatSync
      .mockReturnValueOnce({ size: 2048 }) // Button.js = 2 KB
      .mockImplementationOnce(() => {
        throw new Error('ENOENT');
      });

    const results = analyzeTreeShaking(thresholds, '/project');

    expect(results[0].measuredSizeKb).toBe(2);
    expect(results[0].status).toBe('pass');
  });
});
