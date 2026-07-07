import { describe, expect, it } from 'vitest';
import { resolveHelpContext, normalizeRoute } from './context-resolver.js';
import { searchKnowledge } from './search.js';
import type { Fact } from '../types/fact.js';
import type { FlowRecord, PageRecord } from '../types/records.js';

const pages: PageRecord[] = [
  {
    id: 'p1',
    route: '/vacation',
    title: 'Urlaub',
    roleIds: [],
    elementIds: [],
    featureIds: [],
    flowIds: [],
    factIds: ['f1'],
    status: 'draft',
  },
];

const flows: FlowRecord[] = [
  {
    id: 'fl1',
    title: 'Urlaub beantragen',
    steps: [{ order: 1, title: 'Antrag öffnen', factIds: [] }],
    roleIds: [],
    pageIds: ['p1'],
    factIds: [],
    status: 'draft',
  },
];

const facts: Fact[] = [
  {
    id: 'f1',
    entityId: 'btn-apply',
    key: 'action',
    value: 'Antrag stellen',
    status: 'verified',
    reviewStatus: 'approved',
    confidence: 0.95,
    provenance: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

describe('help context', () => {
  it('normalizes routes', () => {
    expect(normalizeRoute('/vacation/')).toBe('/vacation');
  });

  it('resolves page context for route', () => {
    const ctx = resolveHelpContext('/vacation', pages, flows, facts, 'published');
    expect(ctx.pageTitle).toBe('Urlaub');
    expect(ctx.flows[0]?.title).toBe('Urlaub beantragen');
  });

  it('searches pages and flows deterministically', () => {
    const hits = searchKnowledge('Urlaub', pages, flows);
    expect(hits.some((hit) => hit.kind === 'page')).toBe(true);
    expect(hits.some((hit) => hit.kind === 'flow')).toBe(true);
  });
});
