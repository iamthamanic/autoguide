/**
 * @iamthamanic/autoguide-core — deterministic recommendation rules from scan artifacts.
 * Location: packages/core/src/recommendations/engine.ts
 */

import { needsReview } from '../confidence/score.js';
import type { Fact } from '../types/fact.js';
import type {
  Recommendation,
  RecommendationCategory,
  RecommendationScanHint,
  RecommendationSeverity,
} from './types.js';

const GENERIC_HANDLERS = new Set([
  'handleclick',
  'handlechange',
  'handlesubmit',
  'onclick',
  'onsubmit',
  'onchange',
]);

let counter = 0;

function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
}

function targetPath(hint: RecommendationScanHint): string {
  const location = hint.line ? `${hint.filePath}:${hint.line}` : hint.filePath;
  return hint.componentName ? `${hint.componentName} (${location})` : location;
}

function push(
  list: Recommendation[],
  input: Omit<Recommendation, 'id'> & { idPrefix: string },
): void {
  const { idPrefix, ...rest } = input;
  list.push({ id: nextId(idPrefix), ...rest });
}

function isGenericHandler(name: string): boolean {
  const lower = name.toLowerCase();
  return GENERIC_HANDLERS.has(lower) || /^handle(click|submit|change)$/i.test(name);
}

function suggestHandlerName(handler: string): string {
  if (handler.toLowerCase() === 'handleclick') return 'approveVacationRequest';
  if (handler.toLowerCase() === 'handlesubmit') return 'submitVacationRequest';
  return handler.replace(/^handle/i, '').replace(/^[a-z]/, (c) => c.toUpperCase());
}

export function generateRecommendations(
  facts: Fact[],
  hints: RecommendationScanHint[] = [],
): Recommendation[] {
  counter = 0;
  const recommendations: Recommendation[] = [];
  const seen = new Set<string>();

  const remember = (key: string, rec: Omit<Recommendation, 'id'> & { idPrefix: string }): void => {
    if (seen.has(key)) return;
    seen.add(key);
    push(recommendations, rec);
  };

  for (const hint of hints) {
    const target = targetPath(hint);

    if (hint.missingAriaLabel) {
      remember(`aria:${hint.filePath}:${hint.line ?? 0}`, {
        idPrefix: 'rec-aria',
        target,
        category: 'accessibility',
        severity: 'warning',
        message: 'Interaktives Element ohne aria-label',
        rationale:
          'Icon-only Buttons sind für AutoGuide und Screenreader schwer zu verstehen.',
        filePath: hint.filePath,
        line: hint.line,
        suggestedPatch: '<button aria-label="Beschreibung der Aktion">…</button>',
      });
    }

    if (hint.handlerName && isGenericHandler(hint.handlerName)) {
      const suggested = suggestHandlerName(hint.handlerName);
      remember(`name:${hint.filePath}:${hint.handlerName}:${hint.line ?? 0}`, {
        idPrefix: 'rec-name',
        target,
        category: 'naming',
        severity: 'info',
        message: `Generischer Handler „${hint.handlerName}"`,
        rationale: 'Aussagekräftige Funktionsnamen verbessern Flow-Erkennung und Dokumentation.',
        filePath: hint.filePath,
        line: hint.line,
        suggestedPatch: `function ${suggested}() { … }`,
      });
    }

    if (hint.handlerName && !hint.hasDataDoc) {
      remember(`meta:${hint.filePath}:${hint.handlerName}:${hint.line ?? 0}`, {
        idPrefix: 'rec-meta',
        target,
        category: 'metadata',
        severity: 'info',
        message: 'Fehlende data-doc Metadaten am interaktiven Element',
        rationale: 'data-doc-* Attribute erhöhen die Dokumentations-Confidence deutlich.',
        filePath: hint.filePath,
        line: hint.line,
        suggestedPatch:
          'data-doc-id="feature.action" data-doc-title="Titel" data-doc-description="Kurzbeschreibung"',
      });
    }
  }

  for (const fact of facts) {
    if (!needsReview(fact.confidence)) continue;
    const filePath = fact.provenance.find((p) => p.filePath)?.filePath;
    const key = `fact:${fact.id}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const category: RecommendationCategory =
      fact.key === 'label' ? 'accessibility' : 'documentation';
    const severity: RecommendationSeverity = fact.confidence < 0.5 ? 'warning' : 'info';

    push(recommendations, {
      idPrefix: 'rec-fact',
      target: `${fact.entityId} · ${fact.key}`,
      category,
      severity,
      message: `Niedrige Confidence (${fact.confidence}) für Fakt „${fact.key}"`,
      rationale: 'Ergänze Metadaten, Labels oder manuelle Review-Freigabe.',
      filePath,
      factId: fact.id,
    });
  }

  const clusters = new Map<string, Fact[]>();
  for (const fact of facts) {
    if (!needsReview(fact.confidence)) continue;
    const group = clusters.get(fact.entityId) ?? [];
    group.push(fact);
    clusters.set(fact.entityId, group);
  }
  for (const [entityId, group] of clusters) {
    if (group.length < 2) continue;
    remember(`cluster:${entityId}`, {
      idPrefix: 'rec-cluster',
      target: entityId,
      category: 'documentation',
      severity: 'warning',
      message: `${group.length} Facts mit niedriger Confidence auf „${entityId}"`,
      rationale:
        'Mehrere unsichere Facts auf derselben Entität — Metadaten oder Review bündeln.',
      relatedFactIds: group.map((fact) => fact.id),
    });
  }

  return recommendations;
}
