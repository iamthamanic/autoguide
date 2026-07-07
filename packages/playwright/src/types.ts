/**
 * @autoguide/playwright — types for trace import and crawl.
 */

import type { FlowRecord } from '@autoguide/core';

export interface PlaywrightStepEvidence {
  title: string;
  category?: string;
  error?: string;
}

export interface PlaywrightTestEvidence {
  title: string;
  file?: string;
  steps: PlaywrightStepEvidence[];
}

export interface PlaywrightImportResult {
  tests: PlaywrightTestEvidence[];
  flows: FlowRecord[];
  uncoveredRoutes: string[];
}

export interface CrawlOptions {
  baseUrl: string;
  routes: string[];
  safeMode?: boolean;
  screenshots?: boolean;
}

export interface CrawlResult {
  visitedRoutes: string[];
  skippedRoutes: string[];
  traces: PlaywrightTestEvidence[];
}
