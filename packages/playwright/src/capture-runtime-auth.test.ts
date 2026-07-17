/**
 * @iamthamanic/autoguide-playwright — authenticated runtime capture via storageState.
 */

import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, describe, expect, it } from 'vitest';
import { captureRuntimeSnapshots } from './capture-runtime.js';

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

async function startAuthFixtureServer(): Promise<{ baseUrl: string; port: number }> {
  server = createServer((req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1');
    const session = readCookie(req, 'ag_session');
    if (url.pathname === '/app' && session === 'ok') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<html><body><button aria-label="Dashboard speichern">Save</button></body></html>');
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
  return { baseUrl: `http://127.0.0.1:${address.port}`, port: address.port };
}

describe('captureRuntimeSnapshots storageState', () => {
  it('reuses cookies from storageState for protected routes', async () => {
    const { baseUrl, port } = await startAuthFixtureServer();
    const dir = await mkdtemp(join(tmpdir(), 'ag-storage-state-'));
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
      const withoutSession = await captureRuntimeSnapshots({
        baseUrl,
        routes: ['/app'],
      });
      expect(
        withoutSession.snapshots.some((snap) =>
          snap.elements.some((el) => (el.label ?? '').includes('Dashboard')),
        ),
      ).toBe(false);

      const withSession = await captureRuntimeSnapshots({
        baseUrl,
        routes: ['/app'],
        storageStatePath: storagePath,
      });
      expect(withSession.visitedRoutes).toContain('/app');
      expect(
        withSession.snapshots.some((snap) =>
          snap.elements.some((el) => (el.label ?? '').includes('Dashboard')),
        ),
      ).toBe(true);
      expect(port).toBeGreaterThan(0);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  }, 30_000);

  it('warns and continues when storageState path is missing', async () => {
    const { baseUrl } = await startAuthFixtureServer();
    const result = await captureRuntimeSnapshots({
      baseUrl,
      routes: ['/'],
      storageStatePath: join(tmpdir(), 'missing-auth-state.json'),
    });
    expect(result.warnings.some((w) => w.includes('storageState nicht gefunden'))).toBe(true);
    expect(result.visitedRoutes).toContain('/');
  }, 15_000);
});
