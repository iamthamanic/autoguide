/**
 * @autoguide/storage — SQLite index skeleton for search and queries.
 */

import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

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

export class SqliteIndex {
  readonly db: Database.Database;

  constructor(outputDir: string) {
    const dbPath = join(outputDir, 'index.sqlite');
    mkdirSync(outputDir, { recursive: true });
    this.db = new Database(dbPath);
    this.db.exec(SCHEMA_SQL);
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
      .run(row);
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
      .run(row);
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
      .run(row);
  }

  search(query: string, limit = 20): Array<{ id: string; kind: string; title: string; snippet: string }> {
    const q = `%${query.trim()}%`;
    const pages = this.db
      .prepare(
        `SELECT id, title, route FROM pages_index
         WHERE title LIKE @q OR route LIKE @q
         LIMIT @limit`,
      )
      .all({ q, limit }) as Array<{ id: string; title: string; route: string }>;

    const flows = this.db
      .prepare(
        `SELECT id, title, body FROM flows_index
         WHERE title LIKE @q OR body LIKE @q
         LIMIT @limit`,
      )
      .all({ q, limit }) as Array<{ id: string; title: string; body: string }>;

    return [
      ...pages.map((page) => ({
        id: page.id,
        kind: 'page',
        title: page.title,
        snippet: page.route,
      })),
      ...flows.map((flow) => ({
        id: flow.id,
        kind: 'flow',
        title: flow.title,
        snippet: flow.body.slice(0, 80),
      })),
    ].slice(0, limit);
  }

  close(): void {
    this.db.close();
  }
}
