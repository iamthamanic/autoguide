/**
 * @iamthamanic/autoguide-core — public package exports.
 * Framework-agnostic types and validators for AutoGuide.
 */

export * from './types/fact.js';
export * from './types/records.js';
export type {
  KnowledgeEntityType,
  KnowledgeEntity,
  KnowledgeRelationship,
  KnowledgeRelationshipType,
  KnowledgeGraph as KnowledgeGraphData,
} from './types/graph.js';
export * from './validators/fact.js';
export * from './schemas/artifacts.js';
export * from './schemas/validate-artifacts.js';
export * from './confidence/score.js';
export * from './confidence/conflict.js';
export * from './confidence/artifact.js';
export * from './confidence/flow-step.js';
export * from './graph/knowledge-graph.js';
export * from './graph/entity-graph.js';
export * from './review/review-queue.js';
export * from './review/types.js';
export * from './review/verify-fact.js';
export * from './naming/generic-handlers.js';
export * from './visibility/filter.js';
export * from './visibility/role-filter.js';
export * from './plugins/registry.js';
export * from './plugins/version.js';
export * from './plugins/compatibility.js';
export * from './plugins/lifecycle.js';
export * from './help/context-resolver.js';
export * from './help/link-page-facts.js';
export * from './help/search.js';
export * from './help/empty-state.js';
export * from './recommendations/types.js';
export * from './recommendations/engine.js';
export * from './recommendations/link.js';
export * from './tours/types.js';
export * from './tours/generate.js';
export * from './tours/validate.js';
export * from './history/types.js';
export * from './history/snapshot.js';
export * from './history/detect-changes.js';
export * from './history/apply-stale.js';
export * from './history/mark-features-stale.js';
export * from './history/history-log.js';
export * from './redaction/types.js';
export * from './redaction/patterns.js';
export * from './redaction/redact.js';
export * from './sufficiency/types.js';
export * from './sufficiency/evaluate.js';
