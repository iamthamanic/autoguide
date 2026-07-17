/**
 * @iamthamanic/autoguide-playwright — safe crawl fallback for routes without test coverage.
 *
 * Autonomy path: own Playwright crawl is the fallback when host apps do not
 * provide a Playwright JSON reporter import. Import remains optional bonus.
 */

import type { CrawlOptions, CrawlResult, PlaywrightTestEvidence } from './types.js';

const DESTRUCTIVE_PATTERN = /(delete|remove|löschen|entfernen|destroy)/i;

/** Max safe clicks per route — keeps crawl bounded (YAGNI). */
export const CRAWL_MAX_SAFE_CLICKS = 5;

export function isSafeAction(label: string, safeMode = true): boolean {
  if (!safeMode) return true;
  return !DESTRUCTIVE_PATTERN.test(label);
}

interface ClickCandidate {
  index: number;
  label: string;
}

/**
 * Collect in-page clickables and tag them for later click via data-ag-crawl.
 * Pure filter helper also exported for unit tests without a browser.
 */
export function filterSafeClickCandidates(
  candidates: Array<{ index: number; label: string }>,
  safeMode: boolean,
  maxClicks = CRAWL_MAX_SAFE_CLICKS,
): ClickCandidate[] {
  const safe: ClickCandidate[] = [];
  for (const candidate of candidates) {
    const label = candidate.label.trim() || `element-${candidate.index}`;
    if (!isSafeAction(label, safeMode)) continue;
    safe.push({ index: candidate.index, label });
    if (safe.length >= maxClicks) break;
  }
  return safe;
}

async function collectClickCandidates(
  page: import('playwright').Page,
): Promise<Array<{ index: number; label: string }>> {
  return page.evaluate(() => {
    const nodes = Array.from(
      document.querySelectorAll('a[href], button, [role="button"], input[type="submit"]'),
    );
    return nodes.slice(0, 20).map((el, index) => {
      el.setAttribute('data-ag-crawl', String(index));
      const label = (
        el.getAttribute('aria-label') ||
        (el as HTMLInputElement).value ||
        el.textContent ||
        el.getAttribute('href') ||
        ''
      )
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 80);
      return { index, label };
    });
  });
}

async function interactSafe(
  page: import('playwright').Page,
  route: string,
  safeMode: boolean,
): Promise<PlaywrightTestEvidence['steps']> {
  const steps: PlaywrightTestEvidence['steps'] = [
    { title: `goto ${route}`, category: 'pw:crawl' },
  ];

  const startUrl = page.url();
  const candidates = await collectClickCandidates(page);
  const safe = filterSafeClickCandidates(candidates, safeMode);

  for (const item of safe) {
    const selector = `[data-ag-crawl="${item.index}"]`;
    try {
      const locator = page.locator(selector).first();
      if ((await locator.count()) === 0) continue;
      await locator.click({ timeout: 3_000 });
      steps.push({ title: `click ${item.label}`, category: 'pw:crawl' });
      // Return to start route so further clicks stay on the same page context.
      if (page.url() !== startUrl) {
        await page.goto(startUrl, { waitUntil: 'domcontentloaded', timeout: 15_000 });
        // Re-tag after navigation so subsequent selectors still resolve.
        await collectClickCandidates(page);
      }
    } catch {
      // Skip flaky/unclickable controls; crawl continues.
    }
  }

  return steps;
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
      const steps = await interactSafe(page, route, safeMode);
      traces.push({
        title: `Crawl ${route}`,
        steps,
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
