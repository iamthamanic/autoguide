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

CREATE INDEX IF NOT EXISTS idx_facts_entity ON facts_index(entity_id);
CREATE INDEX IF NOT EXISTS idx_pages_route ON pages_index(route);
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

  close(): void {
    this.db.close();
  }
}
