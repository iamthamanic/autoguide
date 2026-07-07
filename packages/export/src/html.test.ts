import { describe, expect, it } from 'vitest';
import type { Fact, FlowRecord, PageRecord } from '@autoguide/core';
import { exportKnowledgeHtml } from './html.js';
import { exportKnowledgeMarkdown } from './markdown.js';

const pages: PageRecord[] = [
  {
    id: 'p1',
    route: '/home',
    title: 'Startseite',
    roleIds: [],
    elementIds: [],
    featureIds: [],
    flowIds: [],
    factIds: ['f1', 'f2'],
    status: 'published',
  },
];

const flows: FlowRecord[] = [
  {
    id: 'fl1',
    title: 'Onboarding',
    steps: [{ order: 1, title: 'Login', factIds: [] }],
    roleIds: [],
    pageIds: [],
    factIds: [],
    status: 'published',
  },
];

const facts: Fact[] = [
  {
    id: 'f1',
    entityId: 'btn',
    key: 'action',
    value: 'Speichern',
    status: 'needs_review',
    reviewStatus: 'pending',
    confidence: 0.6,
    provenance: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'f2',
    entityId: 'btn2',
    key: 'action',
    value: 'Exportieren',
    status: 'verified',
    reviewStatus: 'approved',
    confidence: 0.95,
    provenance: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

describe('exportKnowledgeHtml', () => {
  it('matches markdown headings and german umlauts', () => {
    const md = exportKnowledgeMarkdown(pages, flows, facts, { mode: 'published' });
    const html = exportKnowledgeHtml(pages, flows, facts, { mode: 'published' });
    expect(html).toContain('<html lang="de">');
    expect(html).toContain('charset="utf-8"');
    expect(html).toContain('Startseite');
    expect(html).toContain('Ablauf: Onboarding');
    expect(html).toContain('Schritte');
    expect(md).toContain('# Startseite');
    expect(html).toContain('Exportieren');
    expect(html).not.toContain('Speichern');
  });
});
