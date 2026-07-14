/**
 * @iamthamanic/autoguide-storage — search API with SQLite FTS and in-memory fallback.
 */

import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  type FlowRecord,
  type PageRecord,
  type SearchHit,
  searchKnowledge,
} from '@iamthamanic/autoguide-core';
import { SqliteIndex } from './sqlite-index.js';

export interface SearchOptions {
  userRole?: string;
  limit?: number;
  publishedOnly?: boolean;
}

function isPageRecord(value: unknown): value is PageRecord {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return typeof record.id === 'string' && typeof record.route === 'string';
}

function isFlowRecord(value: unknown): value is FlowRecord {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return typeof record.id === 'string' && Array.isArray(record.steps);
}

async function loadKnowledgeJson(outputDir: string): Promise<{ pages: PageRecord[]; flows: FlowRecord[] }> {
  const pagesRaw = await readFile(join(outputDir, 'pages.json'), 'utf8');
  const flowsRaw = await readFile(join(outputDir, 'flows.json'), 'utf8');
  const pagesParsed = JSON.parse(pagesRaw) as unknown;
  const flowsParsed = JSON.parse(flowsRaw) as unknown;
  const pages = Array.isArray(pagesParsed) ? pagesParsed.filter(isPageRecord) : [];
  const flows = Array.isArray(flowsParsed) ? flowsParsed.filter(isFlowRecord) : [];
  return { pages, flows };
}

export function hasSqliteSearchIndex(outputDir: string): boolean {
  const dbPath = join(outputDir, 'index.sqlite');
  if (!existsSync(dbPath)) return false;
  const index = new SqliteIndex(outputDir);
  try {
    return index.hasSearchFtsData();
  } finally {
    index.close();
  }
}

export function searchIndexedKnowledge(
  outputDir: string,
  query: string,
  options: SearchOptions = {},
): SearchHit[] {
  const index = new SqliteIndex(outputDir);
  try {
    return index.searchFts(query, options);
  } finally {
    index.close();
  }
}

export async function searchWithFallback(
  outputDir: string,
  query: string,
  options: SearchOptions = {},
): Promise<SearchHit[]> {
  if (hasSqliteSearchIndex(outputDir)) {
    return searchIndexedKnowledge(outputDir, query, options);
  }

  const { pages, flows } = await loadKnowledgeJson(outputDir);
  const publishedPages = options.publishedOnly
    ? pages.filter((page) => page.status === 'published')
    : pages;
  const publishedFlows = options.publishedOnly
    ? flows.filter((flow) => flow.status === 'published')
    : flows;
  const limit = options.limit ?? 20;
  return searchKnowledge(query, publishedPages, publishedFlows, options.userRole).slice(0, limit);
}
