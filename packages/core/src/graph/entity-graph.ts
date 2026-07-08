/**
 * @autoguide/core — entity graph store with relationship queries.
 */

import type {
  KnowledgeEntity,
  KnowledgeGraph as KnowledgeGraphData,
  KnowledgeRelationship,
  KnowledgeRelationshipType,
} from '../types/graph.js';
import type { Fact, Provenance } from '../types/fact.js';
import type { FeatureRecord, FlowRecord, PageRecord } from '../types/records.js';

export interface SourceElementHint {
  filePath: string;
  componentName?: string;
  handlerName?: string;
  handlerDeclarationLine?: number;
  dataDocKey?: string;
  line?: number;
}

export interface BuildEntityGraphInput {
  pages: PageRecord[];
  features: FeatureRecord[];
  flows: FlowRecord[];
  facts: Fact[];
  sourceElements?: SourceElementHint[];
}

function nowIso(): string {
  return new Date().toISOString();
}

function sourceProvenance(filePath: string, line?: number): Provenance[] {
  return [
    {
      source: 'source_code',
      filePath,
      confidence: 0.9,
      observedAt: nowIso(),
      ...(line !== undefined ? { sourceId: String(line) } : {}),
    },
  ];
}

export class EntityGraph {
  private readonly entities = new Map<string, KnowledgeEntity>();
  private readonly relationships = new Map<string, KnowledgeRelationship>();
  private relCounter = 0;

  upsertEntity(entity: KnowledgeEntity): void {
    this.entities.set(entity.id, entity);
  }

  addRelationship(
    from: string,
    to: string,
    type: KnowledgeRelationshipType,
    confidence = 0.85,
    provenance: Provenance[] = [],
  ): KnowledgeRelationship {
    this.relCounter += 1;
    const relationship: KnowledgeRelationship = {
      id: `rel-${this.relCounter}`,
      from,
      to,
      type,
      confidence,
      provenance,
    };
    this.relationships.set(relationship.id, relationship);
    return relationship;
  }

  getEntity(id: string): KnowledgeEntity | undefined {
    return this.entities.get(id);
  }

  listEntities(): KnowledgeEntity[] {
    return [...this.entities.values()];
  }

  listRelationships(): KnowledgeRelationship[] {
    return [...this.relationships.values()];
  }

  neighbors(fromId: string, type?: KnowledgeRelationshipType): KnowledgeEntity[] {
    const targets = [...this.relationships.values()]
      .filter((rel) => rel.from === fromId && (type === undefined || rel.type === type))
      .map((rel) => this.entities.get(rel.to))
      .filter((entity): entity is KnowledgeEntity => entity !== undefined);
    return targets;
  }

  queryByRoute(route: string): KnowledgeEntity[] {
    const page = [...this.entities.values()].find(
      (entity) => entity.type === 'page' && entity.attributes.route === route,
    );
    if (!page) return [];
    const direct = this.neighbors(page.id);
    const nested = direct.flatMap((entity) => this.neighbors(entity.id, 'contains'));
    return [page, ...direct, ...nested];
  }

  queryByRole(roleId: string): KnowledgeEntity[] {
    const relatedIds = new Set(
      [...this.relationships.values()]
        .filter((rel) => rel.type === 'belongsToRole' && rel.to === roleId)
        .map((rel) => rel.from),
    );
    return [...relatedIds]
      .map((id) => this.entities.get(id))
      .filter((entity): entity is KnowledgeEntity => entity !== undefined);
  }

  queryByFeatureId(featureId: string): KnowledgeEntity[] {
    const feature = this.entities.get(featureId);
    if (!feature) return [];
    return [feature, ...this.neighbors(feature.id, 'uses'), ...this.neighbors(feature.id, 'contains')];
  }

  toData(): KnowledgeGraphData {
    return {
      entities: this.listEntities(),
      relationships: this.listRelationships(),
    };
  }
}

