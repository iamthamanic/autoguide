/**
 * @iamthamanic/autoguide-cli — examples/react-vite autonomy proof (no host report).
 *
 * Mirrors the example UI via fixture HTML so CI does not need a long-lived Vite server.
 * Asserts --auto/--crawl can produce ordered flows (or clear sufficiency reasons)
 * and generates tours when flows exist. Does not fake published content.
 */

import { createServer, type Server } from 'node:http';
import { mkdtemp, mkdir, writeFile, readFile, rm, copyFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { describe, expect, it, afterEach } from 'vitest';
import { runScan } from './commands/scan.js';
import { runGenerateTours } from './commands/generate.js';
import type { FlowRecord, SufficiencyReport } from '@iamthamanic/autoguide-core';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const exampleSrc = join(repoRoot, 'examples/react-vite/src/main.tsx');

let server: Server | undefined;

afterEach(async () => {
  await new Promise<void>((resolve) => {
    server?.close(() => resolve());
  });
  server = undefined;
});

/** HTML shaped like examples/react-vite App (safe clickables, no destructive). */
function exampleLikeHtml(): string {
  return `<!doctype html>
<html lang="de">
  <body>
    <main>
      <h1>AutoGuide Beispiel-App</h1>
      <button type="button">Start</button>
      <button type="button">Einstellungen</button>
      <button type="button" data-doc-id="action.save">Aktion speichern</button>
    </main>
  </body>
</html>`;
}

async function startServer(html: string): Promise<string> {
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

describe('examples/react-vite autonomy proof', () => {
  it(
    'scan --auto without playwright-import yields flows or clear reasons; tours if flows',
    async () => {
      const baseUrl = await startServer(exampleLikeHtml());
      const dir = await mkdtemp(join(tmpdir(), 'ag-react-vite-autonomy-'));
      try {
        await mkdir(join(dir, 'src'), { recursive: true });
        await copyFile(exampleSrc, join(dir, 'src/main.tsx'));
        // No playwrightImportPath — drop-in autonomy path only.
        await writeFile(
          join(dir, 'autoguide.config.json'),
          JSON.stringify({
            appId: 'example-react-vite',
            framework: 'react',
            baseUrl,
            outputDir: '.autoguide',
            mode: 'development',
            ai: { provider: 'none' },
            scan: { safeMode: true, auto: true },
          }),
        );

        const scan = await runScan(dir, { auto: true, baseUrl, noAi: true, sourceDir: 'src' });
        expect(scan.ok, scan.errors.join('; ')).toBe(true);

        const sufficiency = JSON.parse(
          await readFile(join(dir, '.autoguide/sufficiency.json'), 'utf8'),
        ) as SufficiencyReport;
        expect(['sufficient', 'escalate', 'blocked']).toContain(sufficiency.status);
        expect(sufficiency.reasons.length).toBeGreaterThan(0);

        const flows = JSON.parse(
          await readFile(join(dir, '.autoguide/flows.json'), 'utf8'),
        ) as FlowRecord[];
        const ordered = flows.filter((f) => f.steps.length >= 1);

        // Autonomy success: ordered flow from crawl, else documented escalate/blocked.
        expect(ordered.length >= 1 || sufficiency.status !== 'sufficient').toBe(true);
        if (ordered.length >= 1) {
          expect(ordered.some((f) => f.steps.length >= 2)).toBe(true);
          const gen = await runGenerateTours(dir);
          expect(gen.ok, gen.errors.join('; ')).toBe(true);
          const tours = JSON.parse(
            await readFile(join(dir, '.autoguide/tours.json'), 'utf8'),
          ) as unknown[];
          expect(Array.isArray(tours)).toBe(true);
          expect(tours.length).toBeGreaterThan(0);
        }

        // Do not claim published mode — config stays development for this proof.
        const cfg = JSON.parse(await readFile(join(dir, 'autoguide.config.json'), 'utf8')) as {
          mode: string;
        };
        expect(cfg.mode).toBe('development');
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    },
    45_000,
  );
});
