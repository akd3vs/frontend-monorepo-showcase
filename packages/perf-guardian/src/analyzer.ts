import { statSync } from 'node:fs';

import fg from 'fast-glob';

import type {
  ArtifactReport,
  BudgetEntry,
  PerfGuardianOutput,
} from './types.js';

/**
 * Round a number to 1 decimal place.
 */
function roundTo1Decimal(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Measure the total size of files matching a glob pattern, in KB (1 decimal precision).
 * Returns 0 if no files match.
 */
function measureArtifactSize(glob: string, cwd: string): number {
  const files = fg.sync(glob, { cwd, absolute: true });
  let totalBytes = 0;

  for (const file of files) {
    try {
      const stat = statSync(file);
      totalBytes += stat.size;
    } catch {
      // Skip files that can't be stat'd
    }
  }

  return roundTo1Decimal(totalBytes / 1024);
}

/**
 * Analyze a single budget entry and produce an artifact report.
 */
function analyzeBudgetEntry(entry: BudgetEntry, cwd: string): ArtifactReport {
  const measuredSizeKb = measureArtifactSize(entry.artifactGlob, cwd);
  const pass = measuredSizeKb <= entry.maxSizeKb;

  return {
    name: entry.artifactGlob,
    measuredSizeKb,
    budgetThresholdKb: entry.maxSizeKb,
    status: pass ? 'pass' : 'fail',
    overageKb: pass ? null : roundTo1Decimal(measuredSizeKb - entry.maxSizeKb),
  };
}

/**
 * Analyze all budget entries and produce the full output report.
 */
export function analyzeBudgets(
  budgets: BudgetEntry[],
  cwd: string
): PerfGuardianOutput {
  const artifacts = budgets.map((entry) => analyzeBudgetEntry(entry, cwd));
  const overallStatus = artifacts.some((a) => a.status === 'fail')
    ? 'fail'
    : 'pass';

  return {
    timestamp: new Date().toISOString(),
    artifacts,
    overallStatus,
  };
}
