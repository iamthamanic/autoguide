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
  generateRecommendations,
  buildScanSnapshot,
  detectChanges,
  mergeRescanFacts,
  createEmptyHistoryLog,
  createHistoryEntry,
  appendHistoryEntry,
  type ScanSnapshot,
  type HistoryLog,
} from '@autoguide/core';
import { getGitChangedFiles, getGitHead } from '../lib/git-changes.js';
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
import { createBuiltinRegistry } from '../plugins.js';

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

  createBuiltinRegistry(config.plugins ?? []);

  if (options.cloudConsent) {
    await recordCloudConsent(outputDir);
  }

  const source = await scanSourceProject(join(cwd, sourceDir));
  const merged = mergeScanResults(source);

  const gitHead = await getGitHead(cwd);
  const gitChangedFiles = await getGitChangedFiles(cwd, [sourceDir]);
  const currentSnapshot = buildScanSnapshot(
    { routes: source.routes, elements: source.elements },
    gitHead,
  );

  let previousSnapshot: ScanSnapshot | null = null;
  let previousFacts: Fact[] = [];
  let historyLog: HistoryLog = createEmptyHistoryLog();
  const snapshotPath = join(outputDir, 'scan-snapshot.json');
  const historyPath = join(outputDir, 'history.json');
  const factsPath = join(outputDir, 'facts.json');

  if (existsSync(snapshotPath)) {
    previousSnapshot = JSON.parse(await readFile(snapshotPath, 'utf8')) as ScanSnapshot;
  }
  if (existsSync(factsPath)) {
    previousFacts = JSON.parse(await readFile(factsPath, 'utf8')) as Fact[];
  }
  if (existsSync(historyPath)) {
    historyLog = JSON.parse(await readFile(historyPath, 'utf8')) as HistoryLog;
  }

  const changeDetection = detectChanges(previousSnapshot, currentSnapshot, gitChangedFiles);

  let extraFacts = merged.facts;
  let flowRecords: FlowRecord[] = [];

  const knownRoutes = merged.pages.map((page) => page.route);
  let visitedRoutes: string[] = [];
  let playwrightTests: PlaywrightTestEvidence[] = [];

  const reportPathRaw =
    options.playwrightReport ?? config.scan.playwrightImportPath;
  const reportPath = reportPathRaw
    ? reportPathRaw.startsWith('/')
      ? reportPathRaw
      : join(cwd, reportPathRaw)
    : undefined;
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

  const pageRecords = toPageRecords(merged.pages).map((page) =>
    changeDetection.changedRoutes.includes(page.route)
      ? { ...page, status: 'stale' as const }
      : page,
  );
  const rescanMerge = mergeRescanFacts(
    previousFacts,
    mergeResult.facts,
    changeDetection,
    gitHead,
  );
  const facts: Fact[] = rescanMerge.facts;

  historyLog = appendHistoryEntry(
    historyLog,
    createHistoryEntry(changeDetection, rescanMerge.staleFactIds, gitHead),
  );

  const queue = new ReviewQueue();
  queue.seedFromFacts(facts);

  const recommendationHints = source.elements.map((element) => ({
    filePath: element.filePath,
    line: element.line,
    componentName: element.componentName,
    handlerName: element.handlerName,
    hasDataDoc: Boolean(element.dataDocKey),
    missingAriaLabel: element.missingAriaLabel,
  }));
  const recommendations = generateRecommendations(facts, recommendationHints);

  const featureRecords = buildFeatureRecords(facts);

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
    await storage.writeJson(storage.paths.recommendationsJson, recommendations);
    await storage.writeJson(storage.paths.historyJson, historyLog);
    await storage.writeJson(storage.paths.scanSnapshotJson, currentSnapshot);
    await storage.writeJson(storage.paths.confidenceJson, {
      scores: Object.fromEntries(facts.map((f) => [f.id, f.confidence])),
    });

    const now = new Date().toISOString();
    for (const page of pageRecords) {
      storage.index.upsertPageIndex({
        id: page.id,
        route: page.route,
        title: page.title,
        status: page.status,
        updatedAt: now,
      });
    }
    for (const flow of flowRecords) {
      storage.index.upsertFlowIndex({
        id: flow.id,
        title: flow.title,
        body: flow.steps.map((step) => step.title).join(' '),
        status: flow.status,
        updatedAt: now,
      });
    }
    for (const fact of facts) {
      storage.index.upsertFactIndex({
        id: fact.id,
        entityId: fact.entityId,
        key: fact.key,
        confidence: fact.confidence,
        reviewStatus: fact.reviewStatus,
        updatedAt: fact.updatedAt,
      });
    }
  } finally {
    storage.dispose();
  }

  return { ok: true, errors: [], outputDir };
}
