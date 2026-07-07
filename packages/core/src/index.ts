/**
 * @autoguide/core — public package exports.
 * Framework-agnostic types and validators for AutoGuide.
 */

export * from './types/fact.js';
export * from './types/records.js';
export type {
  KnowledgeEntityType,
  KnowledgeEntity,
  KnowledgeRelationship,
  KnowledgeGraph as KnowledgeGraphData,
} from './types/graph.js';
export * from './validators/fact.js';
export * from './schemas/artifacts.js';
export * from './schemas/validate-artifacts.js';
export * from './confidence/score.js';
export * from './graph/knowledge-graph.js';
export * from './review/review-queue.js';
export * from './visibility/filter.js';
export * from './plugins/registry.js';
export * from './help/context-resolver.js';
export * from './help/search.js';
