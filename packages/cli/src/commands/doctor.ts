/**
 * @autoguide/cli — doctor health checks.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { readFile } from 'node:fs/promises';
import type { Recommendation } from '@autoguide/core';
import { createBuiltinRegistry } from '../plugins.js';

export interface DoctorResult {
  ok: boolean;
  messages: string[];
}

function isRecommendation(value: unknown): value is Recommendation {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === 'string' && typeof v.message === 'string';
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

  const recommendationsPath = join(outputDir, 'recommendations.json');
  if (existsSync(recommendationsPath)) {
    try {
      const raw = JSON.parse(await readFile(recommendationsPath, 'utf8')) as unknown;
      const list = Array.isArray(raw) ? raw.filter(isRecommendation) : [];
      if (list.length === 0) {
        messages.push('Empfehlungen: keine offenen Hinweise.');
      } else {
        messages.push(`Empfehlungen (${list.length}):`);
        for (const item of list.slice(0, 5)) {
          messages.push(`- [${item.severity}] ${item.message}`);
        }
        if (list.length > 5) {
          messages.push(`- … und ${list.length - 5} weitere`);
        }
      }
    } catch {
      messages.push('recommendations.json konnte nicht gelesen werden.');
    }
  }

  if (ok) {
    messages.push('AutoGuide Basis-Setup ist vorhanden.');
  }

  return { ok, messages };
}
