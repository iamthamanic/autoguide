/**
 * @autoguide/core — append entries to scan history log.
 */

import type { ChangeDetectionResult, HistoryEntry, HistoryLog } from './types.js';

export const HISTORY_LOG_VERSION = '0.1.0' as const;

export function createEmptyHistoryLog(): HistoryLog {
  return { version: HISTORY_LOG_VERSION, entries: [] };
}

export function createHistoryEntry(
  detection: ChangeDetectionResult,
  staleFactIds: string[],
  gitHead?: string,
): HistoryEntry {
  return {
    id: `scan-${Date.now()}`,
    scannedAt: new Date().toISOString(),
    gitHead,
    changedFiles: detection.changedFiles,
    changedRoutes: detection.changedRoutes,
    changedComponents: detection.changedComponents,
    staleFactIds,
    uncertain: detection.uncertain,
  };
}

export function appendHistoryEntry(log: HistoryLog, entry: HistoryEntry): HistoryLog {
  return {
    version: HISTORY_LOG_VERSION,
    entries: [...log.entries, entry].slice(-100),
  };
}
