/**
 * @iamthamanic/autoguide-ui — headless flow step ordering for Help Widget panels.
 */

import type { FlowRecord, FlowStep } from '@iamthamanic/autoguide-core';

export function listOrderedFlowSteps(flow: FlowRecord): FlowStep[] {
  return [...flow.steps].sort((a, b) => a.order - b.order);
}
