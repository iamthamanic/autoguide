/**
 * @iamthamanic/autoguide-cli — sync command: copy publish-ready artifacts to a static target.
 */

import { cp, mkdir, rm, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { resolveOutputDir } from '../lib/artifacts.js';

export interface SyncOptions {
  target: string;
  clean?: boolean;
}

export interface SyncResult {
  ok: boolean;
  copied: string[];
  errors: string[];
}

const RUNTIME_ARTIFACTS = [
  'facts.json',
  'pages.json',
  'flows.json',
  'tours.json',
  'recommendations.json',
  'doc-bundle.json',
];

export async function runSync(cwd: string, options: SyncOptions): Promise<SyncResult> {
  const outputDir = await resolveOutputDir(cwd);
  if (!existsSync(outputDir)) {
    return {
      ok: false,
      copied: [],
      errors: ['.autoguide/ fehlt — zuerst `autoguide scan` ausführen.'],
    };
  }

  const target = options.target;
  const clean = options.clean ?? false;

  try {
    if (clean && existsSync(target)) {
      await rm(target, { recursive: true, force: true });
    }
    await mkdir(target, { recursive: true });

    const copied: string[] = [];
    const errors: string[] = [];

    for (const artifact of RUNTIME_ARTIFACTS) {
      const sourcePath = join(outputDir, artifact);
      if (!existsSync(sourcePath)) {
        errors.push(`${artifact} fehlt — übersprungen.`);
        continue;
      }
      const destPath = join(target, artifact);
      await cp(sourcePath, destPath, { force: true });
      copied.push(artifact);
    }

    return { ok: errors.length === 0 || copied.length > 0, copied, errors };
  } catch (error) {
    return {
      ok: false,
      copied: [],
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}

export async function runSyncCommand(cwd: string, options: SyncOptions): Promise<number> {
  const result = await runSync(cwd, options);
  if (!result.ok && result.copied.length === 0) {
    for (const error of result.errors) console.error(error);
    return 1;
  }
  for (const warning of result.errors) console.warn(warning);
  console.log(`Sync abgeschlossen → ${options.target}`);
  for (const file of result.copied) {
    console.log(`- ${file}`);
  }
  return 0;
}