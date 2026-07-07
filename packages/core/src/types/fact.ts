/**
 * @autoguide/core — provenance and fact status types.
 * Location: packages/core/src/types/fact.ts
 */

export type ProvenanceSource =
  | 'source_code'
  | 'runtime_dom'
  | 'accessibility_tree'
  | 'playwright_trace'
  | 'ai_enrichment'
  | 'developer_review'
  | 'config'
  | 'plugin';

export type FactStatus =
  | 'verified'
  | 'ai_proposal'
  | 'needs_review'
  | 'conflict'
  | 'manual_override'
  | 'stale';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export type VisibilityMode = 'development' | 'published';

export interface Provenance {
  source: ProvenanceSource;
  sourceId?: string;
  filePath?: string;
  selector?: string;
  route?: string;
  confidence: number;
  observedAt: string;
}

export interface Fact {
  id: string;
  entityId: string;
  key: string;
  value: unknown;
  status: FactStatus;
  reviewStatus: ReviewStatus;
  confidence: number;
  provenance: Provenance[];
  createdAt: string;
  updatedAt: string;
}

export const FACT_STATUSES: readonly FactStatus[] = [
  'verified',
  'ai_proposal',
  'needs_review',
  'conflict',
  'manual_override',
  'stale',
] as const;

export const PROVENANCE_SOURCES: readonly ProvenanceSource[] = [
  'source_code',
  'runtime_dom',
  'accessibility_tree',
  'playwright_trace',
  'ai_enrichment',
  'developer_review',
  'config',
  'plugin',
] as const;
