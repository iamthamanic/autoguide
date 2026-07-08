/**
 * @autoguide/runtime — passive DOM traversal and accessibility extraction (v2).
 */

import { generateSelector, getAccessibleName } from './selector.js';
import { redactString } from '@autoguide/core';
import type {
  RuntimeDialog,
  RuntimeElement,
  RuntimeFormField,
  RuntimeNavigationEvent,
  RuntimeSnapshot,
  RuntimeTextRegion,
} from './types.js';

const INTERACTIVE = new Set(['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA']);

function isInteractive(element: Element): boolean {
  if (INTERACTIVE.has(element.tagName)) return true;
  const role = element.getAttribute('role');
  return role === 'button' || role === 'link' || role === 'tab';
}

function isDisabled(element: Element): boolean {
  if (element instanceof HTMLButtonElement || element instanceof HTMLInputElement) {
    return element.disabled;
  }
  return element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true';
}

function isLoading(element: Element): boolean {
  return (
    element.getAttribute('aria-busy') === 'true' ||
    element.classList.contains('loading') ||
    element.hasAttribute('data-loading')
  );
}

export function runtimeEntityId(selector: string): string {
  return `runtime:${selector}`;
}

function extractForms(root: ParentNode): RuntimeFormField[] {
  const forms = root.querySelectorAll('form');
  const fields: RuntimeFormField[] = [];
  let fieldIndex = 0;

  forms.forEach((form, formIndex) => {
    const formId = form.id || `form-${formIndex + 1}`;
    const controls = form.querySelectorAll('input, select, textarea');
    controls.forEach((control) => {
      fieldIndex += 1;
      const element = control as HTMLInputElement;
      fields.push({
        id: `field-${fieldIndex}`,
        formId,
        selector: generateSelector(element),
        name: element.name || undefined,
        label: redactString(getAccessibleName(element) ?? ''),
        inputType: element.type || element.tagName.toLowerCase(),
        disabled: isDisabled(element),
        required: element.required ?? element.hasAttribute('required'),
      });
    });
  });

  return fields;
}

function extractDialogs(root: ParentNode): RuntimeDialog[] {
  const nodes = root.querySelectorAll('[role="dialog"], dialog, [aria-modal="true"]');
  return [...nodes].map((node, index) => {
    const element = node as Element;
    const open =
      element.tagName === 'DIALOG'
        ? (element as HTMLDialogElement).open
        : element.getAttribute('aria-hidden') !== 'true';
    return {
      id: `dialog-${index + 1}`,
      selector: generateSelector(element),
      label: redactString(getAccessibleName(element) ?? ''),
      open,
    };
  });
}

function extractTextRegions(root: ParentNode): RuntimeTextRegion[] {
  const selectors = ['main', '[role="main"]', 'article', 'h1', 'h2', 'h3'];
  const regions: RuntimeTextRegion[] = [];
  const seen = new Set<Element>();

  for (const selector of selectors) {
    root.querySelectorAll(selector).forEach((node, index) => {
      const element = node as Element;
      if (seen.has(element)) return;
      seen.add(element);
      const text = element.textContent?.trim() ?? '';
      if (text.length < 3) return;
      const tag = element.tagName.toLowerCase();
      regions.push({
        id: `text-${regions.length + 1}`,
        selector: generateSelector(element),
        text: redactString(text.slice(0, 240)),
        headingLevel: /^h[1-3]$/.test(tag) ? Number(tag.slice(1)) : undefined,
      });
    });
  }

  return regions;
}

export function scanDom(
  root: ParentNode,
  route: string,
  navigation: RuntimeNavigationEvent[] = [],
): RuntimeSnapshot {
  const nodes = root.querySelectorAll(
    'button, a, input, select, textarea, [role="button"], [role="link"]',
  );
  const elements: RuntimeElement[] = [];

  nodes.forEach((node, index) => {
    const element = node as Element;
    const selector = generateSelector(element);
    elements.push({
      id: `el-${index + 1}`,
      entityId: runtimeEntityId(selector),
      tagName: element.tagName.toLowerCase(),
      selector,
      label: redactString(getAccessibleName(element) ?? ''),
      role: element.getAttribute('role') ?? undefined,
      route,
      interactive: isInteractive(element),
      disabled: isDisabled(element),
      loading: isLoading(element),
    });
  });

  return {
    capturedAt: new Date().toISOString(),
    route,
    elements,
    forms: extractForms(root),
    dialogs: extractDialogs(root),
    textRegions: extractTextRegions(root),
    navigation,
  };
}
