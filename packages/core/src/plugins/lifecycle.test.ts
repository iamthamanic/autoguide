import { describe, expect, it } from 'vitest';
import { KnowledgeGraph, type Fact } from '../index.js';
import { createPluginRegistry, type AutoGuidePlugin } from './registry.js';
import { runPluginScans, runPluginTransforms } from './lifecycle.js';

const now = '2026-07-08T00:00:00.000Z';

function makeFact(partial: Partial<Fact> & Pick<Fact, 'id' | 'key' | 'value'>): Fact {
  return {
    entityId: 'entity-1',
    status: 'verified',
    reviewStatus: 'pending',
    confidence: 0.8,
    provenance: [{ source: 'plugin', sourceId: 'test', confidence: 0.8, observedAt: now }],
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

const goodPlugin: AutoGuidePlugin = {
  descriptor: {
    id: 'good-plugin',
    version: '0.1.0',
    kind: 'scanner',
    autoguideVersion: '^0.1.0',
    capabilities: ['scan'],
  },
  scan() {
    return { facts: [makeFact({ id: 'f-good', key: 'plugin.ok', value: true })] };
  },
};

const badPlugin: AutoGuidePlugin = {
  descriptor: {
    id: 'bad-plugin',
    version: '0.1.0',
    kind: 'scanner',
    autoguideVersion: '^0.1.0',
    capabilities: ['scan'],
  },
  scan() {
    throw new Error('boom');
  },
};

const invalidFactPlugin: AutoGuidePlugin = {
  descriptor: {
    id: 'invalid-fact-plugin',
    version: '0.1.0',
    kind: 'scanner',
    autoguideVersion: '^0.1.0',
    capabilities: ['scan'],
  },
  scan() {
    return { facts: [{ id: 'broken' } as Fact] };
  },
};

const transformPlugin: AutoGuidePlugin = {
  descriptor: {
    id: 'transform-plugin',
    version: '0.1.0',
    kind: 'scanner',
    autoguideVersion: '^0.1.0',
    capabilities: ['transform'],
  },
  transform(graph) {
    const next = new KnowledgeGraph();
    next.mergeFacts([
      ...graph.listFacts(),
      makeFact({ id: 'f-transform', key: 'plugin.transformed', value: true }),
    ]);
    return next;
  },
};

describe('plugin lifecycle', () => {
  it('merges valid scan facts and isolates plugin failures', async () => {
    const registry = createPluginRegistry([goodPlugin, badPlugin, invalidFactPlugin]);
    const result = await runPluginScans(registry, {
      cwd: '/tmp',
      outputDir: '/tmp/.autoguide',
      sourceDir: '/tmp/src',
      config: {},
    });

    expect(result.facts).toHaveLength(1);
    expect(result.facts[0]?.key).toBe('plugin.ok');
    expect(result.warnings.some((item) => item.pluginId === 'bad-plugin')).toBe(true);
    expect(result.warnings.some((item) => item.pluginId === 'invalid-fact-plugin')).toBe(true);
  });

  it('runs transform hooks on the knowledge graph', async () => {
    const registry = createPluginRegistry([transformPlugin]);
    const graph = new KnowledgeGraph();
    graph.mergeFacts([makeFact({ id: 'base', key: 'base', value: 1 })]);

    const result = await runPluginTransforms(registry, graph);
    expect(result.graph.listFacts().some((fact) => fact.key === 'plugin.transformed')).toBe(true);
  });
});
