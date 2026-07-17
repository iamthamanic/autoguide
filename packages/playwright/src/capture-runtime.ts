/**
 * @iamthamanic/autoguide-playwright — capture runtime DOM snapshots via headless browser.
 */

import { access } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { RuntimeSnapshot } from '@iamthamanic/autoguide-runtime';
import { browserScanDom } from './browser-scan-dom.js';
import { isSafeAction } from './crawl.js';

export interface CaptureRuntimeOptions {
  baseUrl: string;
  routes: string[];
  safeMode?: boolean;
  /**
   * Absolute or relative path to a Playwright storageState JSON file
   * (cookies + origins) so protected routes are scanned as a logged-in user.
   */
  storageStatePath?: string;
}

export interface CaptureRuntimeResult {
  snapshots: RuntimeSnapshot[];
  visitedRoutes: string[];
  skippedRoutes: string[];
  warnings: string[];
}

function normalizeRoutes(routes: string[]): string[] {
  const unique = new Set<string>();
  for (const route of routes) {
    const path = route.trim();
    if (!path) continue;
    unique.add(path.startsWith('/') ? path : `/${path}`);
  }
  if (unique.size === 0) unique.add('/');
  return [...unique];
}

export function mergeRuntimeSnapshots(snapshots: RuntimeSnapshot[]): RuntimeSnapshot | undefined {
  if (snapshots.length === 0) return undefined;
  if (snapshots.length === 1) return snapshots[0];
  const last = snapshots[snapshots.length - 1]!;
  return {
    capturedAt: last.capturedAt,
    route: snapshots.map((item) => item.route).join(','),
    elements: snapshots.flatMap((item) => item.elements),
    forms: snapshots.flatMap((item) => item.forms),
    dialogs: snapshots.flatMap((item) => item.dialogs),
    textRegions: snapshots.flatMap((item) => item.textRegions),
    navigation: snapshots.flatMap((item) => item.navigation),
  };
}

export async function captureRuntimeSnapshots(
  options: CaptureRuntimeOptions,
): Promise<CaptureRuntimeResult> {
  const safeMode = options.safeMode ?? true;
  const routes = normalizeRoutes(options.routes);
  const warnings: string[] = [];
  const visitedRoutes: string[] = [];
  const skippedRoutes: string[] = [];
  const snapshots: RuntimeSnapshot[] = [];

  let chromium: typeof import('playwright').chromium | undefined;
  try {
    const playwright = await import('playwright');
    chromium = playwright.chromium;
  } catch {
    warnings.push('Playwright nicht installiert — Runtime-Scan übersprungen.');
    return { snapshots, visitedRoutes, skippedRoutes: routes, warnings };
  }

  let storageState: string | undefined;
  if (options.storageStatePath?.trim()) {
    const resolved = resolve(options.storageStatePath.trim());
    try {
      await access(resolved);
      storageState = resolved;
    } catch {
      warnings.push(
        `storageState nicht gefunden (${resolved}) — Runtime-Scan ohne Session fortgesetzt.`,
      );
    }
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext(storageState ? { storageState } : undefined);
  const page = await context.newPage();

  try {
    for (const route of routes) {
      if (!isSafeAction(route, safeMode)) {
        skippedRoutes.push(route);
        continue;
      }
      const url = new URL(route, options.baseUrl).toString();
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 3_000 });
        const snapshot = await page.evaluate(browserScanDom, route);
        snapshots.push(snapshot);
        visitedRoutes.push(route);
      } catch {
        skippedRoutes.push(route);
        warnings.push(`Runtime-Scan fehlgeschlagen für ${route}`);
      }
    }
  } finally {
    await context.close();
    await browser.close();
  }

  return { snapshots, visitedRoutes, skippedRoutes, warnings };
}
