/**
 * Feature Flag localStorage Persistence
 *
 * Handles reading/writing flag overrides to localStorage with version tracking.
 * When the stored version doesn't match the current version, stored overrides are
 * merged with the current defaults (stored values take precedence for known flags).
 */

export interface PersistedFlagState {
  version: number;
  overrides: Record<string, boolean>;
  updatedAt: string; // ISO 8601
}

const STORAGE_KEY = 'feature-flags';
const CURRENT_VERSION = 1;

/**
 * Read persisted flag state from localStorage.
 * Returns null if no state exists or if parsing fails.
 */
export function readPersistedState(): PersistedFlagState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isPersistedFlagState(parsed)) return null;

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Write flag overrides to localStorage with version and timestamp.
 */
export function writePersistedState(overrides: Record<string, boolean>): void {
  const state: PersistedFlagState = {
    version: CURRENT_VERSION,
    overrides,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage might be full or unavailable — fail silently
  }
}

/**
 * Resolve the effective flag overrides by merging stored state with defaults.
 * If the stored version matches current, use stored overrides directly.
 * If the version differs, only keep overrides for flags that still exist.
 */
export function resolveOverrides(
  storedState: PersistedFlagState | null,
  knownFlagNames: string[],
): Record<string, boolean> {
  if (!storedState) return {};

  const knownSet = new Set(knownFlagNames);

  if (storedState.version === CURRENT_VERSION) {
    // Filter out any overrides for flags that no longer exist
    const filtered: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(storedState.overrides)) {
      if (knownSet.has(key)) {
        filtered[key] = value;
      }
    }
    return filtered;
  }

  // Version mismatch: merge stored overrides with known flags
  const merged: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(storedState.overrides)) {
    if (knownSet.has(key)) {
      merged[key] = value;
    }
  }
  return merged;
}

function isPersistedFlagState(value: unknown): value is PersistedFlagState {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj['version'] === 'number' &&
    typeof obj['overrides'] === 'object' &&
    obj['overrides'] !== null &&
    typeof obj['updatedAt'] === 'string'
  );
}
