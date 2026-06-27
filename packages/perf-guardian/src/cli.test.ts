import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { formatOutput } from './cli.js';

import type { PerfGuardianOutput } from './types.js';

describe('formatOutput', () => {
  const originalIsTTY = process.stdout.isTTY;

  afterEach(() => {
    Object.defineProperty(process.stdout, 'isTTY', { value: originalIsTTY, writable: true });
  });

  describe('JSON output structure', () => {
    it('should produce valid JSON output from PerfGuardianOutput', () => {
      const output: PerfGuardianOutput = {
        timestamp: '2024-01-15T10:30:00.000Z',
        artifacts: [
          {
            name: 'dist/**/*.js',
            measuredSizeKb: 45.2,
            budgetThresholdKb: 50,
            status: 'pass',
            overageKb: null,
          },
          {
            name: 'dist/**/*.css',
            measuredSizeKb: 35.8,
            budgetThresholdKb: 30,
            status: 'fail',
            overageKb: 5.8,
          },
        ],
        overallStatus: 'fail',
      };

      // Verify JSON serialization works correctly
      const json = JSON.stringify(output, null, 2);
      const parsed = JSON.parse(json);

      expect(parsed.timestamp).toBe('2024-01-15T10:30:00.000Z');
      expect(parsed.artifacts).toHaveLength(2);
      expect(parsed.overallStatus).toBe('fail');

      // Check all required fields on each artifact
      for (const artifact of parsed.artifacts) {
        expect(artifact).toHaveProperty('name');
        expect(artifact).toHaveProperty('measuredSizeKb');
        expect(artifact).toHaveProperty('budgetThresholdKb');
        expect(artifact).toHaveProperty('status');
        expect(artifact).toHaveProperty('overageKb');
        expect(typeof artifact.name).toBe('string');
        expect(typeof artifact.measuredSizeKb).toBe('number');
        expect(typeof artifact.budgetThresholdKb).toBe('number');
        expect(['pass', 'fail']).toContain(artifact.status);
      }
    });

    it('should serialize passing artifact with null overageKb', () => {
      const output: PerfGuardianOutput = {
        timestamp: '2024-01-15T10:30:00.000Z',
        artifacts: [
          {
            name: 'dist/app.js',
            measuredSizeKb: 20,
            budgetThresholdKb: 50,
            status: 'pass',
            overageKb: null,
          },
        ],
        overallStatus: 'pass',
      };

      const json = JSON.stringify(output);
      const parsed = JSON.parse(json);

      expect(parsed.artifacts[0].overageKb).toBeNull();
      expect(parsed.artifacts[0].status).toBe('pass');
    });

    it('should serialize failing artifact with positive overageKb', () => {
      const output: PerfGuardianOutput = {
        timestamp: '2024-01-15T10:30:00.000Z',
        artifacts: [
          {
            name: 'dist/bundle.js',
            measuredSizeKb: 120.5,
            budgetThresholdKb: 100,
            status: 'fail',
            overageKb: 20.5,
          },
        ],
        overallStatus: 'fail',
      };

      const json = JSON.stringify(output);
      const parsed = JSON.parse(json);

      expect(parsed.artifacts[0].overageKb).toBe(20.5);
      expect(parsed.artifacts[0].status).toBe('fail');
    });
  });

  describe('TTY output format', () => {
    beforeEach(() => {
      Object.defineProperty(process.stdout, 'isTTY', { value: true, writable: true });
    });

    it('should include color codes for passing artifacts when TTY', () => {
      const output: PerfGuardianOutput = {
        timestamp: '2024-01-15T10:30:00.000Z',
        artifacts: [
          {
            name: 'dist/app.js',
            measuredSizeKb: 30,
            budgetThresholdKb: 50,
            status: 'pass',
            overageKb: null,
          },
        ],
        overallStatus: 'pass',
      };

      const formatted = formatOutput(output);

      // Green color code for pass
      expect(formatted).toContain('\x1b[32m');
      expect(formatted).toContain('PASS');
      expect(formatted).toContain('dist/app.js');
      expect(formatted).toContain('30 KB / 50 KB');
    });

    it('should include color codes for failing artifacts when TTY', () => {
      const output: PerfGuardianOutput = {
        timestamp: '2024-01-15T10:30:00.000Z',
        artifacts: [
          {
            name: 'dist/bundle.js',
            measuredSizeKb: 75,
            budgetThresholdKb: 50,
            status: 'fail',
            overageKb: 25,
          },
        ],
        overallStatus: 'fail',
      };

      const formatted = formatOutput(output);

      // Red color code for fail
      expect(formatted).toContain('\x1b[31m');
      expect(formatted).toContain('FAIL');
      expect(formatted).toContain('dist/bundle.js');
      expect(formatted).toContain('75 KB / 50 KB');
      expect(formatted).toContain('+25 KB over');
    });

    it('should include colored overall status', () => {
      const passingOutput: PerfGuardianOutput = {
        timestamp: '2024-01-15T10:30:00.000Z',
        artifacts: [],
        overallStatus: 'pass',
      };

      const failingOutput: PerfGuardianOutput = {
        timestamp: '2024-01-15T10:30:00.000Z',
        artifacts: [],
        overallStatus: 'fail',
      };

      const passFmt = formatOutput(passingOutput);
      const failFmt = formatOutput(failingOutput);

      expect(passFmt).toContain('\x1b[32mOverall: PASS\x1b[0m');
      expect(failFmt).toContain('\x1b[31mOverall: FAIL\x1b[0m');
    });
  });

  describe('non-TTY output format', () => {
    beforeEach(() => {
      Object.defineProperty(process.stdout, 'isTTY', { value: undefined, writable: true });
    });

    it('should not include ANSI color codes when not TTY', () => {
      const output: PerfGuardianOutput = {
        timestamp: '2024-01-15T10:30:00.000Z',
        artifacts: [
          {
            name: 'dist/app.js',
            measuredSizeKb: 30,
            budgetThresholdKb: 50,
            status: 'pass',
            overageKb: null,
          },
        ],
        overallStatus: 'pass',
      };

      const formatted = formatOutput(output);

      expect(formatted).not.toContain('\x1b[');
      expect(formatted).toContain('✓ PASS');
      expect(formatted).toContain('dist/app.js');
    });

    it('should display fail without color codes when not TTY', () => {
      const output: PerfGuardianOutput = {
        timestamp: '2024-01-15T10:30:00.000Z',
        artifacts: [
          {
            name: 'dist/bundle.js',
            measuredSizeKb: 75,
            budgetThresholdKb: 50,
            status: 'fail',
            overageKb: 25,
          },
        ],
        overallStatus: 'fail',
      };

      const formatted = formatOutput(output);

      expect(formatted).not.toContain('\x1b[');
      expect(formatted).toContain('✗ FAIL');
      expect(formatted).toContain('Overall: FAIL');
    });
  });

  describe('output content', () => {
    beforeEach(() => {
      Object.defineProperty(process.stdout, 'isTTY', { value: undefined, writable: true });
    });

    it('should include the report timestamp', () => {
      const output: PerfGuardianOutput = {
        timestamp: '2024-03-20T14:22:33.000Z',
        artifacts: [],
        overallStatus: 'pass',
      };

      const formatted = formatOutput(output);

      expect(formatted).toContain('2024-03-20T14:22:33.000Z');
    });

    it('should include size info for each artifact', () => {
      const output: PerfGuardianOutput = {
        timestamp: '2024-01-15T10:30:00.000Z',
        artifacts: [
          {
            name: 'dist/main.js',
            measuredSizeKb: 42.5,
            budgetThresholdKb: 60,
            status: 'pass',
            overageKb: null,
          },
        ],
        overallStatus: 'pass',
      };

      const formatted = formatOutput(output);

      expect(formatted).toContain('42.5 KB / 60 KB');
      expect(formatted).toContain('dist/main.js');
    });

    it('should show overage for failing artifacts', () => {
      const output: PerfGuardianOutput = {
        timestamp: '2024-01-15T10:30:00.000Z',
        artifacts: [
          {
            name: 'dist/vendor.js',
            measuredSizeKb: 155.3,
            budgetThresholdKb: 100,
            status: 'fail',
            overageKb: 55.3,
          },
        ],
        overallStatus: 'fail',
      };

      const formatted = formatOutput(output);

      expect(formatted).toContain('+55.3 KB over');
    });

    it('should not show overage for passing artifacts', () => {
      const output: PerfGuardianOutput = {
        timestamp: '2024-01-15T10:30:00.000Z',
        artifacts: [
          {
            name: 'dist/app.js',
            measuredSizeKb: 20,
            budgetThresholdKb: 50,
            status: 'pass',
            overageKb: null,
          },
        ],
        overallStatus: 'pass',
      };

      const formatted = formatOutput(output);

      expect(formatted).not.toContain('over');
    });

    it('should display multiple artifacts in order', () => {
      const output: PerfGuardianOutput = {
        timestamp: '2024-01-15T10:30:00.000Z',
        artifacts: [
          {
            name: 'first.js',
            measuredSizeKb: 10,
            budgetThresholdKb: 50,
            status: 'pass',
            overageKb: null,
          },
          {
            name: 'second.js',
            measuredSizeKb: 60,
            budgetThresholdKb: 50,
            status: 'fail',
            overageKb: 10,
          },
          {
            name: 'third.js',
            measuredSizeKb: 5,
            budgetThresholdKb: 50,
            status: 'pass',
            overageKb: null,
          },
        ],
        overallStatus: 'fail',
      };

      const formatted = formatOutput(output);
      const firstIdx = formatted.indexOf('first.js');
      const secondIdx = formatted.indexOf('second.js');
      const thirdIdx = formatted.indexOf('third.js');

      expect(firstIdx).toBeLessThan(secondIdx);
      expect(secondIdx).toBeLessThan(thirdIdx);
    });

    it('should include header and separator lines', () => {
      const output: PerfGuardianOutput = {
        timestamp: '2024-01-15T10:30:00.000Z',
        artifacts: [],
        overallStatus: 'pass',
      };

      const formatted = formatOutput(output);

      expect(formatted).toContain('Perf Guardian Report');
      expect(formatted).toContain('='.repeat(60));
    });
  });
});
