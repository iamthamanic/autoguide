import { describe, expect, it } from 'vitest';
import { parsePlaywrightReportJson } from './import-report.js';
import { buildFlowsFromTests, detectUncoveredRoutes, mergePlaywrightEvidence } from './flow-builder.js';
import { isSafeAction } from './crawl.js';

const SAMPLE_REPORT = JSON.stringify({
  suites: [
    {
      title: 'Employee',
      specs: [
        {
          title: 'create employee',
          tests: [
            {
              title: 'should create employee',
              results: [
                {
                  steps: [
                    { title: 'goto /employees', category: 'pw:api' },
                    { title: 'click Neuer Mitarbeiter', category: 'pw:api' },
                    { title: 'fill form', category: 'pw:api' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
});

describe('@iamthamanic/autoguide-playwright', () => {
  it('parses playwright json report steps', () => {
    const tests = parsePlaywrightReportJson(SAMPLE_REPORT);
    expect(tests[0]?.steps.length).toBe(3);
  });

  it('builds ordered flow candidates', () => {
    const tests = parsePlaywrightReportJson(SAMPLE_REPORT);
    const flows = buildFlowsFromTests(tests);
    expect(flows[0]?.steps[0]?.order).toBe(1);
    expect(flows[0]?.steps[2]?.title).toBe('fill form');
  });

  it('detects uncovered routes', () => {
    const uncovered = detectUncoveredRoutes(['/', '/employees', '/settings'], ['/employees']);
    expect(uncovered).toContain('/');
    expect(uncovered).toContain('/settings');
  });

  it('skips destructive labels in safe mode', () => {
    expect(isSafeAction('Delete account')).toBe(false);
    expect(isSafeAction('Open settings')).toBe(true);
  });

  it('infers roleIds from suite titles', () => {
    const report = JSON.stringify({
      suites: [
        {
          title: 'Wiki - Search and Filters (User)',
          specs: [
            {
              title: 'Wiki durchsuchen',
              tests: [
                {
                  title: 'Wiki-Suche',
                  results: [{ steps: [{ title: 'goto /learning' }] }],
                },
              ],
            },
          ],
        },
        {
          title: 'TM Stammdaten',
          specs: [
            {
              title: 'Stammdaten prüfen',
              tests: [
                {
                  title: 'Admin Stammdaten',
                  results: [{ steps: [{ title: 'goto /time-management' }] }],
                },
              ],
            },
          ],
        },
      ],
    });
    const flows = buildFlowsFromTests(parsePlaywrightReportJson(report));
    expect(flows[0]?.roleIds).toEqual(['Mitarbeiter']);
    expect(flows[1]?.roleIds).toEqual(['HR-Admin']);
  });

  it('merges import result with flows', () => {
    const tests = parsePlaywrightReportJson(SAMPLE_REPORT);
    const result = mergePlaywrightEvidence(tests, ['/', '/employees']);
    expect(result.flows.length).toBe(1);
    expect(result.uncoveredRoutes).toContain('/');
  });
});
