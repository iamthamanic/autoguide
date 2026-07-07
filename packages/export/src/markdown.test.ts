import { describe, expect, it } from 'vitest';
import { exportKnowledgeMarkdown } from './markdown.js';
import type { PageRecord, FlowRecord } from '@autoguide/core';

describe('@autoguide/export', () => {
  it('exports german markdown for pages and flows', () => {
    const pages: PageRecord[] = [
      {
        id: 'p1',
        route: '/home',
        title: 'Startseite',
        roleIds: [],
        elementIds: [],
        featureIds: [],
        flowIds: [],
        factIds: [],
        status: 'published',
      },
    ];
    const flows: FlowRecord[] = [
      {
        id: 'f1',
        title: 'Onboarding',
        steps: [{ order: 1, title: 'Login', factIds: [] }],
        roleIds: [],
        pageIds: [],
        factIds: [],
        status: 'published',
      },
    ];
    const md = exportKnowledgeMarkdown(pages, flows, [], { mode: 'published' });
    expect(md).toContain('# Startseite');
    expect(md).toContain('# Ablauf: Onboarding');
  });
});
