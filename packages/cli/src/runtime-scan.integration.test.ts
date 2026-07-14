/**
 * @iamthamanic/autoguide-cli — runtime scan integration (issue #74).
 */

import { createServer, type Server } from 'node:http';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it, afterEach } from 'vitest';
import { runScan } from './commands/scan.js';

let server: Server | undefined;
let baseUrl = '';

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
  baseUrl = `http://127.0.0.1:${address.port}`;
  return baseUrl;
}

describe('cli runtime scan', () => {
  it('merges runtime_dom facts when --runtime and app is reachable', async () => {
    await startFixtureServer('<html><body><button aria-label="Speichern">Save</button></body></html>');
    const dir = await mkdtemp(join(tmpdir(), 'ag-runtime-scan-'));
    try {
      await mkdir(join(dir, 'src'), { recursive: true });
      await writeFile(
        join(dir, 'src/App.tsx'),
        'export function App() { return <button>Speichern</button>; }',
      );
      await writeFile(
        join(dir, 'autoguide.config.json'),
        JSON.stringify({
          appId: 'runtime-fixture',
          framework: 'react',
          baseUrl,
          outputDir: '.autoguide',
          mode: 'development',
          ai: { provider: 'none' },
          scan: { safeMode: true },
        }),
      );

      const scan = await runScan(dir, { runtime: true, baseUrl, noAi: true });
      expect(scan.ok, scan.errors.join('; ')).toBe(true);

      const facts = JSON.parse(await readFile(join(dir, '.autoguide/facts.json'), 'utf8')) as Array<{
        provenance: Array<{ source: string }>;
        value: unknown;
      }>;
      const runtimeFacts = facts.filter((fact) =>
        fact.provenance.some((item) => item.source === 'runtime_dom'),
      );
      expect(runtimeFacts.length).toBeGreaterThan(0);
      expect(runtimeFacts.some((fact) => String(fact.value).includes('Speichern'))).toBe(true);

      const snapshotRaw = await readFile(join(dir, '.autoguide/runtime-snapshot.json'), 'utf8');
      const snapshot = JSON.parse(snapshotRaw) as { elements: unknown[] };
      expect(snapshot.elements.length).toBeGreaterThan(0);

      const confidence = JSON.parse(
        await readFile(join(dir, '.autoguide/confidence.json'), 'utf8'),
      ) as { facts: Record<string, { evidenceFamilies: string[] }> };
      const runtimeBacked = Object.values(confidence.facts ?? {}).some((entry) =>
        entry.evidenceFamilies.includes('runtime_dom'),
      );
      expect(runtimeBacked).toBe(true);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
