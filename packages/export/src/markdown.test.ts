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

  it('redacts secrets from markdown export', () => {
    const pages: PageRecord[] = [
      {
        id: 'p1',
        route: '/home',
        title: 'Startseite',
        roleIds: [],
        elementIds: [],
        featureIds: [],
        flowIds: [],
        factIds: ['f-secret'],
        status: 'published',
      },
    ];
    const md = exportKnowledgeMarkdown(
      pages,
      [],
      [
        {
          id: 'f-secret',
          entityId: 'el-1',
          key: 'note',
          value: 'notify admin@corp.example Bearer abcdefghijklmnop',
          status: 'verified',
          reviewStatus: 'approved',
          confidence: 0.95,
          provenance: [],
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      { mode: 'published' },
    );
    expect(md).not.toContain('admin@corp.example');
    expect(md).not.toContain('Bearer abcdefghijklmnop');
  });
});
