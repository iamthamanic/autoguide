/**
 * @autoguide/core — knowledge graph entity and relationship types.
 * Location: packages/core/src/types/graph.ts
 */

import type { Provenance } from './fact.js';

export type KnowledgeEntityType =
  | 'app'
  | 'page'
  | 'feature'
  | 'flow'
  | 'element'
  | 'role'
  | 'action'
  | 'api'
  | 'fact';

export interface KnowledgeEntity {
  id: string;
  type: KnowledgeEntityType;
  name?: string;
  attributes: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeRelationship {
  id: string;
  from: string;
  to: string;
  type: string;
  confidence: number;
  provenance: Provenance[];
}

export interface KnowledgeGraph {
  entities: KnowledgeEntity[];
  relationships: KnowledgeRelationship[];
}
