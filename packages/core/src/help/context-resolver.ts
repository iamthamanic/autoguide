/**
 * @autoguide/core — resolve Help Center content for current route and role.
 */

import type { Fact, VisibilityMode } from '../types/fact.js';
import type { FlowRecord, PageRecord } from '../types/records.js';
import { filterFactsForMode } from '../visibility/filter.js';

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

  const page = pages.find((item) => normalizeRoute(item.route) === normalized);
  const pageTitle = page?.title;

  const roleOk = (roleIds: string[]) =>
    roleIds.length === 0 || (userRole ? roleIds.includes(userRole) : true);

  const pageFlows = flows.filter(
    (flow) => roleOk(flow.roleIds) && (page ? flow.pageIds.includes(page.id) || flow.pageIds.length === 0 : true),
  );

  const actions = visibleFacts.filter((fact) => {
    if (page && page.factIds.includes(fact.id)) return true;
    return fact.key === 'action' || fact.key === 'description';
  });

  return {
    route: normalized,
    pageTitle,
    actions: actions.slice(0, 12),
    flows: pageFlows.slice(0, 6),
  };
}
