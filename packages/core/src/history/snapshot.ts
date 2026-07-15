/**
 * @iamthamanic/autoguide-core — build scan snapshots for change detection.
 */

import type { ScanSnapshot } from './types.js';

export interface SnapshotSourceInput {
  routes: Array<{ route: string; filePath: string }>;
  elements: Array<{ filePath: string; componentName?: string }>;
}

export function buildScanSnapshot(
  source: SnapshotSourceInput,
  gitHead?: string,
): ScanSnapshot {
  return {
    scannedAt: new Date().toISOString(),
    gitHead,
    routes: source.routes.map((route) => ({ route: route.route, filePath: route.filePath })),
    elements: source.elements.map((element) => ({
      filePath: element.filePath,
      componentName: element.componentName,
    })),
  };
}
