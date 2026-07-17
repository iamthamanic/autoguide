/**
 * @iamthamanic/autoguide-cli — German hint when flows.json is empty.
 */

export const FLOW_SEEDING_HINT =
  'Keine geordneten Flows in flows.json. Playwright-Report importieren: ' +
  '`autoguide scan --playwright-import <report.json>` oder `scan.playwrightImportPath` setzen. ' +
  'Referenz: integrations/hr-workflows (Fixture + CI).';

export function flowSeedingWarning(flowCount: number): string | undefined {
  if (flowCount > 0) return undefined;
  return FLOW_SEEDING_HINT;
}
