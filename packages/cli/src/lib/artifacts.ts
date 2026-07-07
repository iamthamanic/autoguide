/**
 * @autoguide/cli — load artifacts from .autoguide directory.
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Fact, FlowRecord, PageRecord, ReviewItem } from '@autoguide/core';
import { StorageWriter } from '@autoguide/storage';

export interface ArtifactBundle {
  outputDir: string;
  facts: Fact[];
  pages: PageRecord[];
  flows: FlowRecord[];
  reviews: ReviewItem[];
}

export async function resolveOutputDir(cwd: string): Promise<string> {
  const configPath = join(cwd, 'autoguide.config.json');
  if (!existsSync(configPath)) {
    throw new Error('autoguide.config.json fehlt.');
  }
  const config = JSON.parse(await readFile(configPath, 'utf8')) as { outputDir?: string };
  return join(cwd, config.outputDir ?? '.autoguide');
}

export async function loadArtifacts(outputDir: string): Promise<ArtifactBundle> {
  const paths = new StorageWriter(outputDir).paths;
  const [factsRaw, pagesRaw, flowsRaw, reviewsRaw] = await Promise.all([
    readFile(paths.factsJson, 'utf8'),
    readFile(paths.pagesJson, 'utf8'),
    readFile(paths.flowsJson, 'utf8'),
    readFile(paths.reviewsJson, 'utf8'),
  ]);

  return {
    outputDir,
    facts: JSON.parse(factsRaw) as Fact[],
    pages: JSON.parse(pagesRaw) as PageRecord[],
    flows: JSON.parse(flowsRaw) as FlowRecord[],
    reviews: JSON.parse(reviewsRaw) as ReviewItem[],
  };
}

export async function saveFactsAndReviews(
  outputDir: string,
  facts: Fact[],
  reviews: ReviewItem[],
): Promise<void> {
  const storage = new StorageWriter(outputDir);
  try {
    await storage.writeJson(storage.paths.factsJson, facts);
    await storage.writeJson(storage.paths.reviewsJson, reviews);
  } finally {
    storage.dispose();
  }
}
