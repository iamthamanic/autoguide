/**
 * @iamthamanic/autoguide-vite — dev-only POST /__autoguide/scan to run autoguide scan.
 */

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Connect } from 'vite';

const DEV_SCAN_PATH = '/__autoguide/scan';

export interface DevScanMiddlewareOptions {
  projectRoot: string;
  onScanComplete?: () => void;
}

function resolveAutoguideBin(projectRoot: string): string | null {
  const localBin = join(projectRoot, 'node_modules', '.bin', 'autoguide');
  if (existsSync(localBin)) return localBin;
  return null;
}

function runCliScan(cwd: string, runtime: boolean): Promise<{ code: number; stderr: string }> {
  return new Promise((resolve) => {
    const bin = resolveAutoguideBin(cwd);
    if (!bin) {
      resolve({ code: 127, stderr: 'autoguide CLI nicht gefunden (npm install @iamthamanic/autoguide-cli).' });
      return;
    }

    const args = ['scan', '--no-ai'];
    if (runtime) args.push('--runtime');

    const child = spawn(bin, args, { cwd, env: process.env });
    let stderr = '';
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on('close', (code) => resolve({ code: code ?? 1, stderr }));
    child.on('error', () => resolve({ code: 1, stderr: 'Scan-Prozess konnte nicht gestartet werden.' }));
  });
}

export function createDevScanMiddleware(
  options: DevScanMiddlewareOptions,
): Connect.NextHandleFunction {
  let scanInFlight = false;

  return (req, res, next) => {
    if (req.url !== DEV_SCAN_PATH) {
      next();
      return;
    }

    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ ok: false, error: 'Nur POST erlaubt.' }));
      return;
    }

    if (scanInFlight) {
      res.statusCode = 409;
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ ok: false, error: 'Scan läuft bereits.' }));
      return;
    }

    scanInFlight = true;
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      void (async () => {
        let runtime = true;
        try {
          const parsed = body ? (JSON.parse(body) as { runtime?: boolean }) : {};
          runtime = parsed.runtime !== false;
        } catch {
          runtime = true;
        }

        const result = await runCliScan(options.projectRoot, runtime);
        scanInFlight = false;

        if (result.code !== 0) {
          res.statusCode = result.code === 127 ? 501 : 500;
          res.setHeader('content-type', 'application/json');
          res.end(
            JSON.stringify({
              ok: false,
              error: result.stderr.trim() || 'autoguide scan fehlgeschlagen.',
            }),
          );
          return;
        }

        options.onScanComplete?.();
        res.statusCode = 200;
        res.setHeader('content-type', 'application/json');
        res.end(
          JSON.stringify({
            ok: true,
            message: 'Scan abgeschlossen. Dokumentation wurde aktualisiert.',
          }),
        );
      })();
    });
  };
}

export { DEV_SCAN_PATH };
