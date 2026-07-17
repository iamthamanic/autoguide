/**
 * @iamthamanic/autoguide-cli — --auto orchestrator without host Playwright JSON.
 */

import { createServer, type Server } from 'node:http';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it, afterEach } from 'vitest';
import { runScan } from './commands/scan.js';
import { AUTO_SCAN_NEXT_STEPS, FLOW_SEEDING_HINT } from './lib/flow-seeding-hint.js';
import type { FlowRecord, SufficiencyReport } from '@iamthamanic/autoguide-core';

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

describe('scan --auto orchestrator', () => {
  it(
    'escalates and crawls when source has many interactive facts but zero ordered flows',
    async () => {
      const baseUrl = await startFixtureServer(`<!doctype html>
<html lang="de"><body>
  <a href="/about">About</a>
  <button type="button">Open settings</button>
</body></html>`);

      const dir = await mkdtemp(join(tmpdir(), 'ag-auto-escalate-'));
      try {
        await mkdir(join(dir, 'src'), { recursive: true });
        // Many source handlers → interactive_coverage would formerly mark sufficient
        // and skip crawl (browo-style false-positive).
        const handlers = Array.from({ length: 20 }, (_, i) => `function onAction${i}() {}`).join(
          '\n',
        );
        const buttons = Array.from(
          { length: 20 },
          (_, i) => `      <button onClick={onAction${i}}>Action ${i}</button>`,
        ).join('\n');
        await writeFile(
          join(dir, 'src/App.tsx'),
          `export function App() {
  return (
    <main>
      <Route path="/" />
      <Route path="/about" />
${buttons}
    </main>
  );
}
function Route(_props: { path: string }) { return null; }
${handlers}
`,
        );
        await writeFile(
          join(dir, 'autoguide.config.json'),
          JSON.stringify({
            appId: 'auto-escalate-fixture',
            framework: 'react',
            baseUrl,
            outputDir: '.autoguide',
            mode: 'development',
            ai: { provider: 'none' },
            scan: { safeMode: true },
          }),
        );

        const scan = await runScan(dir, { auto: true, baseUrl, noAi: true });
        expect(scan.ok, scan.errors.join('; ')).toBe(true);
        expect(scan.warnings.some((w) => w.includes('Crawl übersprungen'))).toBe(false);
        expect(scan.warnings.some((w) => w.includes('Crawl'))).toBe(true);

        const flows = JSON.parse(
          await readFile(join(dir, '.autoguide/flows.json'), 'utf8'),
        ) as FlowRecord[];
        expect(flows.filter((f) => f.steps.length >= 1).length).toBeGreaterThanOrEqual(1);
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    },
    45_000,
  );

  it(
    'without playwright-import produces ordered flow or clear sufficiency reasons',
    async () => {
      const baseUrl = await startFixtureServer(`<!doctype html>
<html lang="de"><body>
  <a href="/about">About</a>
  <button type="button">Open settings</button>
  <button type="button">Speichern</button>
</body></html>`);

      const dir = await mkdtemp(join(tmpdir(), 'ag-auto-scan-'));
      try {
        await mkdir(join(dir, 'src'), { recursive: true });
        await writeFile(
          join(dir, 'src/App.tsx'),
          `export function App() {
  return (
    <main>
      <Route path="/" />
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
            appId: 'auto-fixture',
            framework: 'react',
            baseUrl,
            outputDir: '.autoguide',
            mode: 'development',
            ai: { provider: 'none' },
            scan: { safeMode: true },
          }),
        );

        const scan = await runScan(dir, { auto: true, baseUrl, noAi: true });
        expect(scan.ok, scan.errors.join('; ')).toBe(true);
        expect(scan.sufficiency).toBeDefined();

        const flows = JSON.parse(
          await readFile(join(dir, '.autoguide/flows.json'), 'utf8'),
        ) as FlowRecord[];
        const ordered = flows.filter((f) => f.steps.length >= 1);
        const sufficiency = JSON.parse(
          await readFile(join(dir, '.autoguide/sufficiency.json'), 'utf8'),
        ) as SufficiencyReport;

        const hasOrderedFlow = ordered.length >= 1;
        const hasClearStatus =
          sufficiency.status === 'sufficient' ||
          sufficiency.status === 'escalate' ||
          sufficiency.status === 'blocked';
        expect(hasClearStatus).toBe(true);
        expect(hasOrderedFlow || sufficiency.reasons.length > 0).toBe(true);

        if (!hasOrderedFlow && sufficiency.status !== 'sufficient') {
          expect(scan.warnings.some((w) => w === AUTO_SCAN_NEXT_STEPS || w === FLOW_SEEDING_HINT)).toBe(
            true,
          );
        }
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    },
    45_000,
  );
});
