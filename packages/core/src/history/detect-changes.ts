/**
 * @iamthamanic/autoguide-core — detect route/component changes between scans.
 */

import type { ChangeDetectionResult, ScanSnapshot } from './types.js';

function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

function fileMatchesChanged(filePath: string | undefined, changedFiles: Set<string>): boolean {
  if (!filePath) return false;
  const normalized = normalizePath(filePath);
  for (const changed of changedFiles) {
    const candidate = normalizePath(changed);
    if (normalized === candidate || normalized.endsWith(candidate) || candidate.endsWith(normalized)) {
      return true;
    }
  }
  return false;
}

export function detectChanges(
  previous: ScanSnapshot | null,
  current: ScanSnapshot,
  gitChangedFiles: string[],
): ChangeDetectionResult {
  const changedFiles = new Set(gitChangedFiles.map(normalizePath));

  if (previous) {
    const prevRouteMap = new Map(previous.routes.map((route) => [route.route, route.filePath]));
    for (const route of current.routes) {
      const prevPath = prevRouteMap.get(route.route);
      if (prevPath && prevPath !== route.filePath) {
        changedFiles.add(normalizePath(route.filePath));
      }
    }
    for (const route of previous.routes) {
      if (!current.routes.some((item) => item.route === route.route)) {
        changedFiles.add(normalizePath(route.filePath));
      }
    }
  }

  const changedRoutes = new Set<string>();
  for (const route of [...(previous?.routes ?? []), ...current.routes]) {
    if (fileMatchesChanged(route.filePath, changedFiles)) {
      changedRoutes.add(route.route);
    }
  }

  const changedComponents = new Set<string>();
  for (const element of [...(previous?.elements ?? []), ...current.elements]) {
    if (fileMatchesChanged(element.filePath, changedFiles)) {
      changedComponents.add(element.componentName ?? element.filePath);
    }
  }

  const uncertain =
    changedFiles.size > 0 && changedRoutes.size === 0 && changedComponents.size === 0;

  return {
    changedFiles: [...changedFiles],
    changedRoutes: [...changedRoutes],
    changedComponents: [...changedComponents],
    uncertain,
  };
}
