/**
 * @iamthamanic/autoguide-core — deterministic in-memory search over pages and flows.
 */

import type { FlowRecord, PageRecord } from '../types/records.js';
import { filterByRole } from '../visibility/role-filter.js';

export interface SearchHit {
  id: string;
  kind: 'page' | 'flow';
  title: string;
  snippet: string;
  score: number;
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

export function searchKnowledge(
  query: string,
  pages: PageRecord[],
  flows: FlowRecord[],
  userRole?: string,
): SearchHit[] {
  const visiblePages = filterByRole(pages, userRole);
  const visibleFlows = filterByRole(flows, userRole);

  const q = query.trim();
  if (!q) {
    return [
      ...visiblePages.slice(0, 5).map((page) => ({
        id: page.id,
        kind: 'page' as const,
        title: page.title,
        snippet: page.route,
        score: 10,
      })),
      ...visibleFlows.slice(0, 5).map((flow) => ({
        id: flow.id,
        kind: 'flow' as const,
        title: flow.title,
        snippet: flow.description ?? '',
        score: 5,
      })),
    ];
  }

  const hits: SearchHit[] = [];
  for (const page of visiblePages) {
    const score = Math.max(
      scoreMatch(q, page.title),
      scoreMatch(q, page.route),
      scoreMatch(q, page.description ?? ''),
    );
    if (score > 0) {
      hits.push({ id: page.id, kind: 'page', title: page.title, snippet: page.route, score });
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
      hits.push({
        id: flow.id,
        kind: 'flow',
        title: flow.title,
        snippet: flow.steps[0]?.title ?? '',
        score,
      });
    }
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, 20);
}
