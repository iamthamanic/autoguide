/**
 * @autoguide/vue — Inspector overlay for dev-mode element inspection.
 */

import { defineComponent, h, ref } from 'vue';
import { scanDom } from '@autoguide/runtime';
import type { RuntimeElement } from '@autoguide/runtime';
import { useAutoGuide } from './context.js';

export const InspectorOverlay = defineComponent({
  name: 'InspectorOverlay',
  setup() {
    const { mode } = useAutoGuide();
    const active = ref(false);
    const selected = ref<RuntimeElement | null>(null);

    const onInspectClick = () => {
      active.value = !active.value;
      selected.value = null;
    };

    const onMouseOver = (event: MouseEvent) => {
      if (!active.value) return;
      event.stopPropagation();
      const target = event.target as HTMLElement;
      target.style.outline = '2px solid #2563eb';
    };

    const onClickCapture = (event: MouseEvent) => {
      if (!active.value) return;
      event.preventDefault();
      event.stopPropagation();
      const target = event.target as HTMLElement;
      const snapshot = scanDom(document, window.location.pathname);
      const match = snapshot.elements.find((el) => target.matches(el.selector));
      selected.value = match ?? null;
      active.value = false;
    };

    return () => {
      if (mode !== 'development') return null;

      return [
        h(
          'button',
          {
            type: 'button',
            style: {
              position: 'fixed',
              right: '24px',
              bottom: '88px',
              zIndex: 9999,
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: active.value ? '#1d4ed8' : '#64748b',
              color: '#fff',
              cursor: 'pointer',
            },
            onClick: onInspectClick,
          },
          'Inspector',
        ),
        active.value
          ? h('div', {
              style: { position: 'fixed', inset: 0, zIndex: 9998, cursor: 'crosshair' },
              onMouseover: onMouseOver,
              onClickCapture,
            })
          : null,
        selected.value
          ? h(
              'div',
              {
                style: {
                  position: 'fixed',
                  right: '24px',
                  bottom: '140px',
                  width: '320px',
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px',
                  zIndex: 9999,
                },
              },
              [
                h('strong', 'Element'),
                h('p', { style: { margin: '8px 0 0', fontSize: '14px' } }, [
                  selected.value.label ?? selected.value.selector,
                ]),
                h(
                  'p',
                  { style: { margin: '4px 0 0', color: '#64748b', fontSize: '12px' } },
                  selected.value.selector,
                ),
              ],
            )
          : null,
      ];
    };
  },
});
