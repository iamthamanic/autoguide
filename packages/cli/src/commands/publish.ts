/**
 * @autoguide/cli — publish command (switch to published mode).
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { isDestructiveActionKey, minimumConfidenceForKey } from '@autoguide/core';
import { loadConfigFromObject } from '@autoguide/config';
import type { AutoGuideConfigInput } from '@autoguide/config';
import { loadArtifacts, resolveOutputDir } from '../lib/artifacts.js';

export async function runPublish(cwd: string): Promise<number> {
  const configPath = join(cwd, 'autoguide.config.json');
  const raw = JSON.parse(await readFile(configPath, 'utf8')) as AutoGuideConfigInput;
  const config = loadConfigFromObject(raw);
  const outputDir = await resolveOutputDir(cwd);
  const bundle = await loadArtifacts(outputDir);

  const blockers = bundle.facts.filter((fact) => {
    const highImpact = isDestructiveActionKey(fact.key);
    const threshold = minimumConfidenceForKey(fact.key);
    const unapproved = fact.reviewStatus !== 'approved';
    const lowConfidence = fact.confidence < threshold;
    return (highImpact && unapproved) || (unapproved && lowConfidence && fact.status !== 'manual_override');
  });

  if (blockers.length > 0) {
    console.error('Veröffentlichung blockiert — offene Review-Punkte:');
    for (const fact of blockers.slice(0, 10)) {
      console.error(`- ${fact.id} (${fact.key}): confidence ${fact.confidence}`);
    }
    return 1;
  }

  const failedFlows = bundle.flows.filter(
    (flow) =>
      flow.verification?.status === 'failed' || flow.verification?.status === 'partial',
  );
  if (failedFlows.length > 0) {
    console.error('Veröffentlichung blockiert — Flow-Verifikation fehlgeschlagen:');
    for (const flow of failedFlows.slice(0, 10)) {
      console.error(`- ${flow.id} (${flow.title}): ${flow.verification?.status}`);
    }
    return 1;
  }

  const nextConfig = {
    ...raw,
    mode: 'published' as const,
  };
  await writeFile(configPath, `${JSON.stringify(nextConfig, null, 2)}\n`, 'utf8');
  await writeFile(
    join(outputDir, 'published.marker.json'),
    `${JSON.stringify({ publishedAt: new Date().toISOString() }, null, 2)}\n`,
    'utf8',
  );

  console.log('AutoGuide veröffentlicht — Modus: published');
  console.log(`Freigegebene Facts: ${bundle.facts.filter((f) => f.reviewStatus === 'approved').length}`);
  return 0;
}
