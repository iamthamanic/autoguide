/**
 * @autoguide/core — JSON schema version and artifact file names.
 */

export const SCHEMA_VERSION = '0.1.0';

export const ARTIFACT_FILES = [
  'app.json',
  'pages.json',
  'features.json',
  'flows.json',
  'facts.json',
  'confidence.json',
  'reviews.json',
  'review-history.json',
  'recommendations.json',
  'history.json',
  'scan-snapshot.json',
  'graph.json',
  'tours.json',
  'doc-bundle.json',
] as const;

export type ArtifactFile = (typeof ARTIFACT_FILES)[number];
