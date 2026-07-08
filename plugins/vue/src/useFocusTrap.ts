/**
 * @autoguide/vue — focus trap and ESC handler for floating panels.
 */

import { onUnmounted, watch, type Ref } from 'vue';
import { bindFocusTrap } from '@autoguide/ui';

export function useFocusTrap(
  containerRef: Ref<HTMLElement | null>,
  active: Ref<boolean>,
  onEscape: () => void,
): void {
  let cleanup: (() => void) | undefined;

  const detach = () => {
    cleanup?.();
    cleanup = undefined;
  };

  watch(
    [containerRef, active],
    () => {
      detach();
      if (active.value && containerRef.value) {
        cleanup = bindFocusTrap(containerRef.value, onEscape);
      }
    },
    { flush: 'post' },
  );

  onUnmounted(detach);
}
