/**
 * @iamthamanic/autoguide-cli — German hint when flows.json has no ordered flows.
 */

export const FLOW_SEEDING_HINT =
  'Keine geordneten Flows in flows.json. Playwright-Report importieren: ' +
  '`autoguide scan --playwright-import <report.json>` oder `scan.playwrightImportPath` setzen. ' +
  'Referenz: integrations/hr-workflows (Fixture + CI); Beispiel: examples/react-vite.';

/** True when a flow has at least one ordered step. */
export function hasOrderedSteps(flow: unknown): boolean {
  if (typeof flow !== 'object' || flow === null) return false;
  const steps = (flow as { steps?: unknown }).steps;
  return Array.isArray(steps) && steps.length >= 1;
}

export function countOrderedFlows(flows: unknown[]): number {
  return flows.filter(hasOrderedSteps).length;
}

export function flowSeedingWarning(orderedFlowCount: number): string | undefined {
  if (orderedFlowCount > 0) return undefined;
  return FLOW_SEEDING_HINT;
}
