import { describe, expect, it } from 'vitest';
import { buildEntityGraph, EntityGraph } from './entity-graph.js';
import type { Fact } from '../types/fact.js';

describe('EntityGraph', () => {
  it('builds page contains element and element triggers handler', () => {
    const pages = [
      {
        id: 'page-1',
        route: '/learning',
        title: 'Lernzentrum',
        roleIds: [],
        elementIds: [],
        featureIds: [],
        flowIds: [],
        factIds: [],
        status: 'draft' as const,
      },
    ];
    const facts: Fact[] = [
      {
        id: 'fact-1',
        entityId: 'element:src/App.tsx:10',
        key: 'handler',
        value: 'handleLogin',
        status: 'needs_review',
        reviewStatus: 'pending',
        confidence: 0.8,
        provenance: [],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ];

    const graph = buildEntityGraph({
      pages,
      features: [],
      flows: [],
      facts,
      sourceElements: [
        {
          filePath: 'src/App.tsx',
          handlerName: 'handleLogin',
          handlerDeclarationLine: 4,
          line: 10,
          dataDocKey: 'login.submit',
        },
      ],
    });

    const byRoute = graph.queryByRoute('/learning');
    expect(byRoute.some((entity) => entity.type === 'page')).toBe(true);
    expect(byRoute.some((entity) => entity.type === 'element')).toBe(true);

    const element = graph.listEntities().find((entity) => entity.type === 'element');
    expect(element).toBeDefined();
    const handlers = graph.neighbors(element!.id, 'triggers');
    expect(handlers.some((entity) => entity.type === 'action' && entity.name === 'handleLogin')).toBe(
      true,
    );
    expect(handlers[0]?.attributes.factIds).toContain('fact-1');
  });

  it('queries entities by role via belongsToRole', () => {
    const graph = new EntityGraph();
    const timestamp = '2026-01-01T00:00:00.000Z';
    graph.upsertEntity({
      id: 'flow-1',
      type: 'flow',
      name: 'Wiki',
      attributes: {},
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    graph.upsertEntity({
      id: 'Mitarbeiter',
      type: 'role',
      name: 'Mitarbeiter',
      attributes: {},
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    graph.addRelationship('flow-1', 'Mitarbeiter', 'belongsToRole');

    const roles = graph.queryByRole('Mitarbeiter');
    expect(roles).toHaveLength(1);
    expect(roles[0]?.id).toBe('flow-1');
  });

  it('exports graph data for persistence', () => {
    const graph = buildEntityGraph({
      pages: [
        {
          id: 'page-1',
          route: '/',
          title: 'Home',
          roleIds: [],
          elementIds: [],
          featureIds: [],
          flowIds: [],
          factIds: [],
          status: 'draft',
        },
      ],
      features: [
        {
          id: 'feature-1',
          title: 'Save',
          pageIds: ['page-1'],
          roleIds: [],
          elementIds: [],
          flowIds: [],
          factIds: [],
          status: 'draft',
        },
      ],
      flows: [],
      facts: [],
    });

    const data = graph.toData();
    expect(data.entities.length).toBeGreaterThanOrEqual(2);
    expect(data.relationships.some((rel) => rel.type === 'contains')).toBe(true);
  });
});
