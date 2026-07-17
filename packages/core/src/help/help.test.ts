import { describe, expect, it } from 'vitest';
import { resolveHelpContext, normalizeRoute } from './context-resolver.js';
import { explainHelpGap } from './empty-state.js';
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
    expect(normalizeRoute('vacation')).toBe('/vacation');
  });

  it('resolves page context for route', () => {
    const ctx = resolveHelpContext('/vacation', pages, flows, facts, 'published');
    expect(ctx.pageTitle).toBe('Urlaub');
    expect(ctx.flows[0]?.title).toBe('Urlaub beantragen');
  });

  it('matches pages without leading slash', () => {
    const slashless: PageRecord[] = [{ ...pages[0]!, route: 'vacation' }];
    const ctx = resolveHelpContext('/vacation', slashless, flows, facts, 'development');
    expect(ctx.pageTitle).toBe('Urlaub');
    expect(ctx.actions.map((a) => a.id)).toContain('f1');
  });

  it('does not dump unrelated global labels onto another route', () => {
    const loginLabel: Fact = {
      ...facts[0]!,
      id: 'login-label',
      key: 'label',
      value: 'E-Mail',
      reviewStatus: 'pending',
    };
    const ctx = resolveHelpContext('/dashboard', pages, [], [loginLabel], 'development');
    expect(ctx.actions).toHaveLength(0);
    expect(ctx.draftDigest?.pendingFactCount).toBe(1);
    expect(ctx.draftDigest?.samples).toHaveLength(0);
  });

  it('shows global flows in development when route has none', () => {
    const ctx = resolveHelpContext('/other', pages, flows, facts, 'development');
    expect(ctx.flows.map((f) => f.title)).toContain('Urlaub beantragen');
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

describe('explainHelpGap', () => {
  it('returns empty when help already has content', () => {
    expect(
      explainHelpGap({
        mode: 'published',
        route: '/vacation',
        pages,
        flows,
        facts,
      }),
    ).toEqual([]);
  });

  it('lists scan/sync/bundle reasons when artifacts are empty', () => {
    const reasons = explainHelpGap({
      mode: 'development',
      route: '/',
      pages: [],
      flows: [],
      facts: [],
    });
    const ids = reasons.map((r) => r.id);
    expect(ids).toContain('bundle');
    expect(ids).toContain('scan_flows');
    expect(ids).toContain('sync');
    expect(reasons.every((r) => r.message.length > 10)).toBe(true);
    expect(reasons.some((r) => /playwright-import/i.test(r.message))).toBe(false);
  });

  it('recommends scan --auto as primary path when flows are missing', () => {
    const reasons = explainHelpGap({
      mode: 'published',
      route: '/other',
      pages: [],
      flows: [],
      facts: [
        {
          ...facts[0]!,
          id: 'orphan',
          reviewStatus: 'approved',
          confidence: 0.95,
        },
      ],
    });
    const scan = reasons.find((r) => r.id === 'scan_flows');
    expect(scan?.message).toContain('autoguide scan --auto');
  });

  it('does not claim reviews blank help in development when drafts exist', () => {
    const pending: Fact[] = [
      {
        ...facts[0]!,
        id: 'f-pending',
        reviewStatus: 'pending',
        confidence: 0.5,
        status: 'needs_review',
      },
    ];
    const reasons = explainHelpGap({
      mode: 'development',
      route: '/dashboard',
      pages: [{ ...pages[0]!, id: 'p-dash', route: '/dashboard', factIds: [] }],
      flows: [],
      facts: pending,
      reviews: [
        {
          factId: 'f-pending',
          entityId: 'x',
          key: 'action',
          value: 'x',
          confidence: 0.5,
          reason: 'low',
          priority: 0,
        },
      ],
    });
    expect(reasons).toEqual([]);
  });

  it('explains published gate when facts exist but none are approved', () => {
    const pending: Fact[] = [
      {
        ...facts[0]!,
        id: 'f-pending',
        reviewStatus: 'pending',
        confidence: 0.5,
        status: 'needs_review',
      },
    ];
    const reasons = explainHelpGap({
      mode: 'published',
      route: '/other',
      pages: [],
      flows: [],
      facts: pending,
    });
    expect(reasons.map((r) => r.id)).toEqual(
      expect.arrayContaining(['publish', 'review', 'published_gate']),
    );
  });

  it('mentions scan when flows are missing in published empty route', () => {
    const reasons = explainHelpGap({
      mode: 'published',
      route: '/other',
      pages: [],
      flows: [],
      facts: [{ ...facts[0]!, id: 'ok', reviewStatus: 'approved', confidence: 0.95 }],
    });
    expect(reasons.some((r) => r.id === 'scan_flows')).toBe(true);
  });
});
