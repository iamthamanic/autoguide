/**
 * @autoguide/core — scan snapshot and history log types.
 */

export interface ScanSnapshot {
  scannedAt: string;
  gitHead?: string;
  routes: Array<{ route: string; filePath: string }>;
  elements: Array<{ filePath: string; componentName?: string }>;
}

export interface ChangeDetectionResult {
  changedFiles: string[];
  changedRoutes: string[];
  changedComponents: string[];
  uncertain: boolean;
}

export interface HistoryEntry {
  id: string;
  scannedAt: string;
  gitHead?: string;
  changedFiles: string[];
  changedRoutes: string[];
  changedComponents: string[];
  staleFactIds: string[];
  uncertain: boolean;
}

export interface HistoryLog {
  version: '0.1.0';
  entries: HistoryEntry[];
}
