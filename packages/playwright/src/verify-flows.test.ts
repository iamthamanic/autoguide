import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import type { FlowRecord } from '@autoguide/core';
import { verifyFlows } from './verify-flows.js';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const exampleFixture = join(repoRoot, 'examples/react-vite/fixtures/save-action-flow.json');

function exampleAppHtml(): string {
  return `<!doctype html>
<html lang="de">
  <body>
    <main>
      <h1>AutoGuide Beispiel-App</h1>
      <button type="button" data-doc-id="action.save">Aktion speichern</button>
    </main>
  </body>
</html>`;
}

async function withExampleServer<T>(run: (baseUrl: string) => Promise<T>): Promise<T> {
  const server = createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(exampleAppHtml());
  });
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Server address unavailable');
  }
  try {
    return await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
}

describe('verifyFlows', () => {
  it(
    'verifies examples/react-vite save-action flow',
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

    const flow = JSON.parse(await readFile(exampleFixture, 'utf8')) as FlowRecord;
    const outputDir = await mkdtemp(join(tmpdir(), 'ag-verify-'));
    try {
      await withExampleServer(async (baseUrl) => {
        const [verified] = await verifyFlows([flow], { baseUrl, outputDir });
        expect(verified?.verification?.status).toBe('verified');
        expect(verified?.status).toBe('reviewed');
      });
    } finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  }, 30_000);

  it(
    'stores artifact path when a step fails',
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

    const flow: FlowRecord = {
      id: 'flow-fail',
      title: 'Failing flow',
      steps: [{ order: 1, title: 'click Nicht vorhanden', factIds: [] }],
      roleIds: [],
      pageIds: [],
      factIds: [],
      status: 'draft',
    };
    const outputDir = await mkdtemp(join(tmpdir(), 'ag-verify-fail-'));
    try {
      await withExampleServer(async (baseUrl) => {
        const [result] = await verifyFlows([flow], { baseUrl, outputDir });
        expect(result?.verification?.status).toBe('failed');
        expect(result?.verification?.artifactPath).toContain('verify-artifacts/flow-fail/step-1.png');
      });
    } finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  }, 30_000);
});
