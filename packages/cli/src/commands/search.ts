/**
 * @iamthamanic/autoguide-cli — search knowledge index (SQLite FTS with JSON fallback).
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { searchWithFallback } from '@iamthamanic/autoguide-storage';

export interface SearchCommandOptions {
  role?: string;
  publishedOnly?: boolean;
  json?: boolean;
  limit?: number;
}

export async function runSearch(cwd: string, query: string, options: SearchCommandOptions = {}): Promise<number> {
  const outputDir = join(cwd, '.autoguide');
  if (!existsSync(outputDir)) {
    console.error('.autoguide/ fehlt — führe zuerst `autoguide init` und `autoguide scan` aus.');
    return 1;
  }

  const hits = await searchWithFallback(outputDir, query, {
    userRole: options.role,
    publishedOnly: options.publishedOnly,
    limit: options.limit,
  });

  if (options.json) {
    console.log(JSON.stringify({ query, hits }, null, 2));
    return 0;
  }

  if (hits.length === 0) {
    console.log('Keine Treffer.');
    return 0;
  }

  for (const hit of hits) {
    console.log(`[${hit.kind}] ${hit.title} (${hit.score}) — ${hit.snippet}`);
  }
  return 0;
}
