/**
 * @iamthamanic/autoguide-playwright — safe crawl fallback for routes without test coverage.
 */

import type { CrawlOptions, CrawlResult, PlaywrightTestEvidence } from './types.js';

const DESTRUCTIVE_PATTERN = /(delete|remove|löschen|entfernen|destroy)/i;

export function isSafeAction(label: string, safeMode = true): boolean {
  if (!safeMode) return true;
  return !DESTRUCTIVE_PATTERN.test(label);
}

export async function crawlUncoveredRoutes(options: CrawlOptions): Promise<CrawlResult> {
  const safeMode = options.safeMode ?? true;
  const visitedRoutes: string[] = [];
  const skippedRoutes: string[] = [];
  const traces: PlaywrightTestEvidence[] = [];

  let chromium: typeof import('playwright').chromium | undefined;
  try {
    const playwright = await import('playwright');
    chromium = playwright.chromium;
  } catch {
    return {
      visitedRoutes: [],
      skippedRoutes: options.routes,
      traces: [],
    };
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  for (const route of options.routes) {
    const label = route;
    if (!isSafeAction(label, safeMode)) {
      skippedRoutes.push(route);
      continue;
    }
    const url = new URL(route, options.baseUrl).toString();
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15_000 });
      visitedRoutes.push(route);
      traces.push({
        title: `Crawl ${route}`,
        steps: [{ title: `goto ${route}`, category: 'pw:crawl' }],
      });
      if (options.screenshots) {
        await page.screenshot({ fullPage: true });
      }
    } catch {
      skippedRoutes.push(route);
    }
  }

  await browser.close();
  return { visitedRoutes, skippedRoutes, traces };
}
