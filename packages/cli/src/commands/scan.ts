/**
 * @autoguide/cli — scan command (full pipeline orchestrator).
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import {
  KnowledgeGraph,
  ReviewQueue,
  validateScanArtifacts,
} from '@autoguide/core';
import type { Fact, FlowRecord } from '@autoguide/core';
import { loadConfigFromObject } from '@autoguide/config';
import type { AutoGuideConfigInput } from '@autoguide/config';
import {
  createAiProvider,
  mergeAiProposals,
  recordCloudConsent,
} from '@autoguide/ai';
import {
  importPlaywrightReport,
  mergePlaywrightEvidence,
  testsToFacts,
  crawlUncoveredRoutes,
  type PlaywrightTestEvidence,
} from '@autoguide/playwright';
import { scanSourceProject, mergeScanResults } from '@autoguide/scanner';
import { StorageWriter } from '@autoguide/storage';
import { attachFlowDefaults, buildFeatureRecords, toPageRecords } from '../scan/artifacts.js';

export interface ScanOptions {
  sourceDir?: string;
  playwrightReport?: string;
  baseUrl?: string;
  crawl?: boolean;
  noAi?: boolean;
  cloudConsent?: boolean;
}

export interface ScanResult {
  ok: boolean;
  errors: string[];
  outputDir: string;
}

export async function runScan(cwd: string, options: ScanOptions = {}): Promise<ScanResult> {
  const sourceDir = options.sourceDir ?? 'src';
  const configPath = join(cwd, 'autoguide.config.json');
  if (!existsSync(configPath)) {
    return { ok: false, errors: ['autoguide.config.json fehlt. Bitte zuerst autoguide init ausführen.'], outputDir: '' };
  }

  const raw = JSON.parse(await readFile(configPath, 'utf8')) as AutoGuideConfigInput;
  const config = loadConfigFromObject(raw);
  const outputDir = join(cwd, config.outputDir ?? '.autoguide');
  const baseUrl = options.baseUrl ?? config.baseUrl ?? 'http://localhost:5173';

  if (options.cloudConsent) {
    await recordCloudConsent(outputDir);
  }

  const source = await scanSourceProject(join(cwd, sourceDir));
  const merged = mergeScanResults(source);

  let extraFacts = merged.facts;
  let flowRecords: FlowRecord[] = [];

  const knownRoutes = merged.pages.map((page) => page.route);
  let visitedRoutes: string[] = [];
  let playwrightTests: PlaywrightTestEvidence[] = [];

  const reportPath =
    options.playwrightReport ?? config.scan.playwrightImportPath;
  if (reportPath && existsSync(reportPath)) {
    playwrightTests = await importPlaywrightReport(reportPath);
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
      safeMode: config.scan.safeMode,
      screenshots: false,
    });
    playwrightTests = [...playwrightTests, ...crawl.traces];
    visitedRoutes = [...visitedRoutes, ...crawl.visitedRoutes];
  }

  if (playwrightTests.length > 0) {
    const importResult = mergePlaywrightEvidence(playwrightTests, knownRoutes, visitedRoutes);
    flowRecords = attachFlowDefaults(importResult.flows);
    extraFacts = [...merged.facts, ...testsToFacts(playwrightTests)];
  }

  const graph = new KnowledgeGraph();
  let mergeResult = graph.mergeFacts(extraFacts);

  if (!options.noAi && config.ai.provider !== 'none') {
    const provider = createAiProvider(config, { outputDir });
    if (provider && (await provider.isAvailable())) {
      try {
        const inputs = mergeResult.facts.slice(0, 20).map((fact) => ({
          entityId: fact.entityId,
          key: fact.key,
          value: fact.value,
        }));
        const proposals = await provider.proposeDescriptions(inputs);
        const aiMerge = mergeAiProposals(mergeResult.facts, proposals);
        const aiGraph = new KnowledgeGraph();
        mergeResult = aiGraph.mergeFacts(aiMerge.facts);
      } catch {
        // Scan continues without AI when provider is unavailable or invalid.
      }
    }
  }

  const queue = new ReviewQueue();
  queue.seedFromFacts(mergeResult.facts);

  const pageRecords = toPageRecords(merged.pages);
  const featureRecords = buildFeatureRecords(mergeResult.facts);
  const facts: Fact[] = mergeResult.facts;

  const validationErrors = validateScanArtifacts({
    pages: pageRecords,
    features: featureRecords,
    flows: flowRecords,
    facts,
  });

  if (validationErrors.length > 0) {
    return { ok: false, errors: validationErrors, outputDir };
  }

  const storage = new StorageWriter(outputDir);
  try {
    await storage.writeJson(storage.paths.pagesJson, pageRecords);
    await storage.writeJson(storage.paths.featuresJson, featureRecords);
    await storage.writeJson(storage.paths.flowsJson, flowRecords);
    await storage.writeJson(storage.paths.factsJson, facts);
    await storage.writeJson(storage.paths.reviewsJson, queue.list());
    await storage.writeJson(storage.paths.confidenceJson, {
      scores: Object.fromEntries(facts.map((f) => [f.id, f.confidence])),
    });
  } finally {
    storage.dispose();
  }

  return { ok: true, errors: [], outputDir };
}
