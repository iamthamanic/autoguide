/**
 * @iamthamanic/autoguide-client — runtime artifact file names (mirrors @iamthamanic/autoguide-storage paths).
 */

export const RUNTIME_ARTIFACT_FILES = {
  facts: 'facts.json',
  pages: 'pages.json',
  flows: 'flows.json',
  tours: 'tours.json',
  recommendations: 'recommendations.json',
  reviews: 'reviews.json',
  reviewHistory: 'review-history.json',
  docBundle: 'doc-bundle.json',
} as const;

export const REQUIRED_RUNTIME_FILES = [
  RUNTIME_ARTIFACT_FILES.facts,
  RUNTIME_ARTIFACT_FILES.pages,
  RUNTIME_ARTIFACT_FILES.flows,
] as const;

export const OPTIONAL_RUNTIME_FILES = [
  RUNTIME_ARTIFACT_FILES.tours,
  RUNTIME_ARTIFACT_FILES.recommendations,
  RUNTIME_ARTIFACT_FILES.reviews,
  RUNTIME_ARTIFACT_FILES.reviewHistory,
] as const;
