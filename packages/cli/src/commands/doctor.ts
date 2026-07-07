/**
 * @autoguide/cli — doctor health checks.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';

export interface DoctorResult {
  ok: boolean;
  messages: string[];
}

export function runDoctor(cwd: string): DoctorResult {
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

  if (ok) {
    messages.push('AutoGuide Basis-Setup ist vorhanden.');
  }

  return { ok, messages };
}
