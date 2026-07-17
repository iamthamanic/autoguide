/**
 * @iamthamanic/autoguide-react — Pick the host element under an inspect hit stack.
 */

/** First HTMLElement in the hit stack that is not part of the inspect overlay. */
export function resolveInspectTarget(
  hitStack: readonly Element[],
  overlayRoot: Element,
): HTMLElement | null {
  for (const el of hitStack) {
    if (!(el instanceof HTMLElement)) continue;
    if (overlayRoot.contains(el)) continue;
    return el;
  }
  return null;
}
