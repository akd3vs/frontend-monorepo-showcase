import { readFileSync, existsSync  } from 'node:fs';

import type { PerfGuardianConfig } from './types.js';

export interface ConfigResult {
  success: true;
  config: PerfGuardianConfig;
}

export interface ConfigError {
  success: false;
  error: string;
}

export type ParseConfigResult = ConfigResult | ConfigError;

/**
 * Parse a perf-guardian JSON config file.
 * Returns an error result if the file is missing or contains invalid JSON.
 */
export function parseConfig(configPath: string): ParseConfigResult {
  if (!existsSync(configPath)) {
    return {
      success: false,
      error: `Config file not found: ${configPath}`,
    };
  }

  let content: string;
  try {
    content = readFileSync(configPath, 'utf-8');
  } catch {
    return {
      success: false,
      error: `Failed to read config file: ${configPath}`,
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return {
      success: false,
      error: `Invalid JSON in config file: ${configPath}`,
    };
  }

  if (!isValidConfig(parsed)) {
    return {
      success: false,
      error: `Invalid config structure in: ${configPath}. Expected { budgets: [{ artifactGlob: string, maxSizeKb: number }] }`,
    };
  }

  return { success: true, config: parsed };
}

function isValidConfig(value: unknown): value is PerfGuardianConfig {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  if (!Array.isArray(obj['budgets'])) return false;

  for (const entry of obj['budgets']) {
    if (typeof entry !== 'object' || entry === null) return false;
    if (typeof entry.artifactGlob !== 'string') return false;
    if (typeof entry.maxSizeKb !== 'number' || entry.maxSizeKb < 0) return false;
  }

  // Validate optional treeShakingThresholds
  if (obj['treeShakingThresholds'] !== undefined) {
    if (!Array.isArray(obj['treeShakingThresholds'])) return false;
    for (const entry of obj['treeShakingThresholds']) {
      if (typeof entry !== 'object' || entry === null) return false;
      if (typeof entry.library !== 'string') return false;
      if (typeof entry.maxExpectedSizeKb !== 'number' || entry.maxExpectedSizeKb < 0)
        return false;
    }
  }

  return true;
}
