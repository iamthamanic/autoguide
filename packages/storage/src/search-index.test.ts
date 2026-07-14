import { mkdtempSync, rmSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { FlowRecord, PageRecord } from '@iamthamanic/autoguide-core';
import { describe, expect, it } from 'vitest';
import {
  SqliteIndex,
  buildSearchFtsRows,
  hasSqliteSearchIndex,
  searchIndexedKnowledge,
  searchWithFallback,
} from './index.js';

const samplePages: PageRecord[] = [
  {
    id: 'page-hr',
    route: '/hr/mitarbeiter',
    title: 'Mitarbeiterübersicht',
    description: 'Liste aller Mitarbeiter im HR-Modul',
    roleIds: ['hr'],
    elementIds: [],
    featureIds: [],
    flowIds: [],
    factIds: [],
    status: 'published',
  },
  {
    id: 'page-admin',
    route: '/admin',
    title: 'Administration',
    description: 'Systemeinstellungen',
    roleIds: ['admin'],
    elementIds: [],
    featureIds: [],
    flowIds: [],
    factIds: [],
    status: 'published',
  },
];

const sampleFlows: FlowRecord[] = [
  {
    id: 'flow-onboard',
    title: 'Mitarbeiter anlegen',
    description: 'Neuen Mitarbeiter im System erfassen',
    steps: [
      { order: 1, title: 'Formular öffnen', factIds: [] },
      { order: 2, title: 'Daten speichern', factIds: [] },
    ],
    roleIds: ['hr'],
    pageIds: ['page-hr'],
    factIds: [],
    status: 'published',
  },
];

describe('sqlite FTS search index', () => {
  it('indexes German umlaut text and ranks title matches', () => {
    const dir = mkdtempSync(join(tmpdir(), 'autoguide-fts-'));
    const index = new SqliteIndex(dir);
    try {
      index.rebuildSearchFts(samplePages, sampleFlows);
      const hits = index.searchFts('Mitarbeiter');
      expect(hits.length).toBeGreaterThan(0);
      expect(hits[0]?.title).toContain('Mitarbeiter');
      expect(hits.some((hit) => hit.kind === 'page' && hit.id === 'page-hr')).toBe(true);
    } finally {
      index.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('filters by role in FTS search', () => {
    const dir = mkdtempSync(join(tmpdir(), 'autoguide-fts-role-'));
    const index = new SqliteIndex(dir);
    try {
      index.rebuildSearchFts(samplePages, sampleFlows);
      const hrHits = index.searchFts('Administration', { userRole: 'hr' });
      expect(hrHits.some((hit) => hit.id === 'page-admin')).toBe(false);
      const adminHits = index.searchFts('Administration', { userRole: 'admin' });
      expect(adminHits.some((hit) => hit.id === 'page-admin')).toBe(true);
    } finally {
      index.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('searchWithFallback uses JSON when sqlite FTS is empty', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'autoguide-search-fallback-'));
    try {
      await writeFile(join(dir, 'pages.json'), JSON.stringify(samplePages));
      await writeFile(join(dir, 'flows.json'), JSON.stringify(sampleFlows));
      expect(hasSqliteSearchIndex(dir)).toBe(false);
      const hits = await searchWithFallback(dir, 'Mitarbeiter');
      expect(hits.some((hit) => hit.id === 'page-hr')).toBe(true);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('searchWithFallback prefers sqlite when FTS is populated', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'autoguide-search-fts-'));
    try {
      await writeFile(join(dir, 'pages.json'), JSON.stringify([]));
      await writeFile(join(dir, 'flows.json'), JSON.stringify([]));
      const index = new SqliteIndex(dir);
      index.rebuildSearchFts(samplePages, sampleFlows);
      index.close();
      expect(hasSqliteSearchIndex(dir)).toBe(true);
      const hits = searchIndexedKnowledge(dir, 'Übersicht');
      expect(hits.some((hit) => hit.id === 'page-hr')).toBe(true);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('buildSearchFtsRows redacts secrets in indexed body', () => {
    const rows = buildSearchFtsRows([], [
      {
        ...sampleFlows[0]!,
        description: 'Kontakt max@example.com',
      },
    ]);
    expect(rows[0]?.body).not.toContain('max@example.com');
    expect(rows[0]?.body).toContain('[REDACTED]');
  });
});
