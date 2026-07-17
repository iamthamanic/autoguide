/**
 * @iamthamanic/autoguide-react — Pick the host element under an inspect hit stack.
 */

function isAutoGuideChrome(el: HTMLElement, overlayRoot: Element): boolean {
  if (overlayRoot.contains(el)) return true;
  if (el.closest('[data-ag-inspect-overlay]')) return true;
  if (el.closest('.ag-dock, .ag-dock-menu, [data-ag-dock]')) return true;
  return false;
}

/** First HTMLElement in the hit stack that is not AutoGuide inspect/dock chrome. */
export function resolveInspectTarget(
  hitStack: readonly Element[],
  overlayRoot: Element,
): HTMLElement | null {
  for (const el of hitStack) {
    if (!(el instanceof HTMLElement)) continue;
    if (isAutoGuideChrome(el, overlayRoot)) continue;
    return el;
  }
  return null;
}

/** Fallback RuntimeElement when scanDom has no matching selector for the host. */
export function fallbackInspectElement(host: HTMLElement, route: string): import('@iamthamanic/autoguide-runtime').RuntimeElement {
  const tagName = host.tagName.toLowerCase();
  const label = (
    host.getAttribute('aria-label') ||
    host.getAttribute('title') ||
    host.textContent ||
    tagName
  )
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
  const idAttr = host.id ? `#${host.id}` : '';
  const selector = idAttr || tagName;
  return {
    id: `inspect-${tagName}-${Date.now()}`,
    entityId: `inspect:${selector}`,
    tagName,
    selector,
    label: label || tagName,
    role: host.getAttribute('role') ?? undefined,
    route,
    interactive: true,
  };
}
