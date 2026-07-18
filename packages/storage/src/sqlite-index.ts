/**
 * @iamthamanic/autoguide-storage — SQLite index with FTS5 search for pages and flows.
 */

import type { SearchHit } from '@iamthamanic/autoguide-core';
import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { redactString } from '@iamthamanic/autoguide-core';
import {
  buildSearchFtsRows,
  matchesRoleFilter,
  toFtsMatchQuery,
  type SearchFtsRow,
} from './search-fts.js';
import type { FlowRecord, PageRecord } from '@iamthamanic/autoguide-core';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS facts_index (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL,
  fact_key TEXT NOT NULL,
  confidence REAL NOT NULL,
  review_status TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pages_index (
  id TEXT PRIMARY KEY,
  route TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS flows_index (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_facts_entity ON facts_index(entity_id);
CREATE INDEX IF NOT EXISTS idx_pages_route ON pages_index(route);
CREATE INDEX IF NOT EXISTS idx_flows_title ON flows_index(title);
`;

const FTS_SCHEMA_SQL = `
CREATE VIRTUAL TABLE IF NOT EXISTS search_fts USING fts5(
  doc_id UNINDEXED,
  kind UNINDEXED,
  title,
  body,
  role_filter UNINDEXED,
  status UNINDEXED,
  tokenize = 'unicode61'
);
`;

export interface SqliteSearchOptions {
  userRole?: string;
  limit?: number;
  publishedOnly?: boolean;
}

export class SqliteIndex {
  readonly db: Database.Database;

  constructor(outputDir: string) {
    const dbPath = join(outputDir, 'index.sqlite');
    mkdirSync(outputDir, { recursive: true });
    this.db = new Database(dbPath);
    this.db.exec(SCHEMA_SQL);
    this.db.exec(FTS_SCHEMA_SQL);
  }

  upsertFactIndex(row: {
    id: string;
    entityId: string;
    key: string;
    confidence: number;
    reviewStatus: string;
    updatedAt: string;
  }): void {
    this.db
      .prepare(
        `INSERT INTO facts_index (id, entity_id, fact_key, confidence, review_status, updated_at)
         VALUES (@id, @entityId, @key, @confidence, @reviewStatus, @updatedAt)
         ON CONFLICT(id) DO UPDATE SET
           entity_id = excluded.entity_id,
           fact_key = excluded.fact_key,
           confidence = excluded.confidence,
           review_status = excluded.review_status,
           updated_at = excluded.updated_at`,
      )
      .run({
        ...row,
        entityId: redactString(row.entityId),
        key: redactString(row.key),
      });
  }

  upsertPageIndex(row: {
    id: string;
    route: string;
    title: string;
    status: string;
    updatedAt: string;
  }): void {
    this.db
      .prepare(
        `INSERT INTO pages_index (id, route, title, status, updated_at)
         VALUES (@id, @route, @title, @status, @updatedAt)
         ON CONFLICT(id) DO UPDATE SET
           route = excluded.route,
           title = excluded.title,
           status = excluded.status,
           updated_at = excluded.updated_at`,
      )
      .run({
        ...row,
        route: redactString(row.route),
        title: redactString(row.title),
      });
  }

  upsertFlowIndex(row: {
    id: string;
    title: string;
    body: string;
    status: string;
    updatedAt: string;
  }): void {
    this.db
      .prepare(
        `INSERT INTO flows_index (id, title, body, status, updated_at)
         VALUES (@id, @title, @body, @status, @updatedAt)
         ON CONFLICT(id) DO UPDATE SET
           title = excluded.title,
           body = excluded.body,
           status = excluded.status,
           updated_at = excluded.updated_at`,
      )
      .run({
        ...row,
        title: redactString(row.title),
        body: redactString(row.body),
      });
  }

  rebuildSearchFts(pages: PageRecord[], flows: FlowRecord[]): void {
    const rows = buildSearchFtsRows(pages, flows);
    const rebuild = this.db.transaction((entries: SearchFtsRow[]) => {
      this.db.exec(`DELETE FROM search_fts`);
      const insert = this.db.prepare(
        `INSERT INTO search_fts (doc_id, kind, title, body, role_filter, status)
         VALUES (@docId, @kind, @title, @body, @roleFilter, @status)`,
      );
      for (const row of entries) {
        insert.run(row);
      }
    });
    rebuild(rows);
  }

  hasSearchFtsData(): boolean {
    const row = this.db.prepare(`SELECT COUNT(*) AS count FROM search_fts`).get() as {
      count: number;
    };
    return row.count > 0;
  }

  searchFts(query: string, options: SqliteSearchOptions = {}): SearchHit[] {
    const limit = options.limit ?? 20;
    const trimmed = query.trim();
    if (!trimmed) {
      return this.listTocHits(limit, options);
    }

    const matchQuery = toFtsMatchQuery(trimmed);
    if (!matchQuery) return [];

    const rows = this.db
      .prepare(
        `SELECT
           doc_id AS docId,
           kind,
           title,
           body,
           role_filter AS roleFilter,
           status,
           bm25(search_fts) AS rank
         FROM search_fts
         WHERE search_fts MATCH @matchQuery
         ORDER BY rank
         LIMIT @limit`,
      )
      .all({ matchQuery, limit: limit * 3 }) as Array<{
      docId: string;
      kind: string;
      title: string;
      body: string;
      roleFilter: string;
      status: string;
      rank: number;
    }>;

    const ftsHits = rows
      .filter((row) => {
        if (options.publishedOnly && row.status !== 'published') return false;
        return matchesRoleFilter(row.roleFilter, options.userRole);
      })
      .map((row) => ({
        id: row.docId,
        kind: row.kind as 'page' | 'flow',
        title: row.title,
        snippet: row.body.slice(0, 80) || row.title,
        score: Math.max(1, Math.round(100 + row.rank * -10)),
        kindLabel: row.kind === 'flow' ? 'Ablauf' : 'Seite',
      }))
      .slice(0, limit);

    if (ftsHits.length > 0) return ftsHits;
    return this.searchLike(trimmed, options, limit);
  }

  private searchLike(query: string, options: SqliteSearchOptions, limit: number): SearchHit[] {
    const q = query.toLowerCase();
    const rows = this.db
      .prepare(
        `SELECT doc_id AS docId, kind, title, body, role_filter AS roleFilter, status
         FROM search_fts`,
      )
      .all() as Array<{
      docId: string;
      kind: string;
      title: string;
      body: string;
      roleFilter: string;
      status: string;
    }>;

    return rows
      .filter((row) => {
        if (options.publishedOnly && row.status !== 'published') return false;
        if (!matchesRoleFilter(row.roleFilter, options.userRole)) return false;
        const haystack = `${row.title} ${row.body}`.toLowerCase();
        return haystack.includes(q);
      })
      .map((row, index) => ({
        id: row.docId,
        kind: row.kind as 'page' | 'flow',
        title: row.title,
        snippet: row.body.slice(0, 80) || row.title,
        score: Math.max(1, 50 - index),
        kindLabel: row.kind === 'flow' ? 'Ablauf' : 'Seite',
      }))
      .slice(0, limit);
  }

  private listTocHits(limit: number, options: SqliteSearchOptions): SearchHit[] {
    const pageLimit = Math.min(5, limit);
    const flowLimit = Math.min(5, Math.max(0, limit - pageLimit));
    const pages = this.db
      .prepare(
        `SELECT doc_id AS docId, title, body, role_filter AS roleFilter, status
         FROM search_fts
         WHERE kind = 'page'
         ORDER BY title
         LIMIT @limit`,
      )
      .all({ limit: pageLimit * 3 }) as Array<{
      docId: string;
      title: string;
      body: string;
      roleFilter: string;
      status: string;
    }>;
    const flows = this.db
      .prepare(
        `SELECT doc_id AS docId, title, body, role_filter AS roleFilter, status
         FROM search_fts
         WHERE kind = 'flow'
         ORDER BY title
         LIMIT @limit`,
      )
      .all({ limit: flowLimit * 3 }) as Array<{
      docId: string;
      title: string;
      body: string;
      roleFilter: string;
      status: string;
    }>;

    const pageHits = pages
      .filter((row) => {
        if (options.publishedOnly && row.status !== 'published') return false;
        return matchesRoleFilter(row.roleFilter, options.userRole);
      })
      .slice(0, pageLimit)
      .map((row) => ({
        id: row.docId,
        kind: 'page' as const,
        title: row.title,
        snippet: row.body.split(' ')[0] ?? row.title,
        score: 10,
        kindLabel: 'Seite',
      }));

    const flowHits = flows
      .filter((row) => {
        if (options.publishedOnly && row.status !== 'published') return false;
        return matchesRoleFilter(row.roleFilter, options.userRole);
      })
      .slice(0, flowLimit)
      .map((row) => ({
        id: row.docId,
        kind: 'flow' as const,
        title: row.title,
        snippet: row.body.slice(0, 80),
        score: 5,
        kindLabel: 'Ablauf',
      }));

    return [...pageHits, ...flowHits];
  }

  /** @deprecated Use searchFts — kept for backward compatibility in tests. */
  search(query: string, limit = 20): Array<{ id: string; kind: string; title: string; snippet: string }> {
    return this.searchFts(query, { limit }).map(({ score: _score, ...hit }) => hit);
  }

  close(): void {
    this.db.close();
  }
}
