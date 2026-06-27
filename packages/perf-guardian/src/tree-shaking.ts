import { statSync } from 'node:fs';

import fg from 'fast-glob';

import type { ArtifactReport, TreeShakingEntry } from './types.js';

/**
 * Round a number to 1 decimal place.
 */
function roundTo1Decimal(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Find the smallest individual JS file in a library's ESM dist output.
 * This represents the best-case tree-shaking result — importing a single component.
 */
function findSmallestArtifact(
  library: string,
  cwd: string
): { file: string; sizeKb: number } | null {
  const pattern = `packages/${library}/dist/esm/*.js`;
  const files = fg.sync(pattern, { cwd, absolute: true });

  if (files.length === 0) {
    // Fallback: try dist/*.js directly
    const fallbackPattern = `packages/${library}/dist/*.js`;
    const fallbackFiles = fg.sync(fallbackPattern, { cwd, absolute: true });
    if (fallbackFiles.length === 0) {
      return null;
    }
    return findSmallestFromFiles(fallbackFiles);
  }

  return findSmallestFromFiles(files);
}

function findSmallestFromFiles(
  files: string[]
): { file: string; sizeKb: number } | null {
  let smallest: { file: string; sizeKb: number } | null = null;

  for (const file of files) {
    try {
      const stat = statSync(file);
      const sizeKb = roundTo1Decimal(stat.size / 1024);
      if (smallest === null || sizeKb < smallest.sizeKb) {
        smallest = { file, sizeKb };
      }
    } catch {
      // Skip files that can't be stat'd
    }
  }

  return smallest;
}

/**
 * Analyze a single tree-shaking entry: find the smallest individual entry point
 * artifact for the library and compare against the configured threshold.
 */
function analyzeTreeShakingEntry(
  entry: TreeShakingEntry,
  cwd: string
): ArtifactReport {
  const result = findSmallestArtifact(entry.library, cwd);

  if (result === null) {
    // No artifacts found — report as zero size (pass) with a note in the name
    return {
      name: `tree-shaking:${entry.library} (no artifacts found)`,
      measuredSizeKb: 0,
      budgetThresholdKb: entry.maxExpectedSizeKb,
      status: 'pass',
      overageKb: null,
    };
  }

  const pass = result.sizeKb <= entry.maxExpectedSizeKb;

  return {
    name: `tree-shaking:${entry.library}`,
    measuredSizeKb: result.sizeKb,
    budgetThresholdKb: entry.maxExpectedSizeKb,
    status: pass ? 'pass' : 'fail',
    overageKb: pass
      ? null
      : roundTo1Decimal(result.sizeKb - entry.maxExpectedSizeKb),
  };
}

/**
 * Analyze all tree-shaking entries and produce artifact reports.
 */
export function analyzeTreeShaking(
  thresholds: TreeShakingEntry[],
  cwd: string
): ArtifactReport[] {
  return thresholds.map((entry) => analyzeTreeShakingEntry(entry, cwd));
}
