/**
 * @iamthamanic/autoguide-cli — German hint when flows.json has no ordered flows.
 *
 * Primary path: AutoGuide autonomy crawl (`--auto` / `--crawl`).
 * Optional bonus: import an existing Playwright JSON report when the host already has one.
 */

export const FLOW_SEEDING_HINT =
  'Keine geordneten Flows in flows.json. Autonomie-Pfad: ' +
  '`autoguide scan --auto` oder `autoguide scan --crawl` (eigener Playwright-Crawl, kein Host-Report nötig). ' +
  'Optional: vorhandenen Report importieren mit `--playwright-import` / `scan.playwrightImportPath`. ' +
  'Referenz: integrations/hr-workflows; Beispiel: examples/react-vite.';

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

/** German next-steps when --auto still ends escalate/blocked. */
export const AUTO_SCAN_NEXT_STEPS =
  'Nächste Schritte: App unter baseUrl starten und `autoguide scan --auto` erneut ausführen; ' +
  'Source-Routen prüfen; optional vorhandenen Playwright-Report mit `--playwright-import` laden.';
