/**
 * @autoguide/client — loadArtifactBundle tests.
 */

import { describe, expect, it, vi } from 'vitest';
import { loadArtifactBundle } from './load.js';

const sampleFacts = [{ id: 'f1', key: 'action.save', confidence: 0.9 }];
const samplePages = [{ id: 'p1', route: '/home', title: 'Start' }];
const sampleFlows = [{ id: 'fl1', title: 'Speichern', steps: [], pageIds: ['p1'] }];
const sampleTours = [{ id: 't1', title: 'Tour', steps: [], status: 'published' as const }];

function mockFetch(files: Record<string, unknown>) {
  return vi.fn(async (url: string | URL) => {
    const path = String(url).split('/').pop() ?? '';
    const body = files[path];
    if (body === undefined) {
      return new Response(null, { status: 404 });
    }
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as typeof fetch;
}

describe('loadArtifactBundle', () => {
  it('loads required and optional artifacts from baseUrl', async () => {
    const fetchImpl = mockFetch({
      'doc-bundle.json': {
        version: '0.1.0',
        artifacts: ['tours.json', 'recommendations.json'],
      },
      'facts.json': sampleFacts,
      'pages.json': samplePages,
      'flows.json': sampleFlows,
      'tours.json': sampleTours,
      'recommendations.json': [],
      'reviews.json': [],
      'review-history.json': [],
    });

    const bundle = await loadArtifactBundle({
      baseUrl: '/autoguide',
      fetchImpl,
    });

    expect(bundle.baseUrl).toBe('/autoguide');
    expect(bundle.facts).toEqual(sampleFacts);
    expect(bundle.pages).toEqual(samplePages);
    expect(bundle.flows).toEqual(sampleFlows);
    expect(bundle.tours).toEqual(sampleTours);
  });

  it('returns empty arrays for missing optional files', async () => {
    const fetchImpl = mockFetch({
      'facts.json': sampleFacts,
      'pages.json': samplePages,
      'flows.json': sampleFlows,
    });

    const bundle = await loadArtifactBundle({
      baseUrl: 'https://example.com/autoguide/',
      fetchImpl,
    });

    expect(bundle.tours).toEqual([]);
    expect(bundle.recommendations).toEqual([]);
  });

  it('throws German error when required artifact is missing', async () => {
    const fetchImpl = mockFetch({
      'facts.json': sampleFacts,
      'pages.json': samplePages,
    });

    await expect(
      loadArtifactBundle({ baseUrl: '/autoguide', fetchImpl }),
    ).rejects.toThrow(/Artefakt nicht geladen/);
  });
});
