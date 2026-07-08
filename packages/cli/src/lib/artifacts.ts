/**
 * @autoguide/cli — load artifacts from .autoguide directory.
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Fact, FlowRecord, PageRecord, Recommendation, ReviewActionRecord, ReviewItem } from '@autoguide/core';
import { StorageWriter } from '@autoguide/storage';

export interface ArtifactBundle {
  outputDir: string;
  facts: Fact[];
  pages: PageRecord[];
  flows: FlowRecord[];
  reviews: ReviewItem[];
  reviewHistory: ReviewActionRecord[];
  recommendations: Recommendation[];
}

export async function resolveOutputDir(cwd: string): Promise<string> {
  const configPath = join(cwd, 'autoguide.config.json');
  if (!existsSync(configPath)) {
    throw new Error('autoguide.config.json fehlt.');
  }
  const config = JSON.parse(await readFile(configPath, 'utf8')) as { outputDir?: string };
  return join(cwd, config.outputDir ?? '.autoguide');
}

async function readJsonFile<T>(path: string, fallback: T): Promise<T> {
  if (!existsSync(path)) return fallback;
  return JSON.parse(await readFile(path, 'utf8')) as T;
}

export async function loadArtifacts(outputDir: string): Promise<ArtifactBundle> {
  const paths = new StorageWriter(outputDir).paths;
  const [facts, pages, flows, reviews, reviewHistory, recommendations] = await Promise.all([
    readJsonFile<Fact[]>(paths.factsJson, []),
    readJsonFile<PageRecord[]>(paths.pagesJson, []),
    readJsonFile<FlowRecord[]>(paths.flowsJson, []),
    readJsonFile<ReviewItem[]>(paths.reviewsJson, []),
    readJsonFile<ReviewActionRecord[]>(paths.reviewHistoryJson, []),
    readJsonFile<Recommendation[]>(paths.recommendationsJson, []),
  ]);

  return {
    outputDir,
    facts,
    pages,
    flows,
    reviews,
    reviewHistory,
    recommendations,
  };
}

export async function saveFactsAndReviews(
  outputDir: string,
  facts: Fact[],
  reviews: ReviewItem[],
  reviewHistory: ReviewActionRecord[],
  recommendations?: Recommendation[],
): Promise<void> {
  const storage = new StorageWriter(outputDir);
  try {
    await storage.writeJson(storage.paths.factsJson, facts);
    await storage.writeJson(storage.paths.reviewsJson, reviews);
    await storage.writeJson(storage.paths.reviewHistoryJson, reviewHistory);
    if (recommendations) {
      await storage.writeJson(storage.paths.recommendationsJson, recommendations);
    }
  } finally {
    storage.dispose();
  }
}
