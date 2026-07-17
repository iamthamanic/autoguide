/**
 * @iamthamanic/autoguide-core — evaluate scan evidence for help/tour readiness.
 * Location: packages/core/src/sufficiency/evaluate.ts
 *
 * Criteria (YAGNI): see DEFAULT_SUFFICIENCY_CRITERIA in types.ts.
 * Interactive facts: provenance from source_code | runtime_dom |
 * accessibility_tree | playwright_trace (excludes pure route metadata keys).
 */

import type { Fact } from '../types/fact.js';
import type { FlowRecord, PageRecord } from '../types/records.js';
import {
  DEFAULT_SUFFICIENCY_CRITERIA,
  type SufficiencyCriteria,
  type SufficiencyEvidence,
  type SufficiencyReason,
  type SufficiencyReport,
  type SufficiencyStatus,
} from './types.js';

const INTERACTIVE_SOURCES = new Set([
  'source_code',
  'runtime_dom',
  'accessibility_tree',
  'playwright_trace',
]);

const NON_INTERACTIVE_KEYS = new Set(['route', 'path', 'url']);

export function isInteractiveFact(fact: Fact): boolean {
  if (NON_INTERACTIVE_KEYS.has(fact.key)) return false;
  return fact.provenance.some((p) => INTERACTIVE_SOURCES.has(p.source));
}

export function countOrderedFlows(flows: FlowRecord[]): number {
  return flows.filter((flow) => Array.isArray(flow.steps) && flow.steps.length >= 1).length;
}

export function collectSufficiencyEvidence(input: {
  flows: FlowRecord[];
  facts: Fact[];
  pages: PageRecord[];
}): SufficiencyEvidence {
  return {
    orderedFlowCount: countOrderedFlows(input.flows),
    interactiveFactCount: input.facts.filter(isInteractiveFact).length,
    pageCount: input.pages.length,
    factCount: input.facts.length,
  };
}

function buildReasons(
  status: SufficiencyStatus,
  evidence: SufficiencyEvidence,
  criteria: SufficiencyCriteria,
): SufficiencyReason[] {
  const reasons: SufficiencyReason[] = [];

  if (status === 'sufficient') {
    reasons.push({
      code: 'ordered_flows',
      messageDe:
        evidence.orderedFlowCount === 1
          ? 'Ausreichend: 1 geordneter Flow vorhanden.'
          : `Ausreichend: ${evidence.orderedFlowCount} geordnete Flows vorhanden.`,
    });
    if (
      evidence.interactiveFactCount >= criteria.minInteractiveFacts &&
      evidence.pageCount >= criteria.minPages
    ) {
      reasons.push({
        code: 'interactive_coverage',
        messageDe:
          `Zusätzlich: ${evidence.interactiveFactCount} interaktive Facts ` +
          `auf ${evidence.pageCount} Seite(n).`,
      });
    }
    return reasons;
  }

  if (status === 'blocked') {
    reasons.push({
      code: 'no_evidence',
      messageDe:
        'Blockiert: keine Seiten und keine Facts — Source-Scan prüfen oder `autoguide init` ausführen.',
    });
    return reasons;
  }

  // escalate
  if (evidence.orderedFlowCount < criteria.minOrderedFlows) {
    reasons.push({
      code: 'missing_ordered_flows',
      messageDe:
        `Eskalation: keine geordneten Flows (mindestens ${criteria.minOrderedFlows} nötig). ` +
        'Crawl oder Playwright-Import empfohlen.',
    });
  }
  if (evidence.interactiveFactCount < criteria.minInteractiveFacts) {
    reasons.push({
      code: 'low_interactive_facts',
      messageDe:
        `Eskalation: nur ${evidence.interactiveFactCount} interaktive Facts ` +
        `(mindestens ${criteria.minInteractiveFacts} nötig). Runtime-Scan oder Crawl empfohlen.`,
    });
  }
  if (evidence.pageCount < criteria.minPages) {
    reasons.push({
      code: 'few_pages',
      messageDe: `Eskalation: nur ${evidence.pageCount} Seite(n) erkannt.`,
    });
  }
  if (reasons.length === 0) {
    reasons.push({
      code: 'escalate',
      messageDe: 'Eskalation: Evidenz unzureichend — Crawl/Runtime empfohlen.',
    });
  }
  return reasons;
}

/**
 * Evaluate whether scan evidence is enough for help/tours.
 * Pure function — no I/O, no app-specific hardcodes.
 */
export function evaluateSufficiency(
  input: {
    flows: FlowRecord[];
    facts: Fact[];
    pages: PageRecord[];
  },
  criteria: SufficiencyCriteria = DEFAULT_SUFFICIENCY_CRITERIA,
): SufficiencyReport {
  const evidence = collectSufficiencyEvidence(input);

  const hasOrderedFlows = evidence.orderedFlowCount >= criteria.minOrderedFlows;

  let status: SufficiencyStatus;
  if (hasOrderedFlows) {
    status = 'sufficient';
  } else if (evidence.pageCount === 0 && evidence.factCount === 0) {
    status = 'blocked';
  } else {
    // Includes high interactive coverage with 0 ordered flows — `--auto` must crawl.
    status = 'escalate';
  }

  return {
    status,
    reasons: buildReasons(status, evidence, criteria),
    evidence,
    criteria: { ...criteria },
    evaluatedAt: new Date().toISOString(),
  };
}

/** German one-liner for CLI scan/doctor summaries. */
export function formatSufficiencySummary(report: SufficiencyReport): string {
  const label =
    report.status === 'sufficient'
      ? 'ausreichend'
      : report.status === 'escalate'
        ? 'eskalieren'
        : 'blockiert';
  const detail = report.reasons.map((r) => r.messageDe).join(' ');
  return `Sufficiency (${label}): ${detail}`;
}
