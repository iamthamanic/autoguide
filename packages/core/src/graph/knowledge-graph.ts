/**
 * @autoguide/core — knowledge graph merge and conflict detection.
 */

import type { Fact } from '../types/fact.js';
import { factPrecedence } from '../validators/fact.js';
import { scoreFromProvenance } from '../confidence/score.js';

export interface MergeResult {
  facts: Fact[];
  conflicts: Array<{ existingId: string; incomingId: string; key: string }>;
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
    if (factPrecedence(fact.status) > factPrecedence(existing.status)) {
      this.facts.set(factKey(fact), fact);
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
      if (existing.value !== fact.value) {
        conflicts.push({ existingId: existing.id, incomingId: fact.id, key: fact.key });
        if (factPrecedence(fact.status) >= factPrecedence(existing.status)) {
          this.facts.set(key, { ...fact, status: 'conflict' });
        }
        continue;
      }
      const mergedProvenance = [...existing.provenance, ...fact.provenance];
      const confidence = scoreFromProvenance(mergedProvenance);
      this.facts.set(key, {
        ...existing,
        provenance: mergedProvenance,
        confidence,
        updatedAt: new Date().toISOString(),
      });
    }

    return { facts: this.listFacts(), conflicts };
  }

  listFacts(): Fact[] {
    return [...this.facts.values()];
  }
}
