/**
 * @autoguide/client — types for browser artifact loading.
 */

import type {
  Fact,
  FlowRecord,
  PageRecord,
  Recommendation,
  ReviewActionRecord,
  ReviewItem,
  Tour,
} from '@autoguide/core';

export interface DocBundleManifest {
  version?: string;
  generatedAt?: string;
  artifacts?: string[];
}

export interface ClientArtifactBundle {
  baseUrl: string;
  facts: Fact[];
  pages: PageRecord[];
  flows: FlowRecord[];
  tours: Tour[];
  reviews: ReviewItem[];
  reviewHistory: ReviewActionRecord[];
  recommendations: Recommendation[];
}

export interface LoadArtifactBundleOptions {
  baseUrl: string;
  manifest?: DocBundleManifest;
  fetchImpl?: typeof fetch;
}
