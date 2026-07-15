/**
 * @iamthamanic/autoguide-core — review queue and manual override handling.
 */

import type { Fact, ReviewStatus } from '../types/fact.js';
import { needsReview, minimumConfidenceForKey } from '../confidence/score.js';
import { factPrecedence } from '../validators/fact.js';
import type { Recommendation } from '../recommendations/types.js';
import type { ReviewAction, ReviewActionRecord } from './types.js';
import { recommendationForUnsupportedEdit, verifyEditedFact } from './verify-fact.js';

export interface ReviewItem {
  factId: string;
  entityId: string;
  key: string;
  value: unknown;
  confidence: number;
  reason: string;
}

export interface ReviewDecisionResult {
  fact: Fact;
  record: ReviewActionRecord;
  recommendation?: Recommendation;
}

export class ReviewQueue {
  private readonly items = new Map<string, ReviewItem>();
  private readonly overrides = new Map<string, Fact>();
  private readonly history: ReviewActionRecord[] = [];

  seedFromFacts(facts: Fact[]): ReviewItem[] {
    for (const fact of facts) {
      const threshold = minimumConfidenceForKey(fact.key);
      if (fact.status === 'stale') {
        const item: ReviewItem = {
          factId: fact.id,
          entityId: fact.entityId,
          key: fact.key,
          value: fact.value,
          confidence: fact.confidence,
          reason: 'Dokumentation veraltet — Quellcode geändert',
        };
        this.items.set(fact.id, item);
        continue;
      }
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

  seedOverridesFromFacts(facts: Fact[]): void {
    for (const fact of facts) {
      if (fact.status === 'manual_override' || fact.reviewStatus === 'approved') {
        this.overrides.set(fact.id, fact);
      }
    }
  }

  loadHistory(records: ReviewActionRecord[]): void {
    this.history.splice(0, this.history.length, ...records);
  }

  getHistory(): ReviewActionRecord[] {
    return [...this.history];
  }

  list(): ReviewItem[] {
    return [...this.items.values()];
  }

  loadFromItems(items: ReviewItem[]): void {
    for (const item of items) {
      this.items.set(item.factId, item);
    }
  }

  applyDecision(fact: Fact, status: ReviewStatus, editedValue?: unknown): Fact {
    return this.applyReviewWithVerification(fact, status, editedValue, [fact]).fact;
  }

  applyReviewWithVerification(
    fact: Fact,
    status: ReviewStatus,
    editedValue?: unknown,
    scannedFacts: Fact[] = [],
  ): ReviewDecisionResult {
    const now = new Date().toISOString();
    const nextValue = editedValue ?? fact.value;
    const wasEdited =
      status === 'approved' && String(nextValue ?? '') !== String(fact.value ?? '');

    let action: ReviewAction = status === 'rejected' ? 'rejected' : 'accepted';
    let recommendation: Recommendation | undefined;
    let confidence = fact.confidence;
    let nextStatus = fact.status;

    if (status === 'approved') {
      if (wasEdited) {
        const verification = verifyEditedFact(fact, nextValue, scannedFacts);
        action = verification.action === 'accepted' ? 'edited' : verification.action;
        if (!verification.supported) {
          recommendation = recommendationForUnsupportedEdit(fact, nextValue);
          confidence = Math.min(confidence, 0.7);
          nextStatus = 'needs_review';
        } else {
          confidence = Math.max(confidence, 0.95);
          nextStatus = 'manual_override';
        }
      } else {
        nextStatus = 'manual_override';
        confidence = Math.max(confidence, 0.95);
      }
    }

    const provenance = status === 'approved'
      ? [
          ...fact.provenance,
          {
            source: 'developer_review' as const,
            confidence: confidence,
            observedAt: now,
          },
        ]
      : fact.provenance;

    const updated: Fact = {
      ...fact,
      value: nextValue,
      reviewStatus: status,
      status: status === 'approved' ? nextStatus : fact.status,
      confidence,
      provenance,
      updatedAt: now,
    };

    const record: ReviewActionRecord = {
      factId: fact.id,
      entityId: fact.entityId,
      key: fact.key,
      action,
      previousValue: fact.value,
      newValue: status === 'approved' ? nextValue : undefined,
      at: now,
      note: recommendation?.message,
    };
    this.history.push(record);

    if (status === 'approved') {
      this.overrides.set(fact.id, updated);
      this.items.delete(fact.id);
    }
    if (status === 'rejected') {
      this.items.delete(fact.id);
    }

    return { fact: updated, record, recommendation };
  }

  getOverride(factId: string): Fact | undefined {
    return this.overrides.get(factId);
  }

  /** Manual overrides cannot be replaced by lower-precedence facts. */
  canReplace(existing: Fact, incoming: Fact): boolean {
    if (this.overrides.has(existing.id)) return false;
    if (existing.status === 'manual_override' || existing.reviewStatus === 'approved') {
      return false;
    }
    return factPrecedence(incoming.status) > factPrecedence(existing.status);
  }
}
