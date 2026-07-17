/**
 * @iamthamanic/autoguide-core — linkFactsToPages + route file heuristics.
 */

import { describe, expect, it } from 'vitest';
import { filePathMatchesRoute, linkFactsToPages, routeSlug } from './link-page-facts.js';
import { normalizeRoute } from './route.js';
import type { Fact } from '../types/fact.js';
import type { PageRecord } from '../types/records.js';

function fact(partial: Partial<Fact> & Pick<Fact, 'id' | 'key' | 'value'>): Fact {
  const now = '2026-07-17T00:00:00.000Z';
  return {
    entityId: 'e1',
    status: 'needs_review',
    reviewStatus: 'pending',
    confidence: 0.7,
    provenance: [],
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

function page(partial: Partial<PageRecord> & Pick<PageRecord, 'id' | 'route'>): PageRecord {
  return {
    title: partial.route,
    roleIds: [],
    elementIds: [],
    featureIds: [],
    flowIds: [],
    factIds: [],
    status: 'draft',
    ...partial,
  };
}

describe('route helpers', () => {
  it('normalizes leading slash', () => {
    expect(normalizeRoute('dashboard')).toBe('/dashboard');
    expect(normalizeRoute('/dashboard/')).toBe('/dashboard');
    expect(normalizeRoute('dashboard')).toBe(normalizeRoute('/dashboard'));
  });

  it('matches DashboardScreen to /dashboard', () => {
    expect(routeSlug('/dashboard')).toBe('dashboard');
    expect(filePathMatchesRoute('src/screens/DashboardScreen.tsx', '/dashboard')).toBe(true);
    expect(filePathMatchesRoute('src/App.tsx', '/dashboard')).toBe(false);
  });
});

describe('linkFactsToPages', () => {
  it('links facts by provenance.route and file name', () => {
    const pages = [page({ id: 'p1', route: 'dashboard' })];
    const facts = [
      fact({
        id: 'f-route',
        key: 'label',
        value: 'Willkommen',
        provenance: [
          {
            source: 'runtime_dom',
            route: '/dashboard',
            confidence: 0.85,
            observedAt: '2026-07-17T00:00:00.000Z',
          },
        ],
      }),
      fact({
        id: 'f-file',
        key: 'label',
        value: 'Organigramm',
        provenance: [
          {
            source: 'source_code',
            filePath: 'src/components/HrKo_DashboardOrganigramCard.tsx',
            confidence: 0.82,
            observedAt: '2026-07-17T00:00:00.000Z',
          },
        ],
      }),
      fact({
        id: 'f-other',
        key: 'label',
        value: 'Login',
        provenance: [
          {
            source: 'source_code',
            filePath: 'src/screens/LoginScreen.tsx',
            confidence: 0.82,
            observedAt: '2026-07-17T00:00:00.000Z',
          },
        ],
      }),
    ];

    const linked = linkFactsToPages(pages, facts);
    expect(linked[0]?.route).toBe('dashboard');
    expect(linked[0]?.factIds).toEqual(expect.arrayContaining(['f-route', 'f-file']));
    expect(linked[0]?.factIds).not.toContain('f-other');
  });
});
