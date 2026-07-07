/**
 * @autoguide/cli — scan command (source + merge pipeline).
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { KnowledgeGraph, ReviewQueue } from '@autoguide/core';
import type { FlowRecord } from '@autoguide/core';
import {
  importPlaywrightReport,
  mergePlaywrightEvidence,
  testsToFacts,
  crawlUncoveredRoutes,
  type PlaywrightTestEvidence,
} from '@autoguide/playwright';
import { scanSourceProject, mergeScanResults } from '@autoguide/scanner';
import { StorageWriter } from '@autoguide/storage';

export interface ScanOptions {
  sourceDir?: string;
  playwrightReport?: string;
  baseUrl?: string;
  crawl?: boolean;
}

export async function runScan(cwd: string, options: ScanOptions = {}): Promise<void> {
  const sourceDir = options.sourceDir ?? 'src';
  const configPath = join(cwd, 'autoguide.config.json');
  const config = JSON.parse(await readFile(configPath, 'utf8')) as {
    outputDir?: string;
    baseUrl?: string;
  };
  const outputDir = join(cwd, config.outputDir ?? '.autoguide');
  const baseUrl = options.baseUrl ?? config.baseUrl ?? 'http://localhost:5173';

  const source = await scanSourceProject(join(cwd, sourceDir));
  const merged = mergeScanResults(source);

  let extraFacts = merged.facts;
  let flowRecords: FlowRecord[] = [];

  const knownRoutes = merged.pages.map((page) => page.route);
  let visitedRoutes: string[] = [];
  let playwrightTests: PlaywrightTestEvidence[] = [];

  if (options.playwrightReport && existsSync(options.playwrightReport)) {
    playwrightTests = await importPlaywrightReport(options.playwrightReport);
    visitedRoutes = playwrightTests
      .flatMap((test) => test.steps.map((step) => step.title))
      .filter((title) => title.startsWith('goto '))
      .map((title) => title.replace(/^goto\s+/, ''));
  }

  if (options.crawl) {
    const importResult = mergePlaywrightEvidence(playwrightTests, knownRoutes, visitedRoutes);
    const crawl = await crawlUncoveredRoutes({
      baseUrl,
      routes: importResult.uncoveredRoutes,
      safeMode: true,
      screenshots: false,
    });
    playwrightTests = [...playwrightTests, ...crawl.traces];
    visitedRoutes = [...visitedRoutes, ...crawl.visitedRoutes];
  }

  if (playwrightTests.length > 0) {
    const importResult = mergePlaywrightEvidence(playwrightTests, knownRoutes, visitedRoutes);
    flowRecords = importResult.flows;
    extraFacts = [...merged.facts, ...testsToFacts(playwrightTests)];
  }

  const graph = new KnowledgeGraph();
  const mergeResult = graph.mergeFacts(extraFacts);

  const queue = new ReviewQueue();
  queue.seedFromFacts(mergeResult.facts);

  const storage = new StorageWriter(outputDir);
  try {
    await storage.writeJson(storage.paths.pagesJson, merged.pages);
    await storage.writeJson(storage.paths.flowsJson, flowRecords);
    await storage.writeJson(storage.paths.factsJson, mergeResult.facts);
    await storage.writeJson(storage.paths.reviewsJson, queue.list());
    await storage.writeJson(storage.paths.confidenceJson, {
      scores: Object.fromEntries(mergeResult.facts.map((f) => [f.id, f.confidence])),
    });
  } finally {
    storage.dispose();
  }
}
