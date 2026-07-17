/**
 * @iamthamanic/autoguide-vue — Help Widget with context resolution and search.
 */

import { computed, defineComponent, h, ref } from 'vue';
import { explainHelpGap, resolveHelpContext, searchKnowledge } from '@iamthamanic/autoguide-core';
import { agTokenCssVars } from '@iamthamanic/autoguide-ui';
import { FlowStepList } from './FlowStepList.js';
import { PanelSkeleton } from './PanelSkeleton.js';
import { ReviewBadge } from './ReviewBadge.js';
import { useFocusTrap } from './useFocusTrap.js';
import { useAutoGuide } from './context.js';

export const AutoGuideWidget = defineComponent({
  name: 'AutoGuideWidget',
  setup() {
    const { mode, facts, pages, flows, route, userRole, loading, error, onRetry } = useAutoGuide();
    const open = ref(false);
    const query = ref('');
    const panelRef = ref<HTMLElement | null>(null);

    useFocusTrap(panelRef, open, () => {
      open.value = false;
    });

    const helpContext = computed(() =>
      resolveHelpContext(route, pages, flows, facts, mode, userRole),
    );

    const gapReasons = computed(() =>
      explainHelpGap({
        mode,
        route,
        pages,
        flows,
        facts,
        userRole,
      }),
    );

    const searchHits = computed(() => searchKnowledge(query.value, pages, flows, userRole));

    const closePanel = () => {
      open.value = false;
    };

    return () =>
      h('div', { style: agTokenCssVars() }, [
        h(
          'button',
          {
            type: 'button',
            'aria-label': 'Hilfe öffnen',
            'aria-expanded': open.value ? 'true' : 'false',
            style: {
              position: 'fixed',
              right: '24px',
              bottom: '24px',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              border: 'none',
              background: 'var(--ag-primary)',
              color: '#fff',
              cursor: 'pointer',
              zIndex: 9999,
              boxShadow: 'var(--ag-shadow)',
            },
            onClick: () => {
              open.value = !open.value;
            },
          },
          '?',
        ),
        open.value
          ? h(
              'div',
              {
                ref: panelRef,
                role: 'dialog',
                'aria-label': 'AutoGuide Hilfe',
                'aria-busy': loading ? 'true' : undefined,
                style: {
                  position: 'fixed',
                  right: '24px',
                  bottom: '96px',
                  width: '380px',
                  maxWidth: 'calc(100vw - 48px)',
                  background: 'var(--ag-surface)',
                  border: '1px solid var(--ag-border)',
                  borderRadius: 'var(--ag-radius)',
                  boxShadow: 'var(--ag-shadow)',
                  padding: '16px',
                  zIndex: 9999,
                  color: 'var(--ag-text)',
                },
              },
              [
                h(
                  'div',
                  {
                    style: {
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    },
                  },
                  [
                    h(
                      'h2',
                      { style: { margin: '0 0 8px', fontSize: '16px', fontWeight: 600 } },
                      helpContext.value.pageTitle
                        ? `Hilfe: ${helpContext.value.pageTitle}`
                        : 'Hilfe',
                    ),
                    h(
                      'button',
                      {
                        type: 'button',
                        'aria-label': 'Hilfe schließen',
                        style: {
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--ag-text-muted)',
                          cursor: 'pointer',
                          fontSize: '18px',
                          lineHeight: 1,
                        },
                        onClick: closePanel,
                      },
                      '×',
                    ),
                  ],
                ),
                error
                  ? h('div', { role: 'alert', style: { fontSize: '14px' } }, [
                      h('p', { style: { margin: '0 0 12px', color: 'var(--ag-warning)' } }, error),
                      onRetry
                        ? h(
                            'button',
                            {
                              type: 'button',
                              style: {
                                padding: '8px 12px',
                                borderRadius: 'var(--ag-radius)',
                                border: '1px solid var(--ag-border)',
                                background: 'var(--ag-surface-muted)',
                                cursor: 'pointer',
                                fontSize: '14px',
                              },
                              onClick: onRetry,
                            },
                            'Erneut versuchen',
                          )
                        : null,
                    ])
                  : loading
                    ? h(PanelSkeleton)
                    : [
                        h('input', {
                          type: 'search',
                          placeholder: 'Suchen…',
                          value: query.value,
                          style: {
                            width: '100%',
                            marginBottom: '12px',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: '1px solid var(--ag-border)',
                            fontSize: '14px',
                            color: 'var(--ag-text)',
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
                            ? h('div', { style: { fontSize: '14px' } }, [
                                h(
                                  'p',
                                  { style: { margin: 0, color: 'var(--ag-text-muted)' } },
                                  'Keine Dokumentation für diese Seite.',
                                ),
                                gapReasons.value.length > 0
                                  ? h(
                                      'ul',
                                      {
                                        style: {
                                          margin: '10px 0 0',
                                          paddingLeft: '18px',
                                          color: 'var(--ag-text-muted)',
                                          fontSize: '13px',
                                          lineHeight: 1.45,
                                        },
                                      },
                                      gapReasons.value.map((reason) =>
                                        h('li', { key: reason.id }, reason.message),
                                      ),
                                    )
                                  : null,
                              ])
                            : [
                                helpContext.value.flows.length > 0
                                  ? [
                                      h(
                                        'h3',
                                        { style: { margin: '0 0 6px', fontSize: '14px', fontWeight: 600 } },
                                        'Abläufe',
                                      ),
                                      ...helpContext.value.flows.map((flow) =>
                                        h('div', { key: flow.id, style: { marginBottom: '12px' } }, [
                                          h(
                                            'p',
                                            {
                                              style: {
                                                margin: '0 0 6px',
                                                fontSize: '14px',
                                                fontWeight: 600,
                                              },
                                            },
                                            flow.title,
                                          ),
                                          h(FlowStepList, { flow }),
                                        ]),
                                      ),
                                    ]
                                  : null,
                                helpContext.value.actions.length > 0
                                  ? [
                                      h(
                                        'h3',
                                        { style: { margin: '0 0 6px', fontSize: '14px', fontWeight: 600 } },
                                        'Aktionen',
                                      ),
                                      h(
                                        'ul',
                                        { style: { margin: 0, paddingLeft: '18px', fontSize: '14px' } },
                                        helpContext.value.actions.map((fact) =>
                                          h('li', { key: fact.id }, [
                                            h('strong', String(fact.key)),
                                            `: ${String(fact.value ?? '')}`,
                                            h(ReviewBadge, { fact, mode }),
                                          ]),
                                        ),
                                      ),
                                    ]
                                  : null,
                              ],
                      ],
              ],
            )
          : null,
      ]);
  },
});
