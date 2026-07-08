/**
 * @autoguide/core — mark facts stale when source routes/components change.
 */

import type { Fact } from '../types/fact.js';
import type { ChangeDetectionResult } from './types.js';

function factIsAffected(fact: Fact, detection: ChangeDetectionResult): boolean {
  if (detection.changedComponents.includes(fact.entityId)) return true;

  for (const provenance of fact.provenance) {
    if (provenance.route && detection.changedRoutes.includes(provenance.route)) return true;
    if (!provenance.filePath) continue;
    const normalized = provenance.filePath.replace(/\\/g, '/');
    if (
      detection.changedFiles.some(
        (file) =>
          normalized === file ||
          normalized.endsWith(file) ||
          file.endsWith(normalized),
      )
    ) {
      return true;
    }
  }
  return false;
}

function shouldMarkStale(fact: Fact): boolean {
  return fact.reviewStatus === 'approved' || fact.status === 'verified' || fact.status === 'manual_override';
}

export function markAffectedFactsStale(
  facts: Fact[],
  detection: ChangeDetectionResult,
  sourceVersion?: string,
): { facts: Fact[]; staleFactIds: string[] } {
  if (detection.changedFiles.length === 0) {
    return { facts, staleFactIds: [] };
  }

  const staleFactIds: string[] = [];
  const updated = facts.map((fact) => {
    if (!shouldMarkStale(fact) || !factIsAffected(fact, detection)) return fact;
    staleFactIds.push(fact.id);
    return {
      ...fact,
      status: 'stale' as const,
      reviewStatus: 'pending' as const,
      sourceVersion: fact.sourceVersion ?? sourceVersion,
      updatedAt: new Date().toISOString(),
    };
  });

  return { facts: updated, staleFactIds };
}

export function stampFreshFacts(facts: Fact[], sourceVersion?: string): Fact[] {
  if (!sourceVersion) return facts;
  return facts.map((fact) =>
    fact.sourceVersion ? fact : { ...fact, sourceVersion },
  );
}

export function mergeRescanFacts(
  previousFacts: Fact[],
  newFacts: Fact[],
  detection: ChangeDetectionResult,
  sourceVersion?: string,
): { facts: Fact[]; staleFactIds: string[] } {
  if (detection.changedFiles.length === 0) {
    const freshByKey = new Map(newFacts.map((fact) => [`${fact.entityId}:${fact.key}`, fact]));
    const merged: Fact[] = [...newFacts];
    const staleFactIds: string[] = [];

    for (const previous of previousFacts) {
      const key = `${previous.entityId}:${previous.key}`;
      if (freshByKey.has(key) || !shouldMarkStale(previous)) continue;
      staleFactIds.push(previous.id);
      merged.push({
        ...previous,
        status: 'stale',
        reviewStatus: 'pending',
        sourceVersion: previous.sourceVersion ?? sourceVersion,
        updatedAt: new Date().toISOString(),
      });
    }

    return { facts: stampFreshFacts(merged, sourceVersion), staleFactIds };
  }

  const freshByKey = new Map(newFacts.map((fact) => [`${fact.entityId}:${fact.key}`, fact]));
  const merged: Fact[] = [];
  const staleFactIds: string[] = [];
  const handledKeys = new Set<string>();

  for (const previous of previousFacts) {
    const key = `${previous.entityId}:${previous.key}`;
    if (!freshByKey.has(key)) {
      if (shouldMarkStale(previous)) {
        staleFactIds.push(previous.id);
        merged.push({
          ...previous,
          status: 'stale',
          reviewStatus: 'pending',
          sourceVersion: previous.sourceVersion ?? sourceVersion,
          updatedAt: new Date().toISOString(),
        });
      }
      continue;
    }

    handledKeys.add(key);
    if (shouldMarkStale(previous) && factIsAffected(previous, detection)) {
      staleFactIds.push(previous.id);
      merged.push({
        ...previous,
        status: 'stale',
        reviewStatus: 'pending',
        sourceVersion: previous.sourceVersion ?? sourceVersion,
        updatedAt: new Date().toISOString(),
      });
      continue;
    }

    if (shouldMarkStale(previous)) {
      merged.push(previous);
      continue;
    }

    merged.push(freshByKey.get(key)!);
  }

  for (const fact of newFacts) {
    const key = `${fact.entityId}:${fact.key}`;
    if (!handledKeys.has(key)) {
      merged.push(stampFreshFacts([fact], sourceVersion)[0]!);
    }
  }

  return { facts: merged, staleFactIds };
}
