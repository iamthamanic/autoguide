/**
 * @autoguide/core — mark features stale when linked artifacts change.
 */

import type { FeatureRecord, PageRecord } from '../types/records.js';
import type { ChangeDetectionResult } from './types.js';

export function markAffectedFeaturesStale(
  features: FeatureRecord[],
  detection: ChangeDetectionResult,
  pages: PageRecord[],
  staleFactIds: ReadonlySet<string> = new Set(),
): FeatureRecord[] {
  if (detection.changedFiles.length === 0) {
    return features;
  }

  const stalePageIds = new Set(
    pages.filter((page) => detection.changedRoutes.includes(page.route)).map((page) => page.id),
  );

  return features.map((feature) => {
    if (feature.status === 'stale') return feature;

    const pageAffected = feature.pageIds.some((pageId) => stalePageIds.has(pageId));
    const factAffected = feature.factIds.some((factId) => staleFactIds.has(factId));
    const elementAffected = feature.elementIds.some((elementId) =>
      detection.changedComponents.includes(elementId),
    );

    if (pageAffected || factAffected || elementAffected) {
      return { ...feature, status: 'stale' as const };
    }

    return feature;
  });
}
