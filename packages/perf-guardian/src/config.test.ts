import { describe, it, expect, vi, afterEach } from 'vitest';
import { join } from 'node:path';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';

import { parseConfig } from './config.js';

describe('parseConfig', () => {
  let tempDir: string;

  function createTempDir() {
    tempDir = mkdtempSync(join(tmpdir(), 'perf-guardian-test-'));
    return tempDir;
  }

  afterEach(() => {
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('valid config', () => {
    it('should parse a valid config with budgets only', () => {
      const dir = createTempDir();
      const configPath = join(dir, 'config.json');
      writeFileSync(
        configPath,
        JSON.stringify({
          budgets: [
            { artifactGlob: 'dist/**/*.js', maxSizeKb: 100 },
            { artifactGlob: 'dist/**/*.css', maxSizeKb: 50 },
          ],
        })
      );

      const result = parseConfig(configPath);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.config.budgets).toHaveLength(2);
        expect(result.config.budgets[0]).toEqual({
          artifactGlob: 'dist/**/*.js',
          maxSizeKb: 100,
        });
        expect(result.config.budgets[1]).toEqual({
          artifactGlob: 'dist/**/*.css',
          maxSizeKb: 50,
        });
      }
    });

    it('should parse a valid config with budgets and treeShakingThresholds', () => {
      const dir = createTempDir();
      const configPath = join(dir, 'config.json');
      writeFileSync(
        configPath,
        JSON.stringify({
          budgets: [{ artifactGlob: 'dist/**/*.js', maxSizeKb: 200 }],
          treeShakingThresholds: [
            { library: 'ui-core', maxExpectedSizeKb: 10 },
            { library: 'mock-engine', maxExpectedSizeKb: 25 },
          ],
        })
      );

      const result = parseConfig(configPath);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.config.budgets).toHaveLength(1);
        expect(result.config.treeShakingThresholds).toHaveLength(2);
        expect(result.config.treeShakingThresholds![0]).toEqual({
          library: 'ui-core',
          maxExpectedSizeKb: 10,
        });
      }
    });

    it('should accept an empty budgets array', () => {
      const dir = createTempDir();
      const configPath = join(dir, 'config.json');
      writeFileSync(configPath, JSON.stringify({ budgets: [] }));

      const result = parseConfig(configPath);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.config.budgets).toEqual([]);
      }
    });

    it('should accept maxSizeKb of 0', () => {
      const dir = createTempDir();
      const configPath = join(dir, 'config.json');
      writeFileSync(
        configPath,
        JSON.stringify({
          budgets: [{ artifactGlob: 'dist/**/*.map', maxSizeKb: 0 }],
        })
      );

      const result = parseConfig(configPath);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.config.budgets[0].maxSizeKb).toBe(0);
      }
    });
  });

  describe('missing config file', () => {
    it('should return error when config file does not exist', () => {
      const result = parseConfig('/nonexistent/path/config.json');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Config file not found');
        expect(result.error).toContain('/nonexistent/path/config.json');
      }
    });
  });

  describe('invalid JSON', () => {
    it('should return error for malformed JSON', () => {
      const dir = createTempDir();
      const configPath = join(dir, 'config.json');
      writeFileSync(configPath, '{ invalid json content !!!');

      const result = parseConfig(configPath);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid JSON');
        expect(result.error).toContain(configPath);
      }
    });

    it('should return error for empty file', () => {
      const dir = createTempDir();
      const configPath = join(dir, 'config.json');
      writeFileSync(configPath, '');

      const result = parseConfig(configPath);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid JSON');
      }
    });

    it('should return error for truncated JSON', () => {
      const dir = createTempDir();
      const configPath = join(dir, 'config.json');
      writeFileSync(configPath, '{"budgets": [{"artifactGlob": "dist/**/*.js"');

      const result = parseConfig(configPath);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid JSON');
      }
    });
  });

  describe('invalid config structure', () => {
    it('should return error when budgets field is missing', () => {
      const dir = createTempDir();
      const configPath = join(dir, 'config.json');
      writeFileSync(configPath, JSON.stringify({ other: 'stuff' }));

      const result = parseConfig(configPath);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid config structure');
      }
    });

    it('should return error when budgets is not an array', () => {
      const dir = createTempDir();
      const configPath = join(dir, 'config.json');
      writeFileSync(configPath, JSON.stringify({ budgets: 'not-an-array' }));

      const result = parseConfig(configPath);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid config structure');
      }
    });

    it('should return error when a budget entry is missing artifactGlob', () => {
      const dir = createTempDir();
      const configPath = join(dir, 'config.json');
      writeFileSync(
        configPath,
        JSON.stringify({ budgets: [{ maxSizeKb: 100 }] })
      );

      const result = parseConfig(configPath);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid config structure');
      }
    });

    it('should return error when a budget entry has non-string artifactGlob', () => {
      const dir = createTempDir();
      const configPath = join(dir, 'config.json');
      writeFileSync(
        configPath,
        JSON.stringify({ budgets: [{ artifactGlob: 123, maxSizeKb: 100 }] })
      );

      const result = parseConfig(configPath);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid config structure');
      }
    });

    it('should return error when a budget entry has negative maxSizeKb', () => {
      const dir = createTempDir();
      const configPath = join(dir, 'config.json');
      writeFileSync(
        configPath,
        JSON.stringify({
          budgets: [{ artifactGlob: 'dist/**/*.js', maxSizeKb: -1 }],
        })
      );

      const result = parseConfig(configPath);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid config structure');
      }
    });

    it('should return error when a budget entry has non-number maxSizeKb', () => {
      const dir = createTempDir();
      const configPath = join(dir, 'config.json');
      writeFileSync(
        configPath,
        JSON.stringify({
          budgets: [{ artifactGlob: 'dist/**/*.js', maxSizeKb: 'large' }],
        })
      );

      const result = parseConfig(configPath);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid config structure');
      }
    });

    it('should return error when treeShakingThresholds is not an array', () => {
      const dir = createTempDir();
      const configPath = join(dir, 'config.json');
      writeFileSync(
        configPath,
        JSON.stringify({
          budgets: [],
          treeShakingThresholds: 'not-an-array',
        })
      );

      const result = parseConfig(configPath);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid config structure');
      }
    });

    it('should return error when a tree-shaking entry has non-string library', () => {
      const dir = createTempDir();
      const configPath = join(dir, 'config.json');
      writeFileSync(
        configPath,
        JSON.stringify({
          budgets: [],
          treeShakingThresholds: [{ library: 42, maxExpectedSizeKb: 10 }],
        })
      );

      const result = parseConfig(configPath);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid config structure');
      }
    });

    it('should return error when a tree-shaking entry has negative maxExpectedSizeKb', () => {
      const dir = createTempDir();
      const configPath = join(dir, 'config.json');
      writeFileSync(
        configPath,
        JSON.stringify({
          budgets: [],
          treeShakingThresholds: [
            { library: 'ui-core', maxExpectedSizeKb: -5 },
          ],
        })
      );

      const result = parseConfig(configPath);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid config structure');
      }
    });

    it('should return error when config value is null', () => {
      const dir = createTempDir();
      const configPath = join(dir, 'config.json');
      writeFileSync(configPath, 'null');

      const result = parseConfig(configPath);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid config structure');
      }
    });

    it('should return error when config is a primitive value', () => {
      const dir = createTempDir();
      const configPath = join(dir, 'config.json');
      writeFileSync(configPath, '42');

      const result = parseConfig(configPath);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid config structure');
      }
    });
  });
});
