import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { analyzeBudgets } from './analyzer.js';

import type { BudgetEntry } from './types.js';

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

describe('analyzeBudgets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('budget pass/fail logic', () => {
    it('should pass when measured size equals threshold exactly', () => {
      const budgets: BudgetEntry[] = [
        { artifactGlob: 'dist/**/*.js', maxSizeKb: 10 },
      ];

      mockFgSync.mockReturnValueOnce(['/project/dist/main.js']);
      // 10 KB exactly = 10240 bytes
      mockStatSync.mockReturnValueOnce({ size: 10240 });

      const output = analyzeBudgets(budgets, '/project');

      expect(output.artifacts[0].status).toBe('pass');
      expect(output.artifacts[0].overageKb).toBeNull();
      expect(output.overallStatus).toBe('pass');
    });

    it('should pass when measured size is below threshold', () => {
      const budgets: BudgetEntry[] = [
        { artifactGlob: 'dist/**/*.js', maxSizeKb: 100 },
      ];

      mockFgSync.mockReturnValueOnce(['/project/dist/app.js']);
      // 50 KB = 51200 bytes
      mockStatSync.mockReturnValueOnce({ size: 51200 });

      const output = analyzeBudgets(budgets, '/project');

      expect(output.artifacts[0].status).toBe('pass');
      expect(output.artifacts[0].measuredSizeKb).toBe(50);
      expect(output.artifacts[0].overageKb).toBeNull();
    });

    it('should fail when measured size exceeds threshold', () => {
      const budgets: BudgetEntry[] = [
        { artifactGlob: 'dist/**/*.js', maxSizeKb: 50 },
      ];

      mockFgSync.mockReturnValueOnce(['/project/dist/bundle.js']);
      // 75 KB = 76800 bytes
      mockStatSync.mockReturnValueOnce({ size: 76800 });

      const output = analyzeBudgets(budgets, '/project');

      expect(output.artifacts[0].status).toBe('fail');
      expect(output.artifacts[0].measuredSizeKb).toBe(75);
      expect(output.artifacts[0].overageKb).toBe(25);
      expect(output.overallStatus).toBe('fail');
    });

    it('should compute overage with 1 decimal precision', () => {
      const budgets: BudgetEntry[] = [
        { artifactGlob: 'dist/**/*.js', maxSizeKb: 10 },
      ];

      mockFgSync.mockReturnValueOnce(['/project/dist/main.js']);
      // 10.7 KB = 10.7 * 1024 = 10956.8 bytes
      mockStatSync.mockReturnValueOnce({ size: 10957 });

      const output = analyzeBudgets(budgets, '/project');

      expect(output.artifacts[0].status).toBe('fail');
      expect(output.artifacts[0].measuredSizeKb).toBe(10.7);
      expect(output.artifacts[0].overageKb).toBe(0.7);
    });

    it('should sum multiple files matching the same glob', () => {
      const budgets: BudgetEntry[] = [
        { artifactGlob: 'dist/**/*.js', maxSizeKb: 20 },
      ];

      mockFgSync.mockReturnValueOnce([
        '/project/dist/chunk-a.js',
        '/project/dist/chunk-b.js',
        '/project/dist/chunk-c.js',
      ]);
      mockStatSync
        .mockReturnValueOnce({ size: 5120 }) // 5 KB
        .mockReturnValueOnce({ size: 8192 }) // 8 KB
        .mockReturnValueOnce({ size: 10240 }); // 10 KB
      // total = 23 KB

      const output = analyzeBudgets(budgets, '/project');

      expect(output.artifacts[0].measuredSizeKb).toBe(23);
      expect(output.artifacts[0].status).toBe('fail');
      expect(output.artifacts[0].overageKb).toBe(3);
    });

    it('should report 0 KB when no files match the glob', () => {
      const budgets: BudgetEntry[] = [
        { artifactGlob: 'dist/**/*.js', maxSizeKb: 50 },
      ];

      mockFgSync.mockReturnValueOnce([]);

      const output = analyzeBudgets(budgets, '/project');

      expect(output.artifacts[0].measuredSizeKb).toBe(0);
      expect(output.artifacts[0].status).toBe('pass');
      expect(output.artifacts[0].overageKb).toBeNull();
    });

    it('should skip files that cannot be stat\'d without crashing', () => {
      const budgets: BudgetEntry[] = [
        { artifactGlob: 'dist/**/*.js', maxSizeKb: 20 },
      ];

      mockFgSync.mockReturnValueOnce([
        '/project/dist/good.js',
        '/project/dist/broken.js',
      ]);
      mockStatSync
        .mockReturnValueOnce({ size: 5120 }) // 5 KB
        .mockImplementationOnce(() => {
          throw new Error('ENOENT');
        });

      const output = analyzeBudgets(budgets, '/project');

      expect(output.artifacts[0].measuredSizeKb).toBe(5);
      expect(output.artifacts[0].status).toBe('pass');
    });
  });

  describe('multiple budget entries', () => {
    it('should analyze each budget entry independently', () => {
      const budgets: BudgetEntry[] = [
        { artifactGlob: 'dist/**/*.js', maxSizeKb: 100 },
        { artifactGlob: 'dist/**/*.css', maxSizeKb: 30 },
      ];

      // First glob: JS files
      mockFgSync.mockReturnValueOnce(['/project/dist/app.js']);
      // Second glob: CSS files
      mockFgSync.mockReturnValueOnce(['/project/dist/style.css']);

      mockStatSync
        .mockReturnValueOnce({ size: 51200 }) // 50 KB JS
        .mockReturnValueOnce({ size: 40960 }); // 40 KB CSS

      const output = analyzeBudgets(budgets, '/project');

      expect(output.artifacts).toHaveLength(2);
      expect(output.artifacts[0].status).toBe('pass'); // 50 <= 100
      expect(output.artifacts[1].status).toBe('fail'); // 40 > 30
      expect(output.artifacts[1].overageKb).toBe(10);
    });

    it('should set overallStatus to fail if any artifact fails', () => {
      const budgets: BudgetEntry[] = [
        { artifactGlob: 'dist/a.js', maxSizeKb: 100 },
        { artifactGlob: 'dist/b.js', maxSizeKb: 5 },
        { artifactGlob: 'dist/c.js', maxSizeKb: 100 },
      ];

      mockFgSync
        .mockReturnValueOnce(['/project/dist/a.js'])
        .mockReturnValueOnce(['/project/dist/b.js'])
        .mockReturnValueOnce(['/project/dist/c.js']);

      mockStatSync
        .mockReturnValueOnce({ size: 1024 }) // 1 KB - pass
        .mockReturnValueOnce({ size: 10240 }) // 10 KB - fail (> 5)
        .mockReturnValueOnce({ size: 2048 }); // 2 KB - pass

      const output = analyzeBudgets(budgets, '/project');

      expect(output.overallStatus).toBe('fail');
      expect(output.artifacts[0].status).toBe('pass');
      expect(output.artifacts[1].status).toBe('fail');
      expect(output.artifacts[2].status).toBe('pass');
    });

    it('should set overallStatus to pass if all artifacts pass', () => {
      const budgets: BudgetEntry[] = [
        { artifactGlob: 'dist/a.js', maxSizeKb: 100 },
        { artifactGlob: 'dist/b.js', maxSizeKb: 100 },
      ];

      mockFgSync
        .mockReturnValueOnce(['/project/dist/a.js'])
        .mockReturnValueOnce(['/project/dist/b.js']);

      mockStatSync
        .mockReturnValueOnce({ size: 1024 }) // 1 KB
        .mockReturnValueOnce({ size: 2048 }); // 2 KB

      const output = analyzeBudgets(budgets, '/project');

      expect(output.overallStatus).toBe('pass');
    });
  });

  describe('output structure', () => {
    it('should include a valid ISO 8601 timestamp', () => {
      const budgets: BudgetEntry[] = [
        { artifactGlob: 'dist/**/*.js', maxSizeKb: 100 },
      ];

      mockFgSync.mockReturnValueOnce([]);

      const output = analyzeBudgets(budgets, '/project');

      expect(output.timestamp).toBeDefined();
      // Verify ISO 8601 format by attempting to parse
      const parsed = new Date(output.timestamp);
      expect(parsed.toISOString()).toBe(output.timestamp);
    });

    it('should populate all required fields in each artifact report', () => {
      const budgets: BudgetEntry[] = [
        { artifactGlob: 'dist/**/*.js', maxSizeKb: 50 },
      ];

      mockFgSync.mockReturnValueOnce(['/project/dist/app.js']);
      mockStatSync.mockReturnValueOnce({ size: 61440 }); // 60 KB

      const output = analyzeBudgets(budgets, '/project');
      const artifact = output.artifacts[0];

      expect(artifact.name).toBe('dist/**/*.js');
      expect(artifact.measuredSizeKb).toBe(60);
      expect(artifact.budgetThresholdKb).toBe(50);
      expect(artifact.status).toBe('fail');
      expect(artifact.overageKb).toBe(10);
    });

    it('should set overageKb to null for passing artifacts', () => {
      const budgets: BudgetEntry[] = [
        { artifactGlob: 'dist/**/*.js', maxSizeKb: 100 },
      ];

      mockFgSync.mockReturnValueOnce(['/project/dist/app.js']);
      mockStatSync.mockReturnValueOnce({ size: 10240 }); // 10 KB

      const output = analyzeBudgets(budgets, '/project');

      expect(output.artifacts[0].overageKb).toBeNull();
    });

    it('should use the artifact glob as the name', () => {
      const budgets: BudgetEntry[] = [
        { artifactGlob: 'apps/host-shell/dist/**/*.js', maxSizeKb: 200 },
      ];

      mockFgSync.mockReturnValueOnce([]);

      const output = analyzeBudgets(budgets, '/project');

      expect(output.artifacts[0].name).toBe('apps/host-shell/dist/**/*.js');
    });
  });

  describe('edge cases', () => {
    it('should handle empty budgets array', () => {
      const output = analyzeBudgets([], '/project');

      expect(output.artifacts).toHaveLength(0);
      expect(output.overallStatus).toBe('pass');
    });

    it('should handle very small files (< 0.1 KB) rounding to 0', () => {
      const budgets: BudgetEntry[] = [
        { artifactGlob: 'dist/**/*.js', maxSizeKb: 1 },
      ];

      mockFgSync.mockReturnValueOnce(['/project/dist/tiny.js']);
      // 10 bytes ≈ 0.0097... KB, rounds to 0.0
      mockStatSync.mockReturnValueOnce({ size: 10 });

      const output = analyzeBudgets(budgets, '/project');

      expect(output.artifacts[0].measuredSizeKb).toBe(0);
      expect(output.artifacts[0].status).toBe('pass');
    });

    it('should handle budget threshold of 0', () => {
      const budgets: BudgetEntry[] = [
        { artifactGlob: 'dist/**/*.js', maxSizeKb: 0 },
      ];

      mockFgSync.mockReturnValueOnce(['/project/dist/app.js']);
      mockStatSync.mockReturnValueOnce({ size: 1024 }); // 1 KB

      const output = analyzeBudgets(budgets, '/project');

      expect(output.artifacts[0].status).toBe('fail');
      expect(output.artifacts[0].overageKb).toBe(1);
    });
  });
});
