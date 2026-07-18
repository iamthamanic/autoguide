/**
 * @iamthamanic/autoguide-core — deterministic in-memory search over pages and flows.
 */

import type { FlowRecord, PageRecord } from '../types/records.js';
import { filterByRole } from '../visibility/role-filter.js';
import { isFriendlyHelpPageTitle } from './useful-fact.js';

export interface SearchHit {
  id: string;
  kind: 'page' | 'flow';
  title: string;
  snippet: string;
  score: number;
  /** German kind label for Help UI */
  kindLabel: string;
}

function scoreMatch(query: string, text: string): number {
  const q = query.toLowerCase().trim();
  const t = text.toLowerCase();
  if (!q) return 0;
  if (t === q) return 100;
  if (t.startsWith(q)) return 80;
  if (t.includes(q)) return 50;
  return 0;
}

function pageHit(page: PageRecord, score: number): SearchHit {
  return {
    id: page.id,
    kind: 'page',
    title: page.title,
    snippet: page.route,
    score,
    kindLabel: 'Seite',
  };
}

function flowHit(flow: FlowRecord, score: number, snippet: string): SearchHit {
  return {
    id: flow.id,
    kind: 'flow',
    title: flow.title,
    snippet,
    score,
    kindLabel: 'Ablauf',
  };
}

export function searchKnowledge(
  query: string,
  pages: PageRecord[],
  flows: FlowRecord[],
  userRole?: string,
): SearchHit[] {
  const visiblePages = filterByRole(pages, userRole);
  const visibleFlows = filterByRole(flows, userRole);
  const friendlyPages = visiblePages.filter((page) =>
    isFriendlyHelpPageTitle(page.title, page.route),
  );

  const q = query.trim();
  if (!q) {
    return [
      ...friendlyPages.slice(0, 5).map((page) => pageHit(page, 10)),
      ...visibleFlows.slice(0, 5).map((flow) => flowHit(flow, 5, flow.description ?? '')),
    ];
  }

  const hits: SearchHit[] = [];
  for (const page of friendlyPages) {
    const score = Math.max(
      scoreMatch(q, page.title),
      scoreMatch(q, page.description ?? ''),
    );
    if (score > 0) {
      hits.push(pageHit(page, score));
    }
  }
  for (const flow of visibleFlows) {
    const stepText = flow.steps.map((step) => step.title).join(' ');
    const score = Math.max(
      scoreMatch(q, flow.title),
      scoreMatch(q, flow.description ?? ''),
      scoreMatch(q, stepText),
    );
    if (score > 0) {
      hits.push(flowHit(flow, score, flow.steps[0]?.title ?? ''));
    }
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, 20);
}
