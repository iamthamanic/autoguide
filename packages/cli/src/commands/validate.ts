/**
 * @autoguide/cli — validate command for CI documentation checks.
 */

import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  isDestructiveActionKey,
  type FeatureRecord,
} from '@autoguide/core';
import { StorageWriter } from '@autoguide/storage';
import { loadArtifacts, resolveOutputDir } from '../lib/artifacts.js';
import { validateArtifactsWithJsonSchema } from '../lib/json-schema-validator.js';

export interface ValidateOptions {
  soft?: boolean;
  json?: boolean;
  maxStale?: number;
}

export interface ValidateResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

export async function runValidate(
  cwd: string,
  options: ValidateOptions = {},
): Promise<ValidateResult> {
  const maxStale = options.maxStale ?? 0;
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!existsSync(join(cwd, 'autoguide.config.json'))) {
    errors.push('autoguide.config.json fehlt.');
    return { ok: false, errors, warnings };
  }

  let outputDir: string;
  try {
    outputDir = await resolveOutputDir(cwd);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Konfiguration ungültig.');
    return { ok: false, errors, warnings };
  }

  if (!existsSync(outputDir)) {
    errors.push('.autoguide/ fehlt — zuerst `autoguide scan` ausführen.');
    return { ok: false, errors, warnings };
  }

  const paths = new StorageWriter(outputDir).paths;
  let features: FeatureRecord[] = [];

  try {
    const bundle = await loadArtifacts(outputDir);
    const featuresRaw = await readFile(paths.featuresJson, 'utf8');
    features = JSON.parse(featuresRaw) as FeatureRecord[];
    const confidenceRaw = await readFile(paths.confidenceJson, 'utf8');
    const confidence = JSON.parse(confidenceRaw) as unknown;

    errors.push(
      ...validateArtifactsWithJsonSchema({
        pages: bundle.pages,
        features,
        flows: bundle.flows,
        facts: bundle.facts,
        confidence,
      }),
    );

    const staleFacts = bundle.facts.filter((fact) => fact.status === 'stale');
    const stalePages = bundle.pages.filter((page) => page.status === 'stale');
    const criticalStale = staleFacts.filter(
      (fact) => fact.reviewStatus === 'approved' || isDestructiveActionKey(fact.key),
    );

    if (staleFacts.length > maxStale) {
      const message = `${staleFacts.length} veraltete Facts (Schwelle: ${maxStale}).`;
      if (options.soft) warnings.push(message);
      else errors.push(message);
    }

    if (stalePages.length > 0) {
      const message = `${stalePages.length} veraltete Seiten.`;
      if (options.soft) warnings.push(message);
      else errors.push(message);
    }

    if (criticalStale.length > 0) {
      const message = `${criticalStale.length} veraltete freigegebene oder kritische Facts.`;
      if (options.soft) warnings.push(message);
      else errors.push(message);
    }

    const openDestructive = bundle.facts.filter(
      (fact) =>
        isDestructiveActionKey(fact.key) &&
        fact.reviewStatus !== 'approved' &&
        fact.status !== 'manual_override',
    );
    if (openDestructive.length > 0) {
      const message = `${openDestructive.length} ungeprüfte kritische Aktionen.`;
      if (options.soft) warnings.push(message);
      else errors.push(message);
    }

    if (bundle.reviews.length > 0 && !options.soft) {
      warnings.push(`${bundle.reviews.length} offene Review-Einträge.`);
    }
  } catch {
    errors.push('Artefakte konnten nicht gelesen oder validiert werden.');
  }

  return { ok: errors.length === 0, errors, warnings };
}

export async function runValidateCommand(
  cwd: string,
  options: ValidateOptions = {},
): Promise<number> {
  const result = await runValidate(cwd, options);

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    for (const warning of result.warnings) {
      console.warn(`Warnung: ${warning}`);
    }
    for (const error of result.errors) {
      console.error(error);
    }
    if (result.ok && result.warnings.length === 0) {
      console.log('Validierung erfolgreich.');
    } else if (result.ok) {
      console.log('Validierung mit Warnungen abgeschlossen (--soft).');
    }
  }

  return result.ok ? 0 : 1;
}
