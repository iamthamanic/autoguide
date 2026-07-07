/**
 * @autoguide/cli — scan command (source + merge pipeline).
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { KnowledgeGraph, ReviewQueue } from '@autoguide/core';
import { scanSourceProject, mergeScanResults } from '@autoguide/scanner';
import { StorageWriter } from '@autoguide/storage';

export async function runScan(cwd: string, sourceDir = 'src'): Promise<void> {
  const configPath = join(cwd, 'autoguide.config.json');
  const config = JSON.parse(await readFile(configPath, 'utf8')) as { outputDir?: string };
  const outputDir = join(cwd, config.outputDir ?? '.autoguide');

  const source = await scanSourceProject(join(cwd, sourceDir));
  const merged = mergeScanResults(source);

  const graph = new KnowledgeGraph();
  const mergeResult = graph.mergeFacts(merged.facts);

  const queue = new ReviewQueue();
  queue.seedFromFacts(mergeResult.facts);

  const storage = new StorageWriter(outputDir);
  try {
    await storage.writeJson(storage.paths.pagesJson, merged.pages);
    await storage.writeJson(storage.paths.factsJson, mergeResult.facts);
    await storage.writeJson(storage.paths.reviewsJson, queue.list());
    await storage.writeJson(storage.paths.confidenceJson, {
      scores: Object.fromEntries(mergeResult.facts.map((f) => [f.id, f.confidence])),
    });
  } finally {
    storage.dispose();
  }
}
