/**
 * @autoguide/scanner — convert source scan results to core facts.
 */

import type { Fact } from '@autoguide/core';
import { scoreFromProvenance } from '@autoguide/core';
import type { SourceElementFact, SourceScanResult } from './types.js';
import type { RuntimeSnapshot } from '@autoguide/runtime';

function now(): string {
  return new Date().toISOString();
}

export function sourceElementsToFacts(elements: SourceElementFact[]): Fact[] {
  return elements.map((element, index) => {
    const provenance = [
      {
        source: 'source_code' as const,
        filePath: element.filePath,
        confidence: element.dataDocKey ? 0.96 : 0.82,
        observedAt: now(),
      },
    ];
    return {
      id: `source-fact-${index + 1}`,
      entityId: element.componentName ?? element.filePath,
      key: element.dataDocKey ?? element.handlerName ?? 'element',
      value: element.dataDocValue ?? element.handlerName ?? element.componentName,
      status: 'needs_review' as const,
      reviewStatus: 'pending' as const,
      confidence: scoreFromProvenance(provenance),
      provenance,
      createdAt: now(),
      updatedAt: now(),
    };
  });
}

export function runtimeSnapshotToFacts(snapshot: RuntimeSnapshot): Fact[] {
  return snapshot.elements.map((element) => {
    const provenance = [
      {
        source: 'runtime_dom' as const,
        selector: element.selector,
        route: element.route,
        confidence: 0.85,
        observedAt: snapshot.capturedAt,
      },
    ];
    return {
      id: element.id,
      entityId: element.id,
      key: 'label',
      value: element.label ?? element.selector,
      status: 'needs_review' as const,
      reviewStatus: 'pending' as const,
      confidence: scoreFromProvenance(provenance),
      provenance,
      createdAt: snapshot.capturedAt,
      updatedAt: snapshot.capturedAt,
    };
  });
}

export function mergeScanResults(
  source: SourceScanResult,
  runtime?: RuntimeSnapshot,
): { pages: Array<{ id: string; route: string; title: string }>; facts: Fact[] } {
  const pages = source.routes.map((route, index) => ({
    id: `page-${index + 1}`,
    route: route.route,
    title: route.route,
  }));
  const facts = [
    ...sourceElementsToFacts(source.elements),
    ...(runtime ? runtimeSnapshotToFacts(runtime) : []),
  ];
  return { pages, facts };
}
