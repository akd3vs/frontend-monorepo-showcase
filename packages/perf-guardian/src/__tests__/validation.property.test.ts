/**
 * Property-Based Tests for Perf Guardian (Properties 10, 11)
 *
 * Feature: enterprise-frontend-monorepo
 * Testing Framework: Vitest + fast-check
 */
import * as fc from 'fast-check';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { analyzeBudgets } from '../analyzer.js';

import type { BudgetEntry, PerfGuardianOutput } from '../types.js';

// Mock fast-glob and fs so we can control measured sizes
vi.mock('fast-glob', () => ({
  default: { sync: vi.fn() },
}));

vi.mock('node:fs', () => ({
  statSync: vi.fn(),
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}));

// eslint-disable-next-line import-x/order
import fg from 'fast-glob';
// eslint-disable-next-line import-x/order
import { statSync } from 'node:fs';

const mockFgSync = fg.sync as ReturnType<typeof vi.fn>;
const mockStatSync = statSync as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── Helper ──────────────────────────────────────────────────────────────────
function roundTo1Decimal(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Set up mocks so analyzeBudgets measures a specific size (in KB) for a budget entry.
 * We simulate a single file matching the glob with the given byte size.
 */
function setupMockForSize(sizeKb: number): void {
  const sizeBytes = Math.round(sizeKb * 1024);
  mockFgSync.mockReturnValueOnce(['/fake/artifact.js']);
  mockStatSync.mockReturnValueOnce({ size: sizeBytes });
}

// ─── Property 10: Budget Validation Correctness ──────────────────────────────
// *For any* artifact file and budget configuration entry, the Perf_Guardian SHALL
// correctly determine pass/fail status: an artifact passes if and only if its
// measured size in KB <= the configured budget threshold, and the reported overage
// amount (when failing) SHALL equal measuredSize - budgetThreshold to 1 decimal
// place precision.
//
// **Validates: Requirements 7.2, 7.3, 7.4**

describe('Property 10: Budget Validation Correctness', () => {
  it('pass iff measuredSize <= threshold; overage = measured - threshold (1 decimal)', () => {
    fc.assert(
      fc.property(
        // measuredSizeKb: positive number with 1 decimal (0.1 to 10000.0)
        fc.integer({ min: 1, max: 100000 }).map((v) => v / 10),
        // budgetThresholdKb: positive number with 1 decimal (0.1 to 10000.0)
        fc.integer({ min: 1, max: 100000 }).map((v) => v / 10),
        (measuredSizeKb, budgetThresholdKb) => {
          // Set up mock to return a file with the specified size
          setupMockForSize(measuredSizeKb);

          const budgets: BudgetEntry[] = [
            { artifactGlob: 'dist/**/*.js', maxSizeKb: budgetThresholdKb },
          ];

          const output = analyzeBudgets(budgets, '/project');
          const report = output.artifacts[0];

          // The measured size after rounding through bytes→KB conversion
          // may differ slightly from our input due to byte rounding, so
          // we use the report's actual measured value for assertions.
          const actualMeasured = report.measuredSizeKb;

          // Property: pass iff measuredSize <= threshold
          if (actualMeasured <= budgetThresholdKb) {
            expect(report.status).toBe('pass');
            expect(report.overageKb).toBeNull();
          } else {
            expect(report.status).toBe('fail');
            // Overage = measured - threshold, to 1 decimal
            const expectedOverage = roundTo1Decimal(actualMeasured - budgetThresholdKb);
            expect(report.overageKb).toBe(expectedOverage);
          }
        },
      ),
      { numRuns: 200 },
    );
  });

  it('an artifact exactly at the budget threshold passes', () => {
    fc.assert(
      fc.property(
        // Use integer KB values to avoid floating-point rounding issues at boundary
        fc.integer({ min: 1, max: 5000 }),
        (thresholdKb) => {
          // When measured exactly equals threshold, it should pass
          setupMockForSize(thresholdKb);

          const budgets: BudgetEntry[] = [{ artifactGlob: 'dist/**/*.js', maxSizeKb: thresholdKb }];

          const output = analyzeBudgets(budgets, '/project');
          const report = output.artifacts[0];

          expect(report.status).toBe('pass');
          expect(report.overageKb).toBeNull();
        },
      ),
      { numRuns: 100 },
    );
  });

  it('overall status is fail if any single artifact exceeds its budget', () => {
    fc.assert(
      fc.property(
        // Generate 2-5 budget entries, ensuring at least one will fail
        fc.integer({ min: 2, max: 5 }),
        fc.integer({ min: 0, max: 4 }), // index of the failing artifact
        (numArtifacts, failIdx) => {
          const actualFailIdx = failIdx % numArtifacts;
          const budgets: BudgetEntry[] = [];

          for (let i = 0; i < numArtifacts; i++) {
            budgets.push({
              artifactGlob: `dist/chunk-${i}.js`,
              maxSizeKb: 100,
            });

            if (i === actualFailIdx) {
              // This one exceeds budget: 150 KB > 100 KB threshold
              setupMockForSize(150);
            } else {
              // These pass: 50 KB <= 100 KB threshold
              setupMockForSize(50);
            }
          }

          const output = analyzeBudgets(budgets, '/project');

          expect(output.overallStatus).toBe('fail');
          expect(output.artifacts[actualFailIdx].status).toBe('fail');
        },
      ),
      { numRuns: 100 },
    );
  });

  it('overall status is pass when all artifacts are within budget', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 5 }), (numArtifacts) => {
        const budgets: BudgetEntry[] = [];

        for (let i = 0; i < numArtifacts; i++) {
          budgets.push({
            artifactGlob: `dist/chunk-${i}.js`,
            maxSizeKb: 100,
          });
          // All pass: 50 KB <= 100 KB
          setupMockForSize(50);
        }

        const output = analyzeBudgets(budgets, '/project');

        expect(output.overallStatus).toBe('pass');
        for (const artifact of output.artifacts) {
          expect(artifact.status).toBe('pass');
        }
      }),
      { numRuns: 100 },
    );
  });
});

