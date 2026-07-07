/**
 * @autoguide/playwright — import Playwright JSON report as behavior evidence.
 */

import { readFile } from 'node:fs/promises';
import type { PlaywrightStepEvidence, PlaywrightTestEvidence } from './types.js';

interface ReportNode {
  title?: string;
  file?: string;
  specs?: ReportNode[];
  tests?: ReportNode[];
  suites?: ReportNode[];
  results?: Array<{
    steps?: Array<{ title?: string; category?: string; error?: { message?: string } }>;
  }>;
}

function collectSteps(result: ReportNode): PlaywrightStepEvidence[] {
  const steps: PlaywrightStepEvidence[] = [];
  for (const entry of result.results ?? []) {
    for (const step of entry.steps ?? []) {
      if (!step.title) continue;
      steps.push({
        title: step.title,
        category: step.category,
        error: step.error?.message,
      });
    }
  }
  return steps;
}

function walkSuites(node: ReportNode, file: string | undefined, out: PlaywrightTestEvidence[]): void {
  const nextFile = node.file ?? file;
  if (node.tests) {
    for (const test of node.tests) {
      const steps = collectSteps(test);
      if (steps.length === 0 && test.title) {
        steps.push({ title: test.title });
      }
      if (test.title) {
        out.push({ title: test.title, file: nextFile, steps });
      }
    }
  }
  for (const spec of node.specs ?? []) walkSuites(spec, nextFile, out);
  for (const suite of node.suites ?? []) walkSuites(suite, nextFile, out);
}

export function parsePlaywrightReportJson(content: string): PlaywrightTestEvidence[] {
  const report = JSON.parse(content) as ReportNode;
  const tests: PlaywrightTestEvidence[] = [];
  walkSuites(report, undefined, tests);
  return tests;
}

export async function importPlaywrightReport(reportPath: string): Promise<PlaywrightTestEvidence[]> {
  const content = await readFile(reportPath, 'utf8');
  return parsePlaywrightReportJson(content);
}
