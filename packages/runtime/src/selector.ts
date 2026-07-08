/**
 * @autoguide/runtime — stable CSS selector generation.
 */

export function generateSelector(element: Element): string {
  const autoguideId = element.getAttribute('data-autoguide-id');
  if (autoguideId) return `[data-autoguide-id="${autoguideId}"]`;

  const testId = element.getAttribute('data-testid');
  if (testId) return `[data-testid="${testId}"]`;

  const id = element.id;
  if (id) return `#${typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(id) : id.replace(/[^\w-]/g, '\\$&')}`;

  const tag = element.tagName.toLowerCase();
  const name = element.getAttribute('name');
  if (name) return `${tag}[name="${name}"]`;

  return tag;
}

export function getAccessibleName(element: Element): string | undefined {
  const aria = element.getAttribute('aria-label');
  if (aria?.trim()) return aria.trim();
  if (element instanceof HTMLInputElement && element.labels?.[0]?.textContent) {
    return element.labels[0].textContent.trim();
  }
  const text = element.textContent?.trim();
  return text || undefined;
}
