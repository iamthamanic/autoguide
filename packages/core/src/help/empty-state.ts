/**
 * @iamthamanic/autoguide-core — German Help empty-state reasons (actionable gaps).
 */

import type { Fact, VisibilityMode } from '../types/fact.js';
import type { FlowRecord, PageRecord } from '../types/records.js';
import type { ReviewItem } from '../review/review-queue.js';
import { filterFactsForMode } from '../visibility/filter.js';
import { normalizeRoute, resolveHelpContext } from './context-resolver.js';

export type HelpGapReasonId =
  | 'bundle'
  | 'scan_flows'
  | 'review'
  | 'publish'
  | 'sync'
  | 'route'
  | 'published_gate';

export interface HelpGapReason {
  id: HelpGapReasonId;
  message: string;
}

export interface ExplainHelpGapInput {
  mode: VisibilityMode;
  route: string;
  pages: PageRecord[];
  flows: FlowRecord[];
  facts: Fact[];
  reviews?: ReviewItem[];
  userRole?: string;
}

const REASON_BUNDLE: HelpGapReason = {
  id: 'bundle',
  message:
    'Doc-Bundle fehlt oder ist leer — `autoguide sync --target public/autoguide` ausführen und Dev-Server neu starten.',
};

const REASON_SCAN: HelpGapReason = {
  id: 'scan_flows',
  message:
    'Keine Flows vorhanden — `autoguide scan --auto` ausführen (Autonomy/Crawl). Optional, wenn Playwright-Tests existieren: `autoguide scan --playwright-import <report.json>`.',
};

const REASON_REVIEW: HelpGapReason = {
  id: 'review',
  message:
    'Offene Reviews blockieren freigegebene Hilfe — `autoguide review` oder Review-Panel nutzen.',
};

const REASON_PUBLISH: HelpGapReason = {
  id: 'publish',
  message:
    'Keine freigegebenen Facts — Inhalte prüfen, freigeben und `autoguide publish` ausführen.',
};

const REASON_SYNC: HelpGapReason = {
  id: 'sync',
  message:
    'Runtime-Artefakte fehlen möglicherweise — nach Scan/Review `autoguide sync` ausführen.',
};

const REASON_ROUTE: HelpGapReason = {
  id: 'route',
  message:
    'Für diese Route sind keine verknüpften Flows/Facts hinterlegt — Scan und Seiten-Zuordnung prüfen.',
};

const REASON_PUBLISHED_GATE: HelpGapReason = {
  id: 'published_gate',
  message:
    'Im published-Modus erscheinen nur freigegebene Inhalte (confidence ≥ 0,85). Für mehr Details development-Modus nutzen.',
};

/**
 * Build actionable German reasons when Help has no content for the current route.
 * Returns [] when help context already has actions or flows.
 */
export function explainHelpGap(input: ExplainHelpGapInput): HelpGapReason[] {
  const { mode, route, pages, flows, facts, reviews = [], userRole } = input;
  const ctx = resolveHelpContext(route, pages, flows, facts, mode, userRole);
  if (ctx.actions.length > 0 || ctx.flows.length > 0) return [];

  const reasons: HelpGapReason[] = [];
  const seen = new Set<HelpGapReasonId>();
  const push = (reason: HelpGapReason) => {
    if (seen.has(reason.id)) return;
    seen.add(reason.id);
    reasons.push(reason);
  };

  const bundleEmpty = pages.length === 0 && flows.length === 0 && facts.length === 0;
  if (bundleEmpty) {
    push(REASON_BUNDLE);
    push(REASON_SCAN);
    push(REASON_SYNC);
    if (mode === 'published') push(REASON_PUBLISHED_GATE);
    return reasons;
  }

  if (flows.length === 0) {
    push(REASON_SCAN);
  }

  const visibleFacts = filterFactsForMode(facts, mode);
  const approvedOrVisible = visibleFacts.length;
  const pendingReviews = reviews.length;
  const hasUnapproved =
    facts.some((f) => f.reviewStatus === 'pending') || pendingReviews > 0;

  if (mode === 'published') {
    if (facts.length > 0 && approvedOrVisible === 0) {
      push(REASON_PUBLISH);
      push(REASON_REVIEW);
    }
    push(REASON_PUBLISHED_GATE);
  } else if (hasUnapproved) {
    push(REASON_REVIEW);
  }

  const normalized = normalizeRoute(route);
  const page = pages.find((item) => normalizeRoute(item.route) === normalized);
  if (!page || (flows.length > 0 && ctx.flows.length === 0 && ctx.actions.length === 0)) {
    push(REASON_ROUTE);
  }

  if (reasons.length === 0) {
    push(REASON_SYNC);
  }

  return reasons;
}
