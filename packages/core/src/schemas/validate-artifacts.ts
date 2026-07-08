/**
 * @autoguide/core — validate JSON artifact shapes (type guards for runtime/scan).
 */

import { isFact } from '../validators/fact.js';
import type { FeatureRecord, FlowRecord, PageRecord } from '../types/records.js';

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export function isPageRecord(value: unknown): value is PageRecord {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.route === 'string' &&
    typeof v.title === 'string' &&
    isStringArray(v.roleIds) &&
    isStringArray(v.elementIds) &&
    isStringArray(v.featureIds) &&
    isStringArray(v.flowIds) &&
    isStringArray(v.factIds) &&
    typeof v.status === 'string'
  );
}

export function isFeatureRecord(value: unknown): value is FeatureRecord {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.title === 'string' &&
    isStringArray(v.pageIds) &&
    isStringArray(v.roleIds) &&
    isStringArray(v.elementIds) &&
    isStringArray(v.flowIds) &&
    isStringArray(v.factIds) &&
    typeof v.status === 'string'
  );
}

export function isFlowRecord(value: unknown): value is FlowRecord {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.title === 'string' &&
    Array.isArray(v.steps) &&
    isStringArray(v.roleIds) &&
    isStringArray(v.pageIds) &&
    isStringArray(v.factIds) &&
    typeof v.status === 'string'
  );
}

export function validateFactsFile(data: unknown): string[] {
  if (!Array.isArray(data)) return ['facts.json muss ein Array sein.'];
  const errors: string[] = [];
  data.forEach((item, index) => {
    if (!isFact(item)) errors.push(`facts[${index}] hat ungültige Struktur.`);
  });
  return errors;
}

export function validatePagesFile(data: unknown): string[] {
  if (!Array.isArray(data)) return ['pages.json muss ein Array sein.'];
  const errors: string[] = [];
  data.forEach((item, index) => {
    if (!isPageRecord(item)) errors.push(`pages[${index}] hat ungültige Struktur.`);
  });
  return errors;
}

export function validateFeaturesFile(data: unknown): string[] {
  if (!Array.isArray(data)) return ['features.json muss ein Array sein.'];
  const errors: string[] = [];
  data.forEach((item, index) => {
    if (!isFeatureRecord(item)) errors.push(`features[${index}] hat ungültige Struktur.`);
  });
  return errors;
}

export function validateFlowsFile(data: unknown): string[] {
  if (!Array.isArray(data)) return ['flows.json muss ein Array sein.'];
  const errors: string[] = [];
  data.forEach((item, index) => {
    if (!isFlowRecord(item)) errors.push(`flows[${index}] hat ungültige Struktur.`);
  });
  return errors;
}

export function validateScanArtifacts(artifacts: {
  pages: unknown;
  features: unknown;
  flows: unknown;
  facts: unknown;
}): string[] {
  return [
    ...validatePagesFile(artifacts.pages),
    ...validateFeaturesFile(artifacts.features),
    ...validateFlowsFile(artifacts.flows),
    ...validateFactsFile(artifacts.facts),
  ];
}
