export interface PerfGuardianConfig {
  budgets: BudgetEntry[];
  treeShakingThresholds?: TreeShakingEntry[];
}

export interface BudgetEntry {
  artifactGlob: string; // e.g., "apps/host-shell/dist/**/*.js"
  maxSizeKb: number; // maximum allowed size
}

export interface TreeShakingEntry {
  library: string; // e.g., "ui-core"
  maxExpectedSizeKb: number;
}

export interface ArtifactReport {
  name: string;
  measuredSizeKb: number;
  budgetThresholdKb: number;
  status: 'pass' | 'fail';
  overageKb: number | null;
}

export interface PerfGuardianOutput {
  timestamp: string;
  artifacts: ArtifactReport[];
  overallStatus: 'pass' | 'fail';
}
