/**
 * @iamthamanic/autoguide-core — resolve Help Center content for current route and role.
 */

import type { Fact, VisibilityMode } from '../types/fact.js';
import type { FlowRecord, PageRecord } from '../types/records.js';
import { isGenericHandlerNoiseFact } from '../naming/generic-handlers.js';
import { filterFactsForMode } from '../visibility/filter.js';
import { filterByRole, filterFactsByRole, isVisibleForRole } from '../visibility/role-filter.js';

export interface HelpContext {
  route: string;
  pageTitle?: string;
  actions: Fact[];
  flows: FlowRecord[];
}

export function normalizeRoute(route: string): string {
  const path = route.split('?')[0]?.split('#')[0] ?? '/';
  if (path === '') return '/';
  return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
}

export function resolveHelpContext(
  route: string,
  pages: PageRecord[],
  flows: FlowRecord[],
  facts: Fact[],
  mode: VisibilityMode,
  userRole?: string,
): HelpContext {
  const normalized = normalizeRoute(route);
  const visibleFacts = filterFactsForMode(facts, mode);
  const roleFacts = filterFactsByRole(visibleFacts, userRole);
  const roleFlows = filterByRole(flows, userRole);

  const page = pages.find((item) => normalizeRoute(item.route) === normalized);
  const pageVisible = page ? isVisibleForRole(page.roleIds, userRole) : false;
  const pageTitle = pageVisible ? page?.title : undefined;

  const pageFlows = roleFlows.filter((flow) => {
    const pageIds = flow.pageIds ?? [];
    if (!page || !pageVisible) return pageIds.length === 0;
    return pageIds.includes(page.id) || pageIds.length === 0;
  });

  const actions = roleFacts
    .filter((fact) => !isGenericHandlerNoiseFact(fact))
    .filter((fact) => {
      if (pageVisible && page && (page.factIds ?? []).includes(fact.id)) return true;
      return fact.key === 'action' || fact.key === 'description' || fact.key === 'label';
    })
    .sort((a, b) => helpFactRank(a) - helpFactRank(b));

  return {
    route: normalized,
    pageTitle,
    actions: actions.slice(0, 12),
    flows: pageFlows.slice(0, 6),
  };
}

/** Prefer human labels over raw action/handler keys in Help. */
function helpFactRank(fact: Fact): number {
  if (fact.key === 'label') return 0;
  if (fact.key === 'description') return 1;
  if (fact.key === 'action') return 2;
  return 3;
}
