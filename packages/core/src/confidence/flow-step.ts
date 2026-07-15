/**
 * @iamthamanic/autoguide-core — confidence thresholds for flow steps.
 */

import type { FlowStep } from '../types/records.js';
import { REVIEW_THRESHOLD } from './score.js';

const DESTRUCTIVE_STEP =
  /delete|remove|destroy|archive|revoke|terminate|deactivate|approve payment|submit payroll|löschen|entfernen/i;

export function isDestructiveFlowStep(step: Pick<FlowStep, 'title' | 'description'>): boolean {
  const text = `${step.title} ${step.description ?? ''}`;
  return DESTRUCTIVE_STEP.test(text);
}

export function minimumConfidenceForFlowStep(step: Pick<FlowStep, 'title' | 'description'>): number {
  return isDestructiveFlowStep(step) ? 0.9 : REVIEW_THRESHOLD;
}

export function flowStepNeedsReview(
  step: Pick<FlowStep, 'title' | 'description'>,
  factConfidence: number,
): boolean {
  return factConfidence < minimumConfidenceForFlowStep(step);
}
