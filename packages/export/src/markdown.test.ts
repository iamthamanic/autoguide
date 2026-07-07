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

  it('filters export by userRole', () => {
    const flows: FlowRecord[] = [
      {
        id: 'f1',
        title: 'Admin Flow',
        steps: [{ order: 1, title: 'Admin', factIds: [] }],
        roleIds: ['HR-Admin'],
        pageIds: [],
        factIds: [],
        status: 'published',
      },
      {
        id: 'f2',
        title: 'User Flow',
        steps: [{ order: 1, title: 'User', factIds: [] }],
        roleIds: ['Mitarbeiter'],
        pageIds: [],
        factIds: [],
        status: 'published',
      },
    ];
    const md = exportKnowledgeMarkdown([], flows, [], {
      mode: 'published',
      userRole: 'Mitarbeiter',
    });
    expect(md).toContain('User Flow');
    expect(md).not.toContain('Admin Flow');
    expect(md).toContain('(Mitarbeiter)');
  });
});
