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

  it('filters flows and facts by userRole', () => {
    const roleFlows: FlowRecord[] = [
      { ...flows[0]!, id: 'fl-admin', title: 'Admin Urlaub', roleIds: ['HR-Admin'] },
      { ...flows[0]!, id: 'fl-user', title: 'Mitarbeiter Urlaub', roleIds: ['Mitarbeiter'] },
    ];
    const roleFacts: Fact[] = [
      { ...facts[0]!, id: 'f-admin', value: 'Admin-Aktion', roleIds: ['HR-Admin'] },
      { ...facts[0]!, id: 'f-user', value: 'Mitarbeiter-Aktion', roleIds: ['Mitarbeiter'] },
    ];
    const adminCtx = resolveHelpContext(
      '/vacation',
      pages,
      roleFlows,
      roleFacts,
      'published',
      'HR-Admin',
    );
    expect(adminCtx.flows.map((flow) => flow.title)).toContain('Admin Urlaub');
    expect(adminCtx.flows.map((flow) => flow.title)).not.toContain('Mitarbeiter Urlaub');

    const hits = searchKnowledge('Urlaub', pages, roleFlows, 'Mitarbeiter');
    expect(hits.some((hit) => hit.title === 'Mitarbeiter Urlaub')).toBe(true);
    expect(hits.some((hit) => hit.title === 'Admin Urlaub')).toBe(false);
  });

  it('searches pages and flows deterministically', () => {
    const hits = searchKnowledge('Urlaub', pages, flows);
    expect(hits.some((hit) => hit.kind === 'page')).toBe(true);
    expect(hits.some((hit) => hit.kind === 'flow')).toBe(true);
  });
});
