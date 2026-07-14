/**
 * @iamthamanic/autoguide-cli — review command for pending facts.
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Recommendation } from '@iamthamanic/autoguide-core';
import { loadConfigFromObject } from '@iamthamanic/autoguide-config';
import type { AutoGuideConfigInput } from '@iamthamanic/autoguide-config';
import { configureRedaction, ReviewQueue } from '@iamthamanic/autoguide-core';
import { loadArtifacts, resolveOutputDir, saveFactsAndReviews } from '../lib/artifacts.js';

export interface ReviewCommandOptions {
  json?: boolean;
  list?: boolean;
  accept?: string;
  reject?: string;
  edit?: string;
  value?: string;
}

function appendRecommendation(
  existing: Recommendation[],
  recommendation?: Recommendation,
): Recommendation[] {
  if (!recommendation) return existing;
  if (existing.some((item) => item.id === recommendation.id)) return existing;
  return [...existing, recommendation];
}

export async function runReview(cwd: string, options: ReviewCommandOptions = {}): Promise<number> {
  const configPath = join(cwd, 'autoguide.config.json');
  if (existsSync(configPath)) {
    const raw = JSON.parse(await readFile(configPath, 'utf8')) as AutoGuideConfigInput;
    const config = loadConfigFromObject(raw);
    configureRedaction({ extraPatterns: config.redaction?.extraPatterns });
  }
  const outputDir = await resolveOutputDir(cwd);
  const bundle = await loadArtifacts(outputDir);
  const queue = new ReviewQueue();
  queue.loadFromItems(bundle.reviews);
  queue.loadHistory(bundle.reviewHistory);
  queue.seedOverridesFromFacts(bundle.facts);

  if (options.list || (!options.accept && !options.reject && !options.edit)) {
    const items = queue.list();
    if (options.json) {
      console.log(JSON.stringify(items, null, 2));
      return 0;
    }
    if (items.length === 0) {
      console.log('Keine offenen Review-Einträge.');
      return 0;
    }
    for (const item of items) {
      console.log(`${item.factId}\t${item.key}\t${String(item.value ?? '')}\t(${item.confidence})`);
    }
    return 0;
  }

  const factId = options.accept ?? options.reject ?? options.edit;
  if (!factId) {
    console.error('--accept, --reject oder --edit mit factId erforderlich.');
    return 1;
  }

  const factIndex = bundle.facts.findIndex((fact) => fact.id === factId);
  if (factIndex === -1) {
    console.error(`Fact nicht gefunden: ${factId}`);
    return 1;
  }

  if (options.edit && !options.value) {
    console.error('--edit erfordert --value.');
    return 1;
  }

  const decision = options.reject ? 'rejected' : 'approved';
  const editedValue = options.value ?? bundle.facts[factIndex]!.value;
  const result = queue.applyReviewWithVerification(
    bundle.facts[factIndex]!,
    decision,
    editedValue,
    bundle.facts,
  );
  bundle.facts[factIndex] = result.fact;
  const recommendations = appendRecommendation(bundle.recommendations, result.recommendation);

  await saveFactsAndReviews(
    outputDir,
    bundle.facts,
    queue.list(),
    queue.getHistory(),
    recommendations,
  );

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          fact: result.fact,
          action: result.record.action,
          pending: queue.list(),
          history: queue.getHistory(),
          recommendation: result.recommendation ?? null,
        },
        null,
        2,
      ),
    );
  } else if (decision === 'rejected') {
    console.log(`Fact ${factId} abgelehnt.`);
  } else if (result.record.action === 'unsupported_manual_knowledge') {
    console.log(
      `Fact ${factId} gespeichert, aber ohne Scan-Evidenz (${result.record.action}). Empfehlung ergänzt.`,
    );
  } else if (result.record.action === 'verified_after_edit' || result.record.action === 'edited') {
    console.log(`Fact ${factId} bearbeitet und verifiziert (${result.record.action}).`);
  } else {
    console.log(`Fact ${factId} freigegeben.`);
  }
  return 0;
}
