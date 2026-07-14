/**
 * @autoguide/cli — generate derived artifacts without re-scanning.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  generateRecommendations,
  generateToursFromFlows,
  validateTours,
} from '@autoguide/core';
import { StorageWriter } from '@autoguide/storage';
import { loadArtifacts, resolveOutputDir } from '../lib/artifacts.js';

export type GenerateTarget = 'tours' | 'recommendations' | 'bundle';

export interface GenerateResult {
  ok: boolean;
  outputDir: string;
  written: string[];
  errors: string[];
}

async function ensureArtifacts(cwd: string): Promise<{ outputDir: string } | GenerateResult> {
  if (!existsSync(join(cwd, 'autoguide.config.json'))) {
    return { ok: false, outputDir: '', written: [], errors: ['autoguide.config.json fehlt.'] };
  }
  const outputDir = await resolveOutputDir(cwd);
  if (!existsSync(outputDir)) {
    return {
      ok: false,
      outputDir,
      written: [],
      errors: ['.autoguide/ fehlt — zuerst `autoguide scan` ausführen.'],
    };
  }
  return { outputDir };
}

export async function runGenerateTours(cwd: string): Promise<GenerateResult> {
  const ready = await ensureArtifacts(cwd);
  if ('ok' in ready && ready.ok === false) return ready;
  const outputDir = ready.outputDir;
  const bundle = await loadArtifacts(outputDir);
  const tours = generateToursFromFlows(bundle.flows);
  const errors = validateTours(tours);
  if (errors.length > 0) {
    return { ok: false, outputDir, written: [], errors };
  }

  const storage = new StorageWriter(outputDir);
  try {
    await storage.writeJson(storage.paths.toursJson, tours);
  } finally {
    storage.dispose();
  }

  return { ok: true, outputDir, written: ['tours.json'], errors: [] };
}

export async function runGenerateRecommendations(cwd: string): Promise<GenerateResult> {
  const ready = await ensureArtifacts(cwd);
  if ('ok' in ready && ready.ok === false) return ready;
  const outputDir = ready.outputDir;
  const bundle = await loadArtifacts(outputDir);
  const recommendations = generateRecommendations(bundle.facts);

  const storage = new StorageWriter(outputDir);
  try {
    await storage.writeJson(storage.paths.recommendationsJson, recommendations);
  } finally {
    storage.dispose();
  }

  return { ok: true, outputDir, written: ['recommendations.json'], errors: [] };
}

export async function runGenerateBundle(cwd: string): Promise<GenerateResult> {
  const tours = await runGenerateTours(cwd);
  if (!tours.ok) return tours;

  const recommendations = await runGenerateRecommendations(cwd);
  if (!recommendations.ok) return recommendations;

  const outputDir = tours.outputDir;
  const manifest = {
    version: '0.1.0',
    generatedAt: new Date().toISOString(),
    artifacts: ['tours.json', 'recommendations.json'],
    runtimeArtifacts: ['facts.json', 'pages.json', 'flows.json', 'tours.json', 'recommendations.json'],
  };
  const storage = new StorageWriter(outputDir);
  try {
    await storage.writeJson(storage.paths.docBundleJson, manifest);
  } finally {
    storage.dispose();
  }

  return {
    ok: true,
    outputDir,
    written: ['tours.json', 'recommendations.json', 'doc-bundle.json'],
    errors: [],
  };
}

export async function runGenerate(cwd: string, target: GenerateTarget): Promise<number> {
  const result =
    target === 'tours'
      ? await runGenerateTours(cwd)
      : target === 'recommendations'
        ? await runGenerateRecommendations(cwd)
        : await runGenerateBundle(cwd);

  if (!result.ok) {
    for (const error of result.errors) console.error(error);
    return 1;
  }

  console.log(`Generate abgeschlossen (${result.outputDir}).`);
  for (const file of result.written) {
    console.log(`- ${file}`);
  }
  return 0;
}
