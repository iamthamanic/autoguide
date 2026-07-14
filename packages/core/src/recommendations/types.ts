/**
 * @iamthamanic/autoguide-core — recommendation types for developer guidance.
 * Location: packages/core/src/recommendations/types.ts
 */

export type RecommendationSeverity = 'info' | 'warning' | 'blocking';

export type RecommendationCategory =
  | 'accessibility'
  | 'naming'
  | 'metadata'
  | 'routing'
  | 'workflow'
  | 'testability'
  | 'documentation';

export interface Recommendation {
  id: string;
  target: string;
  category: RecommendationCategory;
  severity: RecommendationSeverity;
  message: string;
  rationale: string;
  filePath?: string;
  line?: number;
  suggestedPatch?: string;
  /** Links to a fact in the review queue (`autoguide review`). */
  factId?: string;
  /** Cluster recommendation: multiple related facts awaiting review. */
  relatedFactIds?: string[];
}

export interface RecommendationScanHint {
  filePath: string;
  line?: number;
  componentName?: string;
  handlerName?: string;
  hasDataDoc?: boolean;
  missingAriaLabel?: boolean;
}
