/**
 * @iamthamanic/autoguide-cli — preserve ordered flows across rescans (issue #155).
 */

import { createServer, type Server } from 'node:http';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it, afterEach } from 'vitest';
import { runScan } from './commands/scan.js';
import type { FlowRecord } from '@iamthamanic/autoguide-core';

let server: Server | undefined;

afterEach(async () => {
  await new Promise<void>((resolve) => {
    server?.close(() => resolve());
  });
  server = undefined;
});

async function startFixtureServer(html: string): Promise<string> {
  server = createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  });
  await new Promise<void>((resolve) => {
    server!.listen(0, '127.0.0.1', () => resolve());
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('server address missing');
  return `http://127.0.0.1:${address.port}`;
}

describe('scan preserves ordered flows', () => {
  it(
    'keeps crawl flows after a later source-only / runtime-style scan',
    async () => {
      const baseUrl = await startFixtureServer(`<!doctype html>
<html lang="de"><body>
  <a href="/about">About</a>
  <button type="button">Open settings</button>
</body></html>`);

      const dir = await mkdtemp(join(tmpdir(), 'ag-preserve-flows-'));
      try {
        await mkdir(join(dir, 'src'), { recursive: true });
        await writeFile(
          join(dir, 'src/App.tsx'),
          `export function App() {
  return (
    <main>
      <Route path="/" />
      <Route path="/about" />
      <button onClick={onSave}>Speichern</button>
    </main>
  );
}
function Route(_props: { path: string }) { return null; }
function onSave() {}
`,
        );
        await writeFile(
          join(dir, 'autoguide.config.json'),
          JSON.stringify({
            appId: 'preserve-flows-fixture',
            framework: 'react',
            baseUrl,
            outputDir: '.autoguide',
            mode: 'development',
            ai: { provider: 'none' },
            scan: { safeMode: true },
          }),
        );

        const crawlScan = await runScan(dir, { crawl: true, baseUrl, noAi: true });
        expect(crawlScan.ok, crawlScan.errors.join('; ')).toBe(true);

        const afterCrawl = JSON.parse(
          await readFile(join(dir, '.autoguide/flows.json'), 'utf8'),
        ) as FlowRecord[];
        const orderedAfterCrawl = afterCrawl.filter((f) => f.steps.length >= 1);
        expect(orderedAfterCrawl.length).toBeGreaterThanOrEqual(1);

        // Source-only rescan (no crawl) — historically wiped flows.json to [].
        const rescan = await runScan(dir, { baseUrl, noAi: true });
        expect(rescan.ok, rescan.errors.join('; ')).toBe(true);

        const afterRescan = JSON.parse(
          await readFile(join(dir, '.autoguide/flows.json'), 'utf8'),
        ) as FlowRecord[];
        const orderedAfterRescan = afterRescan.filter((f) => f.steps.length >= 1);
        expect(orderedAfterRescan.length).toBeGreaterThanOrEqual(orderedAfterCrawl.length);
        for (const flow of orderedAfterCrawl) {
          expect(orderedAfterRescan.some((f) => f.title === flow.title)).toBe(true);
        }
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    },
    60_000,
  );
});
