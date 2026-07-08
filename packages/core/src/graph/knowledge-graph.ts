/**
 * @autoguide/core — knowledge graph merge and conflict detection.
 */

import type { Fact } from '../types/fact.js';
import { resolveFactConflict } from '../confidence/conflict.js';
import { scoreFromProvenance } from '../confidence/score.js';

export interface MergeResult {
  facts: Fact[];
  conflicts: Array<{ existingId: string; incomingId: string; key: string; reason: string }>;
}

function factKey(fact: Fact): string {
  return `${fact.entityId}:${fact.key}`;
}

export class KnowledgeGraph {
  private readonly facts = new Map<string, Fact>();

  addFact(fact: Fact): void {
    const existing = this.facts.get(factKey(fact));
    if (!existing) {
      this.facts.set(factKey(fact), fact);
      return;
    }
    const resolution = resolveFactConflict(existing, fact);
    if (resolution.winner === 'incoming') {
      this.facts.set(factKey(fact), fact);
    } else if (resolution.winner === 'conflict') {
      this.facts.set(factKey(fact), { ...fact, status: 'conflict' });
    }
  }

  mergeFacts(incoming: Fact[]): MergeResult {
    const conflicts: MergeResult['conflicts'] = [];

    for (const fact of incoming) {
      const key = factKey(fact);
      const existing = this.facts.get(key);
      if (!existing) {
        this.facts.set(key, fact);
        continue;
      }

      const resolution = resolveFactConflict(existing, fact);
      if (resolution.winner === 'existing' && resolution.reason === 'same_value') {
        const mergedProvenance = [...existing.provenance, ...fact.provenance];
        const confidence = scoreFromProvenance(mergedProvenance);
        this.facts.set(key, {
          ...existing,
          provenance: mergedProvenance,
          confidence,
          updatedAt: new Date().toISOString(),
        });
        continue;
      }

      if (resolution.winner === 'conflict') {
        conflicts.push({
          existingId: existing.id,
          incomingId: fact.id,
          key: fact.key,
          reason: resolution.reason,
        });
        this.facts.set(key, { ...existing, status: 'conflict' });
        continue;
      }

      if (resolution.winner === 'incoming') {
        const mergedProvenance = [...existing.provenance, ...fact.provenance];
        this.facts.set(key, {
          ...fact,
          provenance: mergedProvenance,
          confidence: scoreFromProvenance(mergedProvenance),
          updatedAt: new Date().toISOString(),
        });
        continue;
      }

      conflicts.push({
        existingId: existing.id,
        incomingId: fact.id,
        key: fact.key,
        reason: resolution.reason,
      });
    }

    return { facts: this.listFacts(), conflicts };
  }

  listFacts(): Fact[] {
    return [...this.facts.values()];
  }
}
