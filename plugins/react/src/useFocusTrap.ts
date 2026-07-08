/**
 * @autoguide/react — focus trap and ESC handler for floating panels.
 */

import { useEffect, type RefObject } from 'react';
import { bindFocusTrap } from '@autoguide/ui';

export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
  onEscape: () => void,
): void {
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;
    return bindFocusTrap(container, onEscape);
  }, [active, containerRef, onEscape]);
}

