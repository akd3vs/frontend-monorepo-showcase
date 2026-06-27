#!/usr/bin/env node

import { resolve } from 'node:path';

import minimist from 'minimist';

import { analyzeBudgets } from './analyzer.js';
import { parseConfig } from './config.js';
import { analyzeTreeShaking } from './tree-shaking.js';

import type { PerfGuardianOutput } from './types.js';

export function formatOutput(output: PerfGuardianOutput): string {
  const lines: string[] = [];
  const isTTY = process.stdout.isTTY;

  lines.push(`\nPerf Guardian Report (${output.timestamp})`);
  lines.push('='.repeat(60));

  for (const artifact of output.artifacts) {
    const statusLabel =
      artifact.status === 'pass'
        ? isTTY
          ? '\x1b[32m✓ PASS\x1b[0m'
          : '✓ PASS'
        : isTTY
          ? '\x1b[31m✗ FAIL\x1b[0m'
          : '✗ FAIL';

    const sizeInfo = `${artifact.measuredSizeKb} KB / ${artifact.budgetThresholdKb} KB`;
    const overage =
      artifact.overageKb !== null ? ` (+${artifact.overageKb} KB over)` : '';

    lines.push(`  ${statusLabel}  ${artifact.name}`);
    lines.push(`         ${sizeInfo}${overage}`);
  }

  lines.push('='.repeat(60));
  const overallLabel =
    output.overallStatus === 'pass'
      ? isTTY
        ? '\x1b[32mOverall: PASS\x1b[0m'
        : 'Overall: PASS'
      : isTTY
        ? '\x1b[31mOverall: FAIL\x1b[0m'
        : 'Overall: FAIL';
  lines.push(overallLabel);
  lines.push('');

  return lines.join('\n');
}

export function run(argv: string[] = process.argv.slice(2)): void {
  const args = minimist(argv, {
    string: ['config'],
    alias: { c: 'config' },
  });

  const configPath = args['config'] as string | undefined;

  if (!configPath) {
    console.error('Error: --config <path> is required');
    process.exit(1);
  }

  const resolvedPath = resolve(process.cwd(), configPath);
  const result = parseConfig(resolvedPath);

  if (!result.success) {
    console.error(`Error: ${result.error}`);
    process.exit(1);
  }

  // Run budget analysis
  const output = analyzeBudgets(result.config.budgets, process.cwd());

  // Run tree-shaking analysis if thresholds are configured
  if (
    result.config.treeShakingThresholds &&
    result.config.treeShakingThresholds.length > 0
  ) {
    const treeShakingReports = analyzeTreeShaking(
      result.config.treeShakingThresholds,
      process.cwd()
    );
    output.artifacts.push(...treeShakingReports);

    // Update overall status if any tree-shaking check failed
    if (treeShakingReports.some((r) => r.status === 'fail')) {
      output.overallStatus = 'fail';
    }
  }

  // Print human-readable output
  console.log(formatOutput(output));

  // Print machine-readable JSON to stderr for CI consumption
  console.error(JSON.stringify(output, null, 2));

  if (output.overallStatus === 'fail') {
    process.exit(1);
  }

  process.exit(0);
}

// Auto-run when executed directly
const isDirectExecution =
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith('perf-guardian/dist/cli.js');

if (isDirectExecution) {
  run();
}
