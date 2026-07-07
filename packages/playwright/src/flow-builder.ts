/**
 * @autoguide/playwright — build flow candidates from Playwright evidence.
 */

import type { Fact, FlowRecord } from '@autoguide/core';
import { scoreFromProvenance } from '@autoguide/core';
import type { PlaywrightImportResult, PlaywrightTestEvidence } from './types.js';

function now(): string {
  return new Date().toISOString();
}

export function buildFlowsFromTests(tests: PlaywrightTestEvidence[]): FlowRecord[] {
  return tests.map((test, index) => ({
    id: `flow-${index + 1}`,
    title: test.title,
    description: test.file ? `Importiert aus ${test.file}` : undefined,
    steps: test.steps.map((step, stepIndex) => ({
      order: stepIndex + 1,
      title: step.title,
      description: step.error ? `Fehler: ${step.error}` : undefined,
      factIds: [],
    })),
    roleIds: [],
    pageIds: [],
    factIds: [],
    status: 'draft' as const,
  }));
}

export function testsToFacts(tests: PlaywrightTestEvidence[]): Fact[] {
  const facts: Fact[] = [];
  let counter = 0;
  for (const test of tests) {
    for (const step of test.steps) {
      counter += 1;
      const provenance = [
        {
          source: 'playwright_trace' as const,
          filePath: test.file,
          confidence: step.error ? 0.55 : 0.88,
          observedAt: now(),
        },
      ];
      facts.push({
        id: `pw-fact-${counter}`,
        entityId: test.title,
        key: 'step',
        value: step.title,
        status: step.error ? 'needs_review' : 'verified',
        reviewStatus: 'pending',
        confidence: scoreFromProvenance(provenance),
        provenance,
        createdAt: now(),
        updatedAt: now(),
      });
    }
  }
  return facts;
}

export function detectUncoveredRoutes(
  knownRoutes: string[],
  visitedRoutes: string[],
): string[] {
  const visited = new Set(visitedRoutes.map((route) => route.replace(/\/$/, '') || '/'));
  return knownRoutes.filter((route) => {
    const normalized = route.replace(/\/$/, '') || '/';
    return !visited.has(normalized);
  });
}

export function mergePlaywrightEvidence(
  tests: PlaywrightTestEvidence[],
  knownRoutes: string[],
  visitedRoutes: string[] = [],
): PlaywrightImportResult {
  const flows = buildFlowsFromTests(tests);
  return {
    tests,
    flows,
    uncoveredRoutes: detectUncoveredRoutes(knownRoutes, visitedRoutes),
  };
}
