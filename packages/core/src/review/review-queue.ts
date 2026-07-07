/**
 * @autoguide/core — review queue and manual override handling.
 */

import type { Fact, ReviewStatus } from '../types/fact.js';
import { needsReview, minimumConfidenceForKey } from '../confidence/score.js';
import { factPrecedence } from '../validators/fact.js';

export interface ReviewItem {
  factId: string;
  entityId: string;
  key: string;
  value: unknown;
  confidence: number;
  reason: string;
}

export class ReviewQueue {
  private readonly items = new Map<string, ReviewItem>();
  private readonly overrides = new Map<string, Fact>();

  seedFromFacts(facts: Fact[]): ReviewItem[] {
    for (const fact of facts) {
      const threshold = minimumConfidenceForKey(fact.key);
      if (fact.confidence < threshold || needsReview(fact.confidence)) {
        const item: ReviewItem = {
          factId: fact.id,
          entityId: fact.entityId,
          key: fact.key,
          value: fact.value,
          confidence: fact.confidence,
          reason: `Confidence ${fact.confidence} unter Schwellwert ${threshold}`,
        };
        this.items.set(fact.id, item);
      }
    }
    return this.list();
  }

  list(): ReviewItem[] {
    return [...this.items.values()];
  }

  applyDecision(fact: Fact, status: ReviewStatus, editedValue?: unknown): Fact {
    const updated: Fact = {
      ...fact,
      value: editedValue ?? fact.value,
      reviewStatus: status,
      status: status === 'approved' ? 'manual_override' : fact.status,
      confidence: status === 'approved' ? Math.max(fact.confidence, 0.95) : fact.confidence,
      updatedAt: new Date().toISOString(),
    };

    if (status === 'approved') {
      this.overrides.set(fact.id, updated);
      this.items.delete(fact.id);
    }
    if (status === 'rejected') {
      this.items.delete(fact.id);
    }
    return updated;
  }

  getOverride(factId: string): Fact | undefined {
    return this.overrides.get(factId);
  }

  /** Manual overrides cannot be replaced by lower-precedence facts. */
  canReplace(existing: Fact, incoming: Fact): boolean {
    const override = this.overrides.get(existing.id);
    if (override) return false;
    return factPrecedence(incoming.status) > factPrecedence(existing.status);
  }
}
