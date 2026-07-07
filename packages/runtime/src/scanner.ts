/**
 * @autoguide/runtime — passive DOM traversal and accessibility extraction.
 */

import { generateSelector, getAccessibleName } from './selector.js';
import type { RuntimeElement, RuntimeSnapshot } from './types.js';

const INTERACTIVE = new Set(['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA']);

function isInteractive(element: Element): boolean {
  if (INTERACTIVE.has(element.tagName)) return true;
  const role = element.getAttribute('role');
  return role === 'button' || role === 'link' || role === 'tab';
}

export function scanDom(root: ParentNode, route: string): RuntimeSnapshot {
  const nodes = root.querySelectorAll('button, a, input, select, textarea, [role="button"], [role="link"]');
  const elements: RuntimeElement[] = [];

  nodes.forEach((node, index) => {
    const element = node as Element;
    elements.push({
      id: `el-${index + 1}`,
      tagName: element.tagName.toLowerCase(),
      selector: generateSelector(element),
      label: getAccessibleName(element),
      role: element.getAttribute('role') ?? undefined,
      route,
      interactive: isInteractive(element),
    });
  });

  return {
    capturedAt: new Date().toISOString(),
    route,
    elements,
  };
}
