/**
 * @autoguide/vue — Help Widget with context resolution and search.
 */

import { computed, defineComponent, h, ref } from 'vue';
import { resolveHelpContext, searchKnowledge } from '@autoguide/core';
import { useAutoGuide } from './context.js';

const fabStyle = {
  position: 'fixed',
  right: '24px',
  bottom: '24px',
  width: '56px',
  height: '56px',
  borderRadius: '50%',
  border: 'none',
  background: '#2563eb',
  color: '#fff',
  cursor: 'pointer',
  zIndex: 9999,
} as const;

const panelStyle = {
  position: 'fixed',
  right: '24px',
  bottom: '96px',
  width: '380px',
  maxWidth: 'calc(100vw - 48px)',
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
  padding: '16px',
  zIndex: 9999,
} as const;

export const AutoGuideWidget = defineComponent({
  name: 'AutoGuideWidget',
  setup() {
    const { mode, facts, pages, flows, route, userRole } = useAutoGuide();
    const open = ref(false);
    const query = ref('');

    const helpContext = computed(() =>
      resolveHelpContext(route, pages, flows, facts, mode, userRole),
    );

    const searchHits = computed(() => searchKnowledge(query.value, pages, flows, userRole));

    return () => [
      h(
        'button',
        {
          type: 'button',
          'aria-label': 'Hilfe öffnen',
          style: fabStyle,
          onClick: () => {
            open.value = !open.value;
          },
        },
        '?',
      ),
      open.value
        ? h(
            'div',
            { role: 'dialog', 'aria-label': 'AutoGuide Hilfe', style: panelStyle },
            [
              h('h2', { style: { margin: '0 0 8px', fontSize: '16px' } }, [
                helpContext.value.pageTitle
                  ? `Hilfe: ${helpContext.value.pageTitle}`
                  : 'Hilfe',
              ]),
              h('input', {
                type: 'search',
                placeholder: 'Suchen…',
                value: query.value,
                style: {
                  width: '100%',
                  marginBottom: '12px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                },
                onInput: (event: Event) => {
                  query.value = (event.target as HTMLInputElement).value;
                },
              }),
              query.value.trim()
                ? h(
                    'ul',
                    { style: { margin: 0, paddingLeft: '18px', fontSize: '14px' } },
                    searchHits.value.length === 0
                      ? [h('li', 'Keine Treffer.')]
                      : searchHits.value.map((hit) =>
                          h('li', { key: `${hit.kind}-${hit.id}` }, [
                            h('strong', hit.title),
                            ` (${hit.kind})`,
                          ]),
                        ),
                  )
                : helpContext.value.actions.length === 0 &&
                    helpContext.value.flows.length === 0
                  ? h(
                      'p',
                      { style: { margin: 0, color: '#64748b', fontSize: '14px' } },
                      [
                        'Keine Dokumentation für diese Seite.',
                        mode === 'development' ? ' (Entwicklermodus)' : '',
                      ],
                    )
                  : [
                      helpContext.value.flows.length > 0
                        ? [
                            h('h3', { style: { margin: '0 0 6px', fontSize: '14px' } }, 'Abläufe'),
                            h(
                              'ul',
                              { style: { margin: '0 0 12px', paddingLeft: '18px', fontSize: '14px' } },
                              helpContext.value.flows.map((flow) =>
                                h('li', { key: flow.id }, flow.title),
                              ),
                            ),
                          ]
                        : null,
                      helpContext.value.actions.length > 0
                        ? [
                            h('h3', { style: { margin: '0 0 6px', fontSize: '14px' } }, 'Aktionen'),
                            h(
                              'ul',
                              { style: { margin: 0, paddingLeft: '18px', fontSize: '14px' } },
                              helpContext.value.actions.map((fact) =>
                                h('li', { key: fact.id }, [
                                  h('strong', String(fact.key)),
                                  `: ${String(fact.value ?? '')}`,
                                  mode === 'development' && fact.confidence < 0.85
                                    ? h('span', { style: { color: '#b45309' } }, ' (unsicher)')
                                    : null,
                                ]),
                              ),
                            ),
                          ]
                        : null,
                    ],
            ],
          )
        : null,
    ];
  },
});
