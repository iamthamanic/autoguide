/**
 * @iamthamanic/autoguide-cli — doctor health checks.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { readFile } from 'node:fs/promises';
import {
  type Recommendation,
  type ReviewItem,
  sortRecommendationsByPriority,
  formatRecommendationReviewHint,
} from '@iamthamanic/autoguide-core';
import { loadScanRegistry } from '../plugins.js';

export interface DoctorResult {
  ok: boolean;
  messages: string[];
}

function isRecommendation(value: unknown): value is Recommendation {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === 'string' && typeof v.message === 'string';
}

function isReviewItem(value: unknown): value is ReviewItem {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.factId === 'string' && typeof v.reason === 'string';
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
      const { registry } = await loadScanRegistry(cwd, config.plugins ?? []);
      messages.push(`Plugins: ${registry.list().map((item) => item.id).join(', ')}`);
      for (const entry of registry.describeCapabilities()) {
        messages.push(
          `- ${entry.id} (${entry.capabilities.join(', ')}) — ${entry.description ?? 'kein Beschreibungstext'}`,
        );
      }
    } catch (error) {
      ok = false;
      messages.push(error instanceof Error ? error.message : 'Plugin-Validierung fehlgeschlagen.');
    }
  }

  const reviewsPath = join(outputDir, 'reviews.json');
  let pendingReviewIds = new Set<string>();
  if (existsSync(reviewsPath)) {
    try {
      const raw = JSON.parse(await readFile(reviewsPath, 'utf8')) as unknown;
      const items = Array.isArray(raw) ? raw.filter(isReviewItem) : [];
      pendingReviewIds = new Set(items.map((item) => item.factId));
      if (items.length > 0) {
        messages.push(`Review-Warteschlange: ${items.length} offene Facts`);
      }
    } catch {
      messages.push('reviews.json konnte nicht gelesen werden.');
    }
  }

  const recommendationsPath = join(outputDir, 'recommendations.json');
  if (existsSync(recommendationsPath)) {
    try {
      const raw = JSON.parse(await readFile(recommendationsPath, 'utf8')) as unknown;
      const list = sortRecommendationsByPriority(
        Array.isArray(raw) ? raw.filter(isRecommendation) : [],
      );
      if (list.length === 0) {
        messages.push('Empfehlungen: keine offenen Hinweise.');
      } else {
        messages.push(`Empfehlungen (${list.length}, nach Priorität):`);
        for (const item of list.slice(0, 5)) {
          const location =
            item.filePath && item.line
              ? ` @ ${item.filePath}:${item.line}`
              : item.filePath
                ? ` @ ${item.filePath}`
                : '';
          messages.push(`- [${item.severity}] ${item.message}${location}`);
          const reviewHint = formatRecommendationReviewHint(item, pendingReviewIds);
          if (reviewHint) messages.push(`  → ${reviewHint}`);
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
