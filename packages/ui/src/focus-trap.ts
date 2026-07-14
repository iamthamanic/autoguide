/**
 * @iamthamanic/autoguide-ui — framework-agnostic focus trap and ESC handler for panels.
 */

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function listFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute('disabled'),
  );
}

/** Binds ESC + Tab cycle on `container`. Returns cleanup (also restores focus). */
export function bindFocusTrap(container: HTMLElement, onEscape: () => void): () => void {
  const previouslyFocused = document.activeElement as HTMLElement | null;
  listFocusable(container)[0]?.focus();

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onEscape();
      return;
    }
    if (event.key !== 'Tab') return;

    const items = listFocusable(container);
    if (items.length === 0) return;

    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) return;
    const current = document.activeElement as HTMLElement;

    if (event.shiftKey && current === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && current === last) {
      event.preventDefault();
      first.focus();
    }
  };

  document.addEventListener('keydown', onKeyDown);
  return () => {
    document.removeEventListener('keydown', onKeyDown);
    previouslyFocused?.focus();
  };
}
