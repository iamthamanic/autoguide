/**
 * @iamthamanic/autoguide-cli — mergePreservedFlows unit tests.
 */

import { describe, expect, it } from 'vitest';
import type { FlowRecord } from '@iamthamanic/autoguide-core';
import { mergePreservedFlows } from './merge-preserved-flows.js';

function flow(id: string, title: string, steps: number): FlowRecord {
  return {
    id,
    title,
    steps: Array.from({ length: steps }, (_, i) => ({
      order: i + 1,
      title: `step ${i + 1}`,
      factIds: [],
    })),
    roleIds: [],
    pageIds: [],
    factIds: [],
    status: 'draft',
  };
}

describe('mergePreservedFlows', () => {
  it('keeps previous ordered flows when incoming is empty', () => {
    const previous = [flow('flow-1', 'Crawl /login', 2), flow('flow-2', 'Crawl /about', 1)];
    expect(mergePreservedFlows([], previous)).toEqual([
      flow('flow-2', 'Crawl /about', 1),
      flow('flow-1', 'Crawl /login', 2),
    ]);
  });

  it('lets incoming win on same title and keeps other previous titles', () => {
    const previous = [flow('flow-1', 'Crawl /login', 1), flow('flow-2', 'Crawl /about', 1)];
    const incoming = [flow('flow-1', 'Crawl /login', 3)];
    const merged = mergePreservedFlows(incoming, previous);
    expect(merged).toHaveLength(2);
    expect(merged.find((f) => f.title === 'Crawl /login')?.steps).toHaveLength(3);
    expect(merged.find((f) => f.title === 'Crawl /about')).toBeDefined();
  });

  it('drops previous flows with zero steps', () => {
    const previous = [flow('empty', 'Empty', 0), flow('ok', 'Crawl /x', 1)];
    expect(mergePreservedFlows([], previous)).toEqual([flow('ok', 'Crawl /x', 1)]);
  });
});
