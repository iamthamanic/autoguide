/**
 * @iamthamanic/autoguide-cli — merge previous ordered flows into a new scan result.
 * Location: packages/cli/src/lib/merge-preserved-flows.ts
 *
 * Crawl/playwright flow IDs are index-based (`flow-1`, …) and unstable across
 * runs, so title is the primary merge key. Incoming wins on title conflict.
 */

import type { FlowRecord } from '@iamthamanic/autoguide-core';

function isOrderedFlow(flow: FlowRecord): boolean {
  return Array.isArray(flow.steps) && flow.steps.length >= 1;
}

function sortFlows(flows: FlowRecord[]): FlowRecord[] {
  return [...flows].sort((a, b) => {
    const byTitle = a.title.localeCompare(b.title);
    if (byTitle !== 0) return byTitle;
    return a.id.localeCompare(b.id);
  });
}

/**
 * Preserve ordered flows from a prior scan when the current pass would otherwise
 * clobber `flows.json` (e.g. source-only / `--runtime` without crawl).
 *
 * - Incoming ordered flows win on matching `title`
 * - Previous ordered flows with unseen titles are kept
 * - If incoming has no ordered flows, all previous ordered flows are kept
 */
export function mergePreservedFlows(
  incoming: FlowRecord[],
  previous: FlowRecord[],
): FlowRecord[] {
  const incomingOrdered = incoming.filter(isOrderedFlow);
  const previousOrdered = previous.filter(isOrderedFlow);

  if (incomingOrdered.length === 0) {
    return sortFlows(previousOrdered);
  }

  const byTitle = new Map<string, FlowRecord>();
  for (const flow of previousOrdered) {
    byTitle.set(flow.title, flow);
  }
  for (const flow of incomingOrdered) {
    byTitle.set(flow.title, flow);
  }
  return sortFlows([...byTitle.values()]);
}