// ─── Property 11: JSON Output Completeness ───────────────────────────────────
// *For any* set of analyzed artifacts, the Perf_Guardian JSON output SHALL
// contain an entry for each artifact with all required fields populated:
// name (non-empty string), measuredSizeKb (number >= 0), budgetThresholdKb
// (number > 0), status ("pass" or "fail"), and overageKb (null if pass,
// positive number if fail).
//
// **Validates: Requirements 7.5**

describe('Property 11: JSON Output Completeness', () => {
  it('every artifact has all required fields populated correctly', () => {
    fc.assert(
      fc.property(
        // Generate 1-10 budget entries with random sizes and thresholds
        fc.array(
          fc.record({
            measuredKb: fc.integer({ min: 0, max: 50000 }).map((v) => v / 10),
            thresholdKb: fc.integer({ min: 1, max: 50000 }).map((v) => v / 10),
            name: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
          }),
          { minLength: 1, maxLength: 10 },
        ),
        (entries) => {
          const budgets: BudgetEntry[] = entries.map((e) => ({
            artifactGlob: e.name,
            maxSizeKb: e.thresholdKb,
          }));

          // Set up mocks for each entry
          for (const entry of entries) {
            setupMockForSize(entry.measuredKb);
          }

          const output: PerfGuardianOutput = analyzeBudgets(budgets, '/project');

          // Output has entry for each budget
          expect(output.artifacts).toHaveLength(entries.length);

          // Validate timestamp is a valid ISO string
          expect(output.timestamp).toBeTruthy();
          expect(new Date(output.timestamp).toISOString()).toBe(output.timestamp);

          // Validate overall status
          expect(['pass', 'fail']).toContain(output.overallStatus);

          for (const report of output.artifacts) {
            // name: non-empty string
            expect(typeof report.name).toBe('string');
            expect(report.name.length).toBeGreaterThan(0);

            // measuredSizeKb: number >= 0
            expect(typeof report.measuredSizeKb).toBe('number');
            expect(report.measuredSizeKb).toBeGreaterThanOrEqual(0);

            // budgetThresholdKb: number > 0
            expect(typeof report.budgetThresholdKb).toBe('number');
            expect(report.budgetThresholdKb).toBeGreaterThan(0);

            // status: "pass" or "fail"
            expect(['pass', 'fail']).toContain(report.status);

            // overageKb: null if pass, positive number if fail
            if (report.status === 'pass') {
              expect(report.overageKb).toBeNull();
            } else {
              expect(typeof report.overageKb).toBe('number');
              expect(report.overageKb).not.toBeNull();
              expect(report.overageKb!).toBeGreaterThan(0);
            }
          }
        },
      ),
      { numRuns: 200 },
    );
  });

  it('output contains correct overallStatus reflecting individual results', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            measuredKb: fc.integer({ min: 1, max: 5000 }).map((v) => v / 10),
            thresholdKb: fc.integer({ min: 1, max: 5000 }).map((v) => v / 10),
          }),
          { minLength: 1, maxLength: 8 },
        ),
        (entries) => {
          const budgets: BudgetEntry[] = entries.map((e, i) => ({
            artifactGlob: `artifact-${i}.js`,
            maxSizeKb: e.thresholdKb,
          }));

          for (const entry of entries) {
            setupMockForSize(entry.measuredKb);
          }

          const output = analyzeBudgets(budgets, '/project');

          // overallStatus = 'fail' iff any artifact has status 'fail'
          const hasAnyFail = output.artifacts.some((a) => a.status === 'fail');
          if (hasAnyFail) {
            expect(output.overallStatus).toBe('fail');
          } else {
            expect(output.overallStatus).toBe('pass');
          }
        },
      ),
      { numRuns: 200 },
    );
  });

  it('artifact name maps from the glob pattern in budget config', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.stringMatching(/^[a-z][a-z0-9/._-]{0,40}\.js$/).filter((s) => s.length > 3),
          { minLength: 1, maxLength: 5 },
        ),
        (globs) => {
          const budgets: BudgetEntry[] = globs.map((g) => ({
            artifactGlob: g,
            maxSizeKb: 100,
          }));

          for (let i = 0; i < globs.length; i++) {
            setupMockForSize(50);
          }

          const output = analyzeBudgets(budgets, '/project');

          // Each artifact name should match its corresponding glob
          for (let i = 0; i < globs.length; i++) {
            expect(output.artifacts[i].name).toBe(globs[i]);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
