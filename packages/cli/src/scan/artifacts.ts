/**
 * @iamthamanic/autoguide-cli — build validated artifact records for scan output.
 */

import type { Fact, FeatureRecord, FlowRecord, PageRecord } from '@iamthamanic/autoguide-core';

export function toPageRecords(
  pages: Array<{ id: string; route: string; title: string }>,
): PageRecord[] {
  return pages.map((page) => ({
    id: page.id,
    route: page.route,
    title: page.title,
    roleIds: [],
    elementIds: [],
    featureIds: [],
    flowIds: [],
    factIds: [],
    status: 'draft',
  }));
}

export function buildFeatureRecords(facts: Fact[]): FeatureRecord[] {
  const byEntity = new Map<string, Fact[]>();
  for (const fact of facts) {
    const list = byEntity.get(fact.entityId) ?? [];
    list.push(fact);
    byEntity.set(fact.entityId, list);
  }

  return [...byEntity.entries()].map(([entityId, entityFacts], index) => ({
    id: `feature-${index + 1}`,
    title: entityId,
    description: entityFacts.find((fact) => fact.key === 'description')?.value as string | undefined,
    pageIds: [],
    roleIds: [],
    elementIds: [entityId],
    flowIds: [],
    factIds: entityFacts.map((fact) => fact.id),
    status: 'draft' as const,
  }));
}

export function attachFlowDefaults(flows: FlowRecord[]): FlowRecord[] {
  return flows.map((flow) => ({
    ...flow,
    roleIds: flow.roleIds ?? [],
    pageIds: flow.pageIds ?? [],
    factIds: flow.factIds ?? [],
    status: flow.status ?? 'draft',
  }));
}
