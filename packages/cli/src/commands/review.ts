/**
 * @autoguide/cli — review command for pending facts.
 */

import { ReviewQueue } from '@autoguide/core';
import { loadArtifacts, resolveOutputDir, saveFactsAndReviews } from '../lib/artifacts.js';

export interface ReviewCommandOptions {
  json?: boolean;
  list?: boolean;
  accept?: string;
  reject?: string;
  value?: string;
}

export async function runReview(cwd: string, options: ReviewCommandOptions = {}): Promise<number> {
  const outputDir = await resolveOutputDir(cwd);
  const bundle = await loadArtifacts(outputDir);
  const queue = new ReviewQueue();
  queue.loadFromItems(bundle.reviews);

  if (options.list || (!options.accept && !options.reject)) {
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

  const factId = options.accept ?? options.reject;
  if (!factId) {
    console.error('--accept oder --reject mit factId erforderlich.');
    return 1;
  }

  const factIndex = bundle.facts.findIndex((fact) => fact.id === factId);
  if (factIndex === -1) {
    console.error(`Fact nicht gefunden: ${factId}`);
    return 1;
  }

  const decision = options.reject ? 'rejected' : 'approved';
  const updated = queue.applyDecision(
    bundle.facts[factIndex]!,
    decision,
    options.value ?? bundle.facts[factIndex]!.value,
  );
  bundle.facts[factIndex] = updated;
  await saveFactsAndReviews(outputDir, bundle.facts, queue.list());

  if (options.json) {
    console.log(JSON.stringify({ fact: updated, pending: queue.list() }, null, 2));
  } else {
    console.log(
      decision === 'approved'
        ? `Fact ${factId} freigegeben.`
        : `Fact ${factId} abgelehnt.`,
    );
  }
  return 0;
}