export function buildEntityGraph(input: BuildEntityGraphInput): EntityGraph {
  const graph = new EntityGraph();
  const timestamp = nowIso();

  for (const page of input.pages) {
    graph.upsertEntity({
      id: page.id,
      type: 'page',
      name: page.title,
      attributes: { route: page.route, status: page.status },
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  for (const feature of input.features) {
    graph.upsertEntity({
      id: feature.id,
      type: 'feature',
      name: feature.title,
      attributes: {
        description: feature.description,
        factIds: feature.factIds,
        status: feature.status,
      },
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    for (const pageId of feature.pageIds) {
      graph.addRelationship(pageId, feature.id, 'contains');
    }
    for (const page of input.pages) {
      if (feature.elementIds.some((elementId) => page.elementIds.includes(elementId))) {
        graph.addRelationship(page.id, feature.id, 'contains');
      }
    }
    for (const elementId of feature.elementIds) {
      if (graph.getEntity(elementId)) {
        graph.addRelationship(feature.id, elementId, 'uses');
      }
    }
    for (const roleId of feature.roleIds) {
      graph.upsertEntity({
        id: roleId,
        type: 'role',
        name: roleId,
        attributes: {},
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      graph.addRelationship(feature.id, roleId, 'belongsToRole');
    }
  }

  for (const hint of input.sourceElements ?? []) {
    const elementId = `element:${hint.filePath}:${hint.line ?? 0}`;
    graph.upsertEntity({
      id: elementId,
      type: 'element',
      name: hint.dataDocKey ?? hint.componentName ?? hint.handlerName,
      attributes: {
        filePath: hint.filePath,
        line: hint.line,
        dataDocKey: hint.dataDocKey,
        componentName: hint.componentName,
      },
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    const page = input.pages.find((item) => hint.filePath.includes(item.route.replace(/^\//, '')));
    const targetPage = page ?? input.pages[0];
    if (targetPage) {
      graph.addRelationship(
        targetPage.id,
        elementId,
        'contains',
        0.8,
        sourceProvenance(hint.filePath, hint.line),
      );
    }

    if (hint.handlerName) {
      const handlerId = `handler:${hint.handlerName}`;
      const handlerFact = input.facts.find(
        (fact) => fact.value === hint.handlerName || fact.key === hint.handlerName,
      );
      graph.upsertEntity({
        id: handlerId,
        type: 'action',
        name: hint.handlerName,
        attributes: {
          declarationLine: hint.handlerDeclarationLine,
          factIds: handlerFact ? [handlerFact.id] : [],
        },
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      graph.addRelationship(
        elementId,
        handlerId,
        'triggers',
        0.88,
        sourceProvenance(hint.filePath, hint.handlerDeclarationLine ?? hint.line),
      );
    }
  }

  for (const flow of input.flows) {
    graph.upsertEntity({
      id: flow.id,
      type: 'flow',
      name: flow.title,
      attributes: {
        stepCount: flow.steps.length,
        factIds: flow.factIds,
        status: flow.status,
      },
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    for (const pageId of flow.pageIds) {
      if (graph.getEntity(pageId)) {
        graph.addRelationship(pageId, flow.id, 'contains');
      }
    }
    for (const roleId of flow.roleIds) {
      graph.upsertEntity({
        id: roleId,
        type: 'role',
        name: roleId,
        attributes: {},
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      graph.addRelationship(flow.id, roleId, 'belongsToRole');
    }
  }

  return graph;
}

/**
 * Enrich page/feature records with ids discovered in the entity graph.
 */
export function linkRecordsToGraph(
  pages: PageRecord[],
  features: FeatureRecord[],
  graph: EntityGraph,
): { pages: PageRecord[]; features: FeatureRecord[] } {
  const updatedPages = pages.map((page) => {
    const elementIds = graph
      .neighbors(page.id, 'contains')
      .filter((entity) => entity.type === 'element')
      .map((entity) => entity.id);
    const featureIds = graph
      .neighbors(page.id, 'contains')
      .filter((entity) => entity.type === 'feature')
      .map((entity) => entity.id);
    const flowIds = graph
      .neighbors(page.id, 'contains')
      .filter((entity) => entity.type === 'flow')
      .map((entity) => entity.id);
    return {
      ...page,
      elementIds: [...new Set([...page.elementIds, ...elementIds])],
      featureIds: [...new Set([...page.featureIds, ...featureIds])],
      flowIds: [...new Set([...page.flowIds, ...flowIds])],
    };
  });

  const updatedFeatures = features.map((feature) => {
    const elementIds = graph
      .neighbors(feature.id, 'uses')
      .filter((entity) => entity.type === 'element')
      .map((entity) => entity.id);
    return {
      ...feature,
      elementIds: [...new Set([...feature.elementIds, ...elementIds])],
    };
  });

  return { pages: updatedPages, features: updatedFeatures };
}
