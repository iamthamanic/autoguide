/**
 * @iamthamanic/autoguide-core — attach fact ids to pages by route / file heuristics.
 */

import type { Fact } from '../types/fact.js';
import type { PageRecord } from '../types/records.js';
import { filePathMatchesRoute, normalizeRoute } from './route.js';

function factMatchesPage(fact: Fact, page: PageRecord): boolean {
  const pageRoute = normalizeRoute(page.route);
  if ((page.factIds ?? []).includes(fact.id)) return true;

  for (const entry of fact.provenance ?? []) {
    if (entry.route && normalizeRoute(entry.route) === pageRoute) return true;
    if (entry.filePath && filePathMatchesRoute(entry.filePath, pageRoute)) return true;
  }
  return false;
}

/**
 * Enrich pages with factIds discovered via provenance.route or file↔route heuristics.
 * Existing factIds are preserved and merged.
 */
export function linkFactsToPages(pages: PageRecord[], facts: Fact[]): PageRecord[] {
  return pages.map((page) => {
    const linked = facts.filter((fact) => factMatchesPage(fact, page)).map((fact) => fact.id);
    if (linked.length === 0) return page;
    return {
      ...page,
      factIds: [...new Set([...(page.factIds ?? []), ...linked])],
    };
  });
}

export { filePathMatchesRoute, routeSlug } from './route.js';
