/**
 * @iamthamanic/autoguide-core — generate guided tours from verified flows.
 */

import type { FlowRecord } from '../types/records.js';
import type { Tour, TourStep, TourStepAction } from './types.js';

function inferAction(stepTitle: string): TourStepAction | undefined {
  const lower = stepTitle.toLowerCase();
  if (lower.startsWith('goto ')) return 'navigate';
  if (lower.includes('click')) return 'click';
  if (lower.includes('fill') || lower.includes('eingeb')) return 'input';
  return 'observe';
}

function inferSelector(stepTitle: string): string | undefined {
  const clickMatch = stepTitle.match(/click\s+(.+)/i);
  if (clickMatch?.[1]) return `[aria-label="${clickMatch[1]}"], button:has-text("${clickMatch[1]}")`;
  const gotoMatch = stepTitle.match(/goto\s+(\S+)/i);
  if (gotoMatch?.[1]) return `[data-route="${gotoMatch[1]}"]`;
  return undefined;
}

function selectorForElementId(elementId: string): string {
  return `[data-doc-id="${elementId}"]`;
}

export function generateToursFromFlows(flows: FlowRecord[]): Tour[] {
  return flows
    .filter((flow) => flow.steps.length > 0)
    .map((flow) => ({
      id: `tour-${flow.id}`,
      title: flow.title,
      description: flow.description,
      roleIds: [...flow.roleIds],
      status: flow.status === 'published' ? 'published' : 'draft',
      steps: flow.steps.map((step, index) => {
        const title = step.title;
        const tourStep: TourStep = {
          id: `${flow.id}-step-${index + 1}`,
          title,
          body: step.description ?? `Schritt ${step.order}: ${title}`,
          action: inferAction(title),
          targetSelector: step.elementId
            ? selectorForElementId(step.elementId)
            : inferSelector(title),
          expectedState: step.route,
        };
        return tourStep;
      }),
    }));
}
