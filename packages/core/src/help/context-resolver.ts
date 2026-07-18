/**
 * @iamthamanic/autoguide-core — resolve Help Center content for current route and role.
 */

import type { Fact, VisibilityMode } from '../types/fact.js';
import type { FlowRecord, PageRecord } from '../types/records.js';
import { filterFactsForMode } from '../visibility/filter.js';
import { filterByRole, filterFactsByRole, isVisibleForRole } from '../visibility/role-filter.js';
import { filePathMatchesRoute, normalizeRoute } from './route.js';
import { isUserFacingHelpFact } from './useful-fact.js';

export { normalizeRoute } from './route.js';

export interface HelpDraftDigest {
  pendingFactCount: number;
  pageCount: number;
  flowCount: number;
  samples: Fact[];
  /** Pending facts exist but none are user-facing Help content. */
  technicalOnly?: boolean;
}

export interface HelpContext {
  route: string;
  pageTitle?: string;
  actions: Fact[];
  flows: FlowRecord[];
  /** development-only when route-specific help is thin but artifacts exist */
  draftDigest?: HelpDraftDigest;
}

function findPageForRoute(pages: PageRecord[], route: string): PageRecord | undefined {
  const normalized = normalizeRoute(route);
  return pages.find((item) => normalizeRoute(item.route) === normalized);
}

function factTouchesRoute(fact: Fact, route: string, page?: PageRecord): boolean {
  const normalized = normalizeRoute(route);
  if (page && (page.factIds ?? []).includes(fact.id)) return true;
  for (const entry of fact.provenance ?? []) {
    if (entry.route && normalizeRoute(entry.route) === normalized) return true;
    if (entry.filePath && filePathMatchesRoute(entry.filePath, normalized)) return true;
  }
  return false;
}

function helpFactRank(fact: Fact): number {
  if (fact.key === 'label') return 0;
  if (fact.key === 'description') return 1;
  if (fact.key === 'action') return 2;
  return 3;
}

function pickRouteActions(
  roleFacts: Fact[],
  route: string,
  page: PageRecord | undefined,
  pageVisible: boolean,
): Fact[] {
  if (!pageVisible || !page) return [];

  const linked = roleFacts.filter((fact) => {
    if (!isUserFacingHelpFact(fact)) return false;
    return factTouchesRoute(fact, route, page);
  });

  return [...linked].sort((a, b) => helpFactRank(a) - helpFactRank(b)).slice(0, 12);
}

function pickRouteFlows(
  roleFlows: FlowRecord[],
  page: PageRecord | undefined,
  pageVisible: boolean,
  mode: VisibilityMode,
): FlowRecord[] {
  const pageFlows = roleFlows.filter((flow) => {
    const pageIds = flow.pageIds ?? [];
    if (!page || !pageVisible) return pageIds.length === 0;
    return pageIds.includes(page.id) || pageIds.length === 0;
  });

  if (pageFlows.length > 0) return pageFlows.slice(0, 6);

  // development: route empty → still show global/unlinked flows when present
  if (mode === 'development' && roleFlows.length > 0) {
    return roleFlows.slice(0, 6);
  }
  return [];
}

function buildDraftDigest(
  facts: Fact[],
  pages: PageRecord[],
  flows: FlowRecord[],
  route: string,
  page: PageRecord | undefined,
): HelpDraftDigest | undefined {
  if (pages.length === 0 && flows.length === 0 && facts.length === 0) return undefined;

  const pending = facts.filter((fact) => fact.reviewStatus === 'pending');
  const pendingUseful = pending.filter((fact) => isUserFacingHelpFact(fact));
  const samples = pendingUseful
    .filter((fact) => factTouchesRoute(fact, route, page))
    .sort((a, b) => helpFactRank(a) - helpFactRank(b))
    .slice(0, 8);

  // Only signal “technical candidates” when every pending fact is Help noise
  const technicalOnly = pending.length > 0 && pendingUseful.length === 0;

  if (samples.length === 0 && !technicalOnly) return undefined;

  return {
    pendingFactCount: pending.length,
    pageCount: pages.length,
    flowCount: flows.length,
    samples,
    technicalOnly: technicalOnly || undefined,
  };
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

  const page = findPageForRoute(pages, normalized);
  const pageVisible = page ? isVisibleForRole(page.roleIds, userRole) : false;
  const pageTitle = pageVisible ? page?.title : undefined;

  const actions = pickRouteActions(roleFacts, normalized, page, pageVisible);
  const pageFlows = pickRouteFlows(roleFlows, page, pageVisible, mode);

  const draftDigest =
    mode === 'development' && actions.length === 0 && pageFlows.length === 0
      ? buildDraftDigest(facts, pages, flows, normalized, page)
      : undefined;

  return {
    route: normalized,
    pageTitle,
    actions,
    flows: pageFlows,
    draftDigest,
  };
}
