/**
 * @iamthamanic/autoguide-core — German Help empty-state reasons (actionable gaps).
 */

import type { Fact, VisibilityMode } from '../types/fact.js';
import type { FlowRecord, PageRecord } from '../types/records.js';
import type { ReviewItem } from '../review/review-queue.js';
import { filterFactsForMode } from '../visibility/filter.js';
import { resolveHelpContext } from './context-resolver.js';
import { normalizeRoute } from './route.js';

export type HelpGapReasonId =
  | 'bundle'
  | 'scan_flows'
  | 'review'
  | 'publish'
  | 'sync'
  | 'route'
  | 'published_gate'
  | 'drafts'
  | 'technical_drafts';

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
    'Doc-Bundle fehlt — `autoguide sync --target public/autoguide` und Dev-Server neu starten.',
};

const REASON_SCAN: HelpGapReason = {
  id: 'scan_flows',
  message: 'Keine Abläufe — `autoguide scan --auto` ausführen.',
};

const REASON_SCAN_DEV: HelpGapReason = {
  id: 'scan_flows',
  message: 'Noch keine Abläufe für diese Seite — `autoguide scan --auto` ausführen.',
};

const REASON_REVIEW_PUBLISHED: HelpGapReason = {
  id: 'review',
  message:
    'Offene Reviews blockieren freigegebene Hilfe — `autoguide review` oder Review-Panel nutzen.',
};

const REASON_DRAFTS: HelpGapReason = {
  id: 'drafts',
  message:
    'Dokumentation liegt als Entwurf vor — im Review-Panel prüfen; Help zeigt Entwürfe im development-Modus.',
};

const REASON_TECHNICAL_DRAFTS: HelpGapReason = {
  id: 'technical_drafts',
  message:
    'Noch keine verständliche Hilfe — Scan liefert technische Kandidaten. Bitte Review oder `scan --auto` für Flows.',
};

const REASON_PUBLISH: HelpGapReason = {
  id: 'publish',
  message:
    'Keine freigegebenen Facts — Inhalte prüfen, freigeben und `autoguide publish` ausführen.',
};

const REASON_SYNC: HelpGapReason = {
  id: 'sync',
  message: 'Nach Scan Artefakte aktualisieren — `autoguide sync` oder Dev-Scan erneut.',
};

const REASON_ROUTE: HelpGapReason = {
  id: 'route',
  message: 'Für diese Route fehlen verknüpfte Inhalte — Scan und Seiten-Zuordnung prüfen.',
};

const REASON_PUBLISHED_GATE: HelpGapReason = {
  id: 'published_gate',
  message:
    'Im published-Modus erscheinen nur freigegebene Inhalte (confidence ≥ 0,85). Für Entwürfe development-Modus nutzen.',
};

function hasHelpContent(input: ExplainHelpGapInput): boolean {
  const ctx = resolveHelpContext(
    input.route,
    input.pages,
    input.flows,
    input.facts,
    input.mode,
    input.userRole,
  );
  if (ctx.actions.length > 0 || ctx.flows.length > 0) return true;
  // User-facing draft samples only — technical-only digests are a gap, not content
  if (input.mode === 'development' && ctx.draftDigest && ctx.draftDigest.samples.length > 0) {
    return true;
  }
  return false;
}

/**
 * Build actionable German reasons when Help has no content for the current route.
 * Returns [] when help context already has actions, flows, or a development draft digest.
 */
export function explainHelpGap(input: ExplainHelpGapInput): HelpGapReason[] {
  const { mode, route, pages, flows, facts, reviews = [] } = input;
  if (hasHelpContent(input)) return [];

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
    push(mode === 'development' ? REASON_SCAN_DEV : REASON_SCAN);
    push(REASON_SYNC);
    if (mode === 'published') push(REASON_PUBLISHED_GATE);
    return reasons;
  }

  if (flows.length === 0) {
    push(mode === 'development' ? REASON_SCAN_DEV : REASON_SCAN);
  }

  const visibleFacts = filterFactsForMode(facts, mode);
  const pendingReviews = reviews.length;
  const hasUnapproved =
    facts.some((f) => f.reviewStatus === 'pending') || pendingReviews > 0;

  const ctx = resolveHelpContext(route, pages, flows, facts, mode, input.userRole);
  const technicalOnly =
    mode === 'development' &&
    ctx.draftDigest?.technicalOnly === true &&
    ctx.actions.length === 0 &&
    ctx.flows.length === 0;

  if (mode === 'published') {
    if (facts.length > 0 && visibleFacts.length === 0) {
      push(REASON_PUBLISH);
      push(REASON_REVIEW_PUBLISHED);
    }
    push(REASON_PUBLISHED_GATE);
  } else if (technicalOnly) {
    push(REASON_TECHNICAL_DRAFTS);
  } else if (hasUnapproved) {
    // Soft tip — never claim reviews blank Help in development
    push(REASON_DRAFTS);
  }

  const normalized = normalizeRoute(route);
  const page = pages.find((item) => normalizeRoute(item.route) === normalized);
  if (!page) {
    push(REASON_ROUTE);
  }

  if (reasons.length === 0) {
    push(REASON_SYNC);
  }

  return reasons;
}
