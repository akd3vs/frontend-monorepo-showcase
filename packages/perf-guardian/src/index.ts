// Public API for programmatic use
export type {
  PerfGuardianConfig,
  BudgetEntry,
  TreeShakingEntry,
  ArtifactReport,
  PerfGuardianOutput,
} from './types.js';

export { parseConfig } from './config.js';
export type { ParseConfigResult, ConfigResult, ConfigError } from './config.js';

export { analyzeBudgets } from './analyzer.js';
export { analyzeTreeShaking } from './tree-shaking.js';
export { run, formatOutput } from './cli.js';
