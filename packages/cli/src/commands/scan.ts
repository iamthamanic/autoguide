/**
 * @iamthamanic/autoguide-cli — scan command (full pipeline orchestrator).
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import {
  KnowledgeGraph,
  ReviewQueue,
  generateRecommendations,
  generateToursFromFlows,
  validateTours,
  linkRecommendationsToReviewQueue,
  buildScanSnapshot,
  detectChanges,
  mergeRescanFacts,
  markAffectedFeaturesStale,
  createEmptyHistoryLog,
  createHistoryEntry,
  appendHistoryEntry,
  buildEntityGraph,
  linkRecordsToGraph,
  configureRedaction,
  runPluginSetup,
  runPluginScans,
  runPluginTransforms,
  runPluginCleanup,
  applyFactConfidencePolicies,
  buildConfidenceArtifact,
  evaluateSufficiency,
  formatSufficiencySummary,
  type ScanSnapshot,
  type HistoryLog,
  type ReviewActionRecord,
  type PluginLifecycleWarning,
  type SufficiencyReport,
} from '@iamthamanic/autoguide-core';
import { getGitChangedFiles, getGitHead } from '../lib/git-changes.js';
import type { Fact, FlowRecord } from '@iamthamanic/autoguide-core';
import { loadConfigFromObject } from '@iamthamanic/autoguide-config';
import type { AutoGuideConfigInput } from '@iamthamanic/autoguide-config';
import {
  createAiProvider,
  mergeAiProposals,
  recordCloudConsent,
} from '@iamthamanic/autoguide-ai';
import {
  importPlaywrightReport,
  mergePlaywrightEvidence,
  testsToFacts,
  crawlUncoveredRoutes,
  verifyFlows,
  captureRuntimeSnapshots,
  mergeRuntimeSnapshots,
  type PlaywrightTestEvidence,
} from '@iamthamanic/autoguide-playwright';
import { scanSourceProject, mergeScanResults } from '@iamthamanic/autoguide-scanner';
import { StorageWriter } from '@iamthamanic/autoguide-storage';
import { attachFlowDefaults, buildFeatureRecords, toPageRecords } from '../scan/artifacts.js';
import { loadScanRegistry } from '../plugins.js';
import { validateArtifactsWithJsonSchema } from '../lib/json-schema-validator.js';
import { AUTO_SCAN_NEXT_STEPS, flowSeedingWarning } from '../lib/flow-seeding-hint.js';
import { mergePreservedFlows } from '../lib/merge-preserved-flows.js';

export interface ScanOptions {
  sourceDir?: string;
  playwrightReport?: string;
  baseUrl?: string;
  runtime?: boolean;
  runtimeUrl?: string;
  /** Playwright storageState JSON for authenticated runtime capture. */
  storageState?: string;
  crawl?: boolean;
  /**
   * Autonomy orchestrator: sufficiency → escalate with crawl (runtime only if enabled).
   * Prefer explicit flag / `scan.auto` to avoid surprising cost.
   */
  auto?: boolean;
  noAi?: boolean;
  cloudConsent?: boolean;
  verifyFlows?: boolean;
}

function resolveCrawlRoutes(uncoveredRoutes: string[], knownRoutes: string[]): string[] {
  if (uncoveredRoutes.length > 0) return uncoveredRoutes;
  if (knownRoutes.length > 0) return knownRoutes;
  return ['/'];
}

export interface ScanResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
  outputDir: string;
  sufficiency?: SufficiencyReport;
}

function formatPluginWarnings(warnings: PluginLifecycleWarning[]): string[] {
  return warnings.map((item) => `[${item.pluginId}/${item.phase}] ${item.message}`);
}

