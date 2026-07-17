/**
 * @iamthamanic/autoguide-playwright — safe crawl fallback for routes without test coverage.
 *
 * Autonomy path: own Playwright crawl is the fallback when host apps do not
 * provide a Playwright JSON reporter import. Import remains optional bonus.
 */

import type { CrawlOptions, CrawlResult, PlaywrightTestEvidence } from './types.js';

const DESTRUCTIVE_PATTERN = /(delete|remove|löschen|entfernen|destroy)/i;

/**
 * Generic third-party / tooling chrome — not host-app UI.
 * Labels and DOM hints that should never become crawl flow steps.
 */
const CHROME_NOISE_LABEL =
  /(tanstack|react\s*dev\s*tools|redux\s*dev\s*tools|vue\s*dev\s*tools|vite\s*dev\s*tools|open\s+.*dev\s*tools|query\s*devtools|tsqd-)/i;

const CHROME_NOISE_DOM =
  /(tsqd-|tanstack|__devtools|react-devtools|redux-devtools|vite-plugin-devtools)/i;

/** Max safe clicks per route — keeps crawl bounded (YAGNI). */
export const CRAWL_MAX_SAFE_CLICKS = 5;

export function isSafeAction(label: string, safeMode = true): boolean {
  if (!safeMode) return true;
  return !DESTRUCTIVE_PATTERN.test(label);
}

/** True when the control looks like tooling chrome rather than host UI. */
export function isChromeNoise(label: string, domHint = ''): boolean {
  if (CHROME_NOISE_LABEL.test(label)) return true;
  if (domHint && CHROME_NOISE_DOM.test(domHint)) return true;
  return false;
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
  candidates: Array<{ index: number; label: string; domHint?: string }>,
  safeMode: boolean,
  maxClicks = CRAWL_MAX_SAFE_CLICKS,
): ClickCandidate[] {
  const scored = candidates
    .map((candidate) => {
      const label = candidate.label.trim() || `element-${candidate.index}`;
      return { ...candidate, label, domHint: candidate.domHint ?? '' };
    })
    .filter((c) => isSafeAction(c.label, safeMode) && !isChromeNoise(c.label, c.domHint))
    // Prefer real labels over empty/fallback element-N placeholders.
    .sort((a, b) => {
      const aNamed = a.label.startsWith('element-') ? 1 : 0;
      const bNamed = b.label.startsWith('element-') ? 1 : 0;
      return aNamed - bNamed;
    });

  return scored.slice(0, maxClicks).map(({ index, label }) => ({ index, label }));
}

async function collectClickCandidates(
  page: import('playwright').Page,
): Promise<Array<{ index: number; label: string; domHint: string }>> {
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
      const domHint = `${el.id} ${el.className} ${el.getAttribute('data-testid') ?? ''}`;
      return { index, label, domHint };
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
