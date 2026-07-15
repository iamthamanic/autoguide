/**
 * @iamthamanic/autoguide-playwright — self-contained DOM scan for page.evaluate (no external refs).
 */

import type { RuntimeSnapshot } from '@iamthamanic/autoguide-runtime';

/** Serializable for Playwright — helpers as const arrows so tsc keeps them in the function body. */
export function browserScanDom(route: string): RuntimeSnapshot {
  const generateSelector = (element: Element): string => {
    const autoguideId = element.getAttribute('data-autoguide-id');
    if (autoguideId) return `[data-autoguide-id="${autoguideId}"]`;
    const testId = element.getAttribute('data-testid');
    if (testId) return `[data-testid="${testId}"]`;
    const id = element.id;
    if (id) {
      const escaped =
        typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(id) : id.replace(/[^\w-]/g, '\\$&');
      return `#${escaped}`;
    }
    const tag = element.tagName.toLowerCase();
    const name = element.getAttribute('name');
    if (name) return `${tag}[name="${name}"]`;
    return tag;
  };

  const getAccessibleName = (element: Element): string | undefined => {
    const aria = element.getAttribute('aria-label');
    if (aria?.trim()) return aria.trim();
    if (element instanceof HTMLInputElement && element.labels?.[0]?.textContent) {
      return element.labels[0].textContent.trim();
    }
    return element.textContent?.trim() || undefined;
  };

  const isInteractive = (element: Element): boolean => {
    const interactive = new Set(['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA']);
    if (interactive.has(element.tagName)) return true;
    const role = element.getAttribute('role');
    return role === 'button' || role === 'link' || role === 'tab';
  };

  const isDisabled = (element: Element): boolean => {
    if (element instanceof HTMLButtonElement || element instanceof HTMLInputElement) {
      return element.disabled;
    }
    return element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true';
  };

  const isLoading = (element: Element): boolean =>
    element.getAttribute('aria-busy') === 'true' ||
    element.classList.contains('loading') ||
    element.hasAttribute('data-loading');

  const nodes = document.querySelectorAll(
    'button, a, input, select, textarea, [role="button"], [role="link"]',
  );

  const elements = [...nodes].map((node, index) => {
    const element = node as Element;
    const selector = generateSelector(element);
    return {
      id: `el-${index + 1}`,
      entityId: `runtime:${selector}`,
      tagName: element.tagName.toLowerCase(),
      selector,
      label: getAccessibleName(element) ?? '',
      role: element.getAttribute('role') ?? undefined,
      route,
      interactive: isInteractive(element),
      disabled: isDisabled(element),
      loading: isLoading(element),
    };
  });

  return {
    capturedAt: new Date().toISOString(),
    route,
    elements,
    forms: [],
    dialogs: [],
    textRegions: [],
    navigation: [],
  };
}
