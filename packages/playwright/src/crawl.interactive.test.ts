/**
 * @iamthamanic/autoguide-playwright — interactive crawl tests (fixture HTML).
 */

import { createServer } from 'node:http';
import { describe, expect, it } from 'vitest';
import {
  crawlUncoveredRoutes,
  filterSafeClickCandidates,
  isChromeNoise,
  isSafeAction,
} from './crawl.js';

function fixtureHtml(): string {
  return `<!doctype html>
<html lang="de">
  <body>
    <main>
      <h1>Crawl Fixture</h1>
      <a href="/about">About</a>
      <button type="button">Open settings</button>
      <button type="button">Delete account</button>
      <button type="button">Speichern</button>
      <button type="button" aria-label="Open Tanstack query devtools" class="tsqd-open-btn">Dev</button>
    </main>
  </body>
</html>`;
}

async function withFixtureServer<T>(run: (baseUrl: string) => Promise<T>): Promise<T> {
  const server = createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fixtureHtml());
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Server address unavailable');
  }
  try {
    return await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
}

describe('interactive crawl', () => {
  it('filters destructive labels and caps safe clicks', () => {
    const safe = filterSafeClickCandidates(
      [
        { index: 0, label: 'About' },
        { index: 1, label: 'Delete account' },
        { index: 2, label: 'Open settings' },
        { index: 3, label: 'Löschen' },
        { index: 4, label: 'Speichern' },
      ],
      true,
      2,
    );
    expect(safe.map((c) => c.label)).toEqual(['About', 'Open settings']);
    expect(isSafeAction('Delete account')).toBe(false);
  });

  it('filters tanstack/devtools chrome by label and DOM hint', () => {
    expect(isChromeNoise('Open Tanstack query devtools')).toBe(true);
    expect(isChromeNoise('Dev', 'tsqd-open-btn')).toBe(true);
    expect(isChromeNoise('Speichern', 'btn-primary')).toBe(false);

    const safe = filterSafeClickCandidates(
      [
        { index: 0, label: 'Open Tanstack query devtools' },
        { index: 1, label: 'Speichern' },
        { index: 2, label: 'x', domHint: 'react-devtools-root' },
      ],
      true,
      5,
    );
    expect(safe.map((c) => c.label)).toEqual(['Speichern']);
  });

  it(
    'produces multi-step traces when page has safe clickables',
    async () => {
      let chromiumAvailable = true;
      try {
        const { chromium } = await import('playwright');
        const browser = await chromium.launch();
        await browser.close();
      } catch {
        chromiumAvailable = false;
      }
      if (!chromiumAvailable) return;

      await withFixtureServer(async (baseUrl) => {
        const result = await crawlUncoveredRoutes({
          baseUrl,
          routes: ['/'],
          safeMode: true,
        });
        expect(result.visitedRoutes).toContain('/');
        expect(result.traces.length).toBe(1);
        const steps = result.traces[0]?.steps ?? [];
        expect(steps[0]?.title).toBe('goto /');
        expect(steps.length).toBeGreaterThanOrEqual(2);
        expect(steps.some((s) => s.title.startsWith('click '))).toBe(true);
        expect(steps.every((s) => !/delete|löschen/i.test(s.title))).toBe(true);
        expect(steps.every((s) => !/tanstack|devtools/i.test(s.title))).toBe(true);
      });
    },
    30_000,
  );
});
