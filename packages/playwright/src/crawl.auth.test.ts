/**
 * @iamthamanic/autoguide-playwright — authenticated crawl via storageState.
 */

import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, describe, expect, it } from 'vitest';
import { crawlUncoveredRoutes } from './crawl.js';

let server: Server | undefined;

afterEach(async () => {
  await new Promise<void>((resolve) => {
    server?.close(() => resolve());
  });
  server = undefined;
});

function readCookie(req: IncomingMessage, name: string): string | undefined {
  const raw = req.headers.cookie ?? '';
  for (const part of raw.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return undefined;
}

async function startAuthFixtureServer(): Promise<string> {
  server = createServer((req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1');
    const session = readCookie(req, 'ag_session');
    if (url.pathname === '/app' && session === 'ok') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!doctype html><html lang="de"><body>
        <main>
          <h1>Dashboard</h1>
          <button type="button">Open settings</button>
          <button type="button">Speichern</button>
        </main>
      </body></html>`);
      return;
    }
    if (url.pathname === '/app') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<html><body><h1>Login erforderlich</h1></body></html>');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<html><body><a href="/login">Login</a></body></html>');
  });
  await new Promise<void>((resolve) => {
    server!.listen(0, '127.0.0.1', () => resolve());
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('server address missing');
  return `http://127.0.0.1:${address.port}`;
}

describe('crawlUncoveredRoutes storageState', () => {
  it('records multi-step flows on protected routes with storageState', async () => {
    const baseUrl = await startAuthFixtureServer();
    const dir = await mkdtemp(join(tmpdir(), 'ag-crawl-auth-'));
    const storagePath = join(dir, 'auth.json');
    await writeFile(
      storagePath,
      JSON.stringify({
        cookies: [
          {
            name: 'ag_session',
            value: 'ok',
            domain: '127.0.0.1',
            path: '/',
            expires: -1,
            httpOnly: false,
            secure: false,
            sameSite: 'Lax',
          },
        ],
        origins: [],
      }),
    );

    try {
      const without = await crawlUncoveredRoutes({
        baseUrl,
        routes: ['/app'],
        safeMode: true,
      });
      const withoutSteps = without.traces[0]?.steps ?? [];
      expect(withoutSteps.every((s) => !/settings|Speichern/i.test(s.title))).toBe(true);

      const withSession = await crawlUncoveredRoutes({
        baseUrl,
        routes: ['/app'],
        safeMode: true,
        storageStatePath: storagePath,
      });
      expect(withSession.visitedRoutes).toContain('/app');
      const steps = withSession.traces[0]?.steps ?? [];
      expect(steps[0]?.title).toBe('goto /app');
      expect(steps.length).toBeGreaterThanOrEqual(2);
      expect(steps.some((s) => s.title.startsWith('click '))).toBe(true);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  }, 45_000);

  it('warns when storageState path is missing', async () => {
    const baseUrl = await startAuthFixtureServer();
    const result = await crawlUncoveredRoutes({
      baseUrl,
      routes: ['/'],
      storageStatePath: join(tmpdir(), 'missing-crawl-auth.json'),
    });
    expect(result.warnings?.some((w) => w.includes('storageState nicht gefunden'))).toBe(true);
    expect(result.visitedRoutes).toContain('/');
  }, 20_000);
});
