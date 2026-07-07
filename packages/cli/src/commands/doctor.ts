/**
 * @autoguide/cli — doctor health checks.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { readFile } from 'node:fs/promises';
import { createBuiltinRegistry } from '../plugins.js';

export interface DoctorResult {
  ok: boolean;
  messages: string[];
}

export async function runDoctor(cwd: string): Promise<DoctorResult> {
  const messages: string[] = [];
  let ok = true;

  const configPath = join(cwd, 'autoguide.config.json');
  if (!existsSync(configPath)) {
    ok = false;
    messages.push('autoguide.config.json fehlt — führe `autoguide init` aus.');
  }

  const outputDir = join(cwd, '.autoguide');
  if (!existsSync(outputDir)) {
    ok = false;
    messages.push('.autoguide/ fehlt — führe `autoguide init` aus.');
  }

  if (existsSync(configPath)) {
    try {
      const config = JSON.parse(await readFile(configPath, 'utf8')) as { plugins?: string[] };
      const registry = createBuiltinRegistry(config.plugins ?? []);
      messages.push(`Plugins: ${registry.list().map((item) => item.id).join(', ')}`);
    } catch (error) {
      ok = false;
      messages.push(error instanceof Error ? error.message : 'Plugin-Validierung fehlgeschlagen.');
    }
  }

  if (ok) {
    messages.push('AutoGuide Basis-Setup ist vorhanden.');
  }

  return { ok, messages };
}