export async function runScan(cwd: string, options: ScanOptions = {}): Promise<ScanResult> {
  const sourceDir = options.sourceDir ?? 'src';
  const configPath = join(cwd, 'autoguide.config.json');
  if (!existsSync(configPath)) {
    return { ok: false, errors: ['autoguide.config.json fehlt. Bitte zuerst autoguide init ausführen.'], warnings: [], outputDir: '' };
  }

  const raw = JSON.parse(await readFile(configPath, 'utf8')) as AutoGuideConfigInput;
  const config = loadConfigFromObject(raw);
  configureRedaction({
    extraPatterns: config.redaction?.extraPatterns,
  });
  const outputDir = join(cwd, config.outputDir ?? '.autoguide');
  const baseUrl = options.baseUrl ?? config.baseUrl ?? 'http://localhost:5173';
  const pluginWarnings: PluginLifecycleWarning[] = [];

  let pluginLoad;
  try {
    pluginLoad = await loadScanRegistry(cwd, config.plugins ?? []);
  } catch (error) {
    return {
      ok: false,
      errors: [error instanceof Error ? error.message : 'Plugin-Laden fehlgeschlagen'],
      warnings: [],
      outputDir,
    };
  }
  for (const message of pluginLoad.warnings) {
    pluginWarnings.push({ pluginId: 'loader', phase: 'setup', message });
  }

  const setupContext = {
    cwd,
    outputDir,
    sourceDir: join(cwd, sourceDir),
    config: raw as Record<string, unknown>,
  };
  pluginWarnings.push(
    ...(await runPluginSetup(pluginLoad.registry, setupContext, pluginLoad.enabledIds)),
  );

  if (options.cloudConsent) {
    await recordCloudConsent(outputDir);
  }

  const source = await scanSourceProject(join(cwd, sourceDir));
  let merged = mergeScanResults(source);
  let runtimeSnapshot: Parameters<typeof mergeScanResults>[1];
  const runtimeWarnings: string[] = [];

  const gitHead = await getGitHead(cwd);
  const gitChangedFiles = await getGitChangedFiles(cwd, [sourceDir]);
  const currentSnapshot = buildScanSnapshot(
    { routes: source.routes, elements: source.elements },
    gitHead,
  );

  let previousSnapshot: ScanSnapshot | null = null;
  let previousFacts: Fact[] = [];
  let reviewHistory: ReviewActionRecord[] = [];
  let historyLog: HistoryLog = createEmptyHistoryLog();
  const snapshotPath = join(outputDir, 'scan-snapshot.json');
  const historyPath = join(outputDir, 'history.json');
  const factsPath = join(outputDir, 'facts.json');
  const reviewHistoryPath = join(outputDir, 'review-history.json');
  const flowsPath = join(outputDir, 'flows.json');
  let previousFlows: FlowRecord[] = [];

  if (existsSync(snapshotPath)) {
    previousSnapshot = JSON.parse(await readFile(snapshotPath, 'utf8')) as ScanSnapshot;
  }
  if (existsSync(factsPath)) {
    previousFacts = JSON.parse(await readFile(factsPath, 'utf8')) as Fact[];
  }
  if (existsSync(reviewHistoryPath)) {
    reviewHistory = JSON.parse(await readFile(reviewHistoryPath, 'utf8')) as ReviewActionRecord[];
  }
  if (existsSync(historyPath)) {
    historyLog = JSON.parse(await readFile(historyPath, 'utf8')) as HistoryLog;
  }
  if (existsSync(flowsPath)) {
    try {
      const raw = JSON.parse(await readFile(flowsPath, 'utf8')) as unknown;
      if (Array.isArray(raw)) previousFlows = raw as FlowRecord[];
    } catch {
      previousFlows = [];
    }
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
  const playwrightPathWarnings: string[] = [];
  const autoNotes: string[] = [];
  if (reportPathRaw) {
    if (!reportPath || !existsSync(reportPath)) {
      playwrightPathWarnings.push(
        `Playwright-Report nicht gefunden: ${reportPathRaw}. ` +
          'Prüfe `--playwright-import` bzw. `scan.playwrightImportPath`.',
      );
    } else {
      playwrightTests = await importPlaywrightReport(reportPath);
      visitedRoutes = playwrightTests
        .flatMap((test) => test.steps.map((step) => step.title))
        .filter((title) => title.startsWith('goto '))
        .map((title) => title.replace(/^goto\s+/, ''));
    }
  }

  const autoEnabled = options.auto === true || config.scan.auto === true;
  let shouldCrawl = options.crawl === true;

  if (autoEnabled) {
    const provisionalFlows =
      playwrightTests.length > 0
        ? attachFlowDefaults(
            mergePlaywrightEvidence(playwrightTests, knownRoutes, visitedRoutes).flows,
          )
        : [];
    const midSufficiency = evaluateSufficiency({
      flows: mergePreservedFlows(provisionalFlows, previousFlows),
      facts: merged.facts,
      pages: toPageRecords(merged.pages),
    });
    if (midSufficiency.status === 'escalate') {
      shouldCrawl = true;
      autoNotes.push(
        'Auto: Evidenz unzureichend — starte eigenen Playwright-Crawl (kein Host-Report nötig).',
      );
    } else if (midSufficiency.status === 'blocked') {
      autoNotes.push(
        'Auto: keine verwertbare Evidenz — Source-Scan prüfen; Crawl wird trotzdem versucht.',
      );
      shouldCrawl = true;
    } else {
      autoNotes.push('Auto: Evidenz bereits ausreichend — Crawl übersprungen.');
    }
  }

  if (shouldCrawl) {
    const importResult = mergePlaywrightEvidence(playwrightTests, knownRoutes, visitedRoutes);
    const crawlRoutes = resolveCrawlRoutes(importResult.uncoveredRoutes, knownRoutes);
    const crawl = await crawlUncoveredRoutes({
      baseUrl,
      routes: crawlRoutes,
      safeMode: config.scan.safeMode,
      screenshots: false,
      storageStatePath: options.storageState ?? config.scan.storageStatePath,
    });
    playwrightTests = [...playwrightTests, ...crawl.traces];
    visitedRoutes = [...visitedRoutes, ...crawl.visitedRoutes];
    if (crawl.warnings?.length) {
      autoNotes.push(...crawl.warnings);
    }
  }

  if (playwrightTests.length > 0) {
    const importResult = mergePlaywrightEvidence(playwrightTests, knownRoutes, visitedRoutes);
    flowRecords = attachFlowDefaults(importResult.flows);
    extraFacts = [...merged.facts, ...testsToFacts(playwrightTests)];
  }

  // Preserve crawl/playwright ordered flows across source-only / runtime rescans.
  flowRecords = mergePreservedFlows(flowRecords, previousFlows);

  const runtimeEnabled = options.runtime ?? config.scan.runtime ?? false;
  if (runtimeEnabled) {
    const runtimeBaseUrl = options.runtimeUrl ?? baseUrl;
    const routesForRuntime = [
      ...source.routes.map((route) => route.route),
      ...visitedRoutes,
    ];
    const capture = await captureRuntimeSnapshots({
      baseUrl: runtimeBaseUrl,
      routes: routesForRuntime,
      safeMode: config.scan.safeMode,
      storageStatePath: options.storageState ?? config.scan.storageStatePath,
    });
    runtimeWarnings.push(...capture.warnings);
    runtimeSnapshot = mergeRuntimeSnapshots(capture.snapshots);
    merged = mergeScanResults(source, runtimeSnapshot);
    if (playwrightTests.length > 0) {
      extraFacts = [...merged.facts, ...testsToFacts(playwrightTests)];
    } else {
      extraFacts = merged.facts;
    }
  }

  const pluginScan = await runPluginScans(
    pluginLoad.registry,
    setupContext,
    pluginLoad.enabledIds,
  );
  pluginWarnings.push(...pluginScan.warnings);
  extraFacts = [...extraFacts, ...pluginScan.facts];

  const factGraph = new KnowledgeGraph();
  let mergeResult = factGraph.mergeFacts(extraFacts);
  const mergeConflicts = [...mergeResult.conflicts];

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
        const aiIncoming = aiMerge.facts.slice(mergeResult.facts.length);
        if (aiIncoming.length > 0) {
          const aiResult = factGraph.mergeFacts(aiIncoming);
          mergeConflicts.push(...aiResult.conflicts);
          mergeResult = aiResult;
        }
      } catch {
        // Scan continues without AI when provider is unavailable or invalid.
      }
    }
  }

  const transformed = await runPluginTransforms(
    pluginLoad.registry,
    factGraph,
    pluginLoad.enabledIds,
  );
  pluginWarnings.push(...transformed.warnings);
  mergeResult = { ...mergeResult, facts: transformed.graph.listFacts() };

  let pageRecords = toPageRecords(merged.pages).map((page) =>
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
  const facts: Fact[] = rescanMerge.facts.map(applyFactConfidencePolicies);

  historyLog = appendHistoryEntry(
    historyLog,
    createHistoryEntry(changeDetection, rescanMerge.staleFactIds, gitHead),
  );

  const queue = new ReviewQueue();
  queue.seedOverridesFromFacts(previousFacts);
  const reviewItems = queue.seedFromFacts(facts);

  const recommendationHints = source.elements.map((element) => ({
    filePath: element.filePath,
    line: element.line,
    componentName: element.componentName,
    handlerName: element.handlerName,
    hasDataDoc: Boolean(element.dataDocKey),
    missingAriaLabel: element.missingAriaLabel,
  }));
  const recommendations = linkRecommendationsToReviewQueue(
    generateRecommendations(facts, recommendationHints),
    reviewItems,
  );

  const featureRecords = buildFeatureRecords(facts);
  const linkedFeatures = markAffectedFeaturesStale(
    featureRecords,
    changeDetection,
    pageRecords,
    new Set(rescanMerge.staleFactIds),
  );

  if (options.verifyFlows && flowRecords.length > 0) {
    flowRecords = await verifyFlows(flowRecords, {
      baseUrl,
      outputDir,
      safeMode: config.scan.safeMode,
    });
  }

  const entityGraph = buildEntityGraph({
    pages: pageRecords,
    features: linkedFeatures,
    flows: flowRecords,
    facts,
    sourceElements: source.elements,
  });
  const linked = linkRecordsToGraph(pageRecords, linkedFeatures, entityGraph);
  pageRecords = linked.pages;
  const linkedFeaturesFinal = linked.features;

  const validationErrors = validateArtifactsWithJsonSchema({
    pages: pageRecords,
    features: linkedFeaturesFinal,
    flows: flowRecords,
    facts,
    confidence: {
      scores: Object.fromEntries(facts.map((fact) => [fact.id, fact.confidence])),
    },
  });

  const tours = generateToursFromFlows(flowRecords);
  const tourValidationErrors = validateTours(tours).map((error) => `tours.json: ${error}`);
  validationErrors.push(...tourValidationErrors);

  const sufficiency = evaluateSufficiency({
    flows: flowRecords,
    facts,
    pages: pageRecords,
  });

  if (validationErrors.length > 0) {
    return {
      ok: false,
      errors: validationErrors,
      warnings: formatPluginWarnings(pluginWarnings),
      outputDir,
      sufficiency,
    };
  }

  const storage = new StorageWriter(outputDir);
  try {
    await storage.writeJson(storage.paths.pagesJson, pageRecords);
    await storage.writeJson(storage.paths.featuresJson, linkedFeaturesFinal);
    await storage.writeJson(storage.paths.flowsJson, flowRecords);
    await storage.writeJson(storage.paths.factsJson, facts);
    await storage.writeJson(storage.paths.reviewsJson, queue.list());
    await storage.writeJson(storage.paths.reviewHistoryJson, reviewHistory);
    await storage.writeJson(storage.paths.recommendationsJson, recommendations);
    await storage.writeJson(storage.paths.toursJson, tours);
    await storage.writeJson(storage.paths.sufficiencyJson, sufficiency);
    await storage.writeJson(storage.paths.historyJson, historyLog);
    await storage.writeJson(storage.paths.scanSnapshotJson, currentSnapshot);
    await storage.writeJson(storage.paths.graphJson, entityGraph.toData());
    await storage.writeJson(storage.paths.confidenceJson, buildConfidenceArtifact(facts, mergeConflicts));
    if (runtimeSnapshot) {
      await storage.writeRuntimeSnapshot(runtimeSnapshot);
    }

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
    storage.index.rebuildSearchFts(pageRecords, flowRecords);
  } finally {
    storage.dispose();
  }

  pluginWarnings.push(
    ...(await runPluginCleanup(pluginLoad.registry, pluginLoad.enabledIds)),
  );

  const orderedFlowCount = flowRecords.filter((flow) => flow.steps.length >= 1).length;
  const seedingHint = flowSeedingWarning(orderedFlowCount);
  const autoFollowUp =
    autoEnabled && sufficiency.status !== 'sufficient' ? [AUTO_SCAN_NEXT_STEPS] : [];

  return {
    ok: true,
    errors: [],
    warnings: [
      ...formatPluginWarnings(pluginWarnings),
      ...runtimeWarnings,
      ...playwrightPathWarnings,
      ...autoNotes,
      formatSufficiencySummary(sufficiency),
      ...(seedingHint ? [seedingHint] : []),
      ...autoFollowUp,
    ],
    outputDir,
    sufficiency,
  };
}
