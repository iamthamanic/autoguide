/**
 * @autoguide/react — Help Widget with context resolution and search.
 */

import { useMemo, useRef, useState } from 'react';
import { resolveHelpContext, searchKnowledge } from '@autoguide/core';
import { agTokenCssVars } from '@autoguide/ui';
import { FlowStepList } from './FlowStepList.js';
import { PanelSkeleton } from './PanelSkeleton.js';
import { ReviewBadge } from './ReviewBadge.js';
import { useFocusTrap } from './useFocusTrap.js';
import { useAutoGuide } from './context.js';

export function AutoGuideWidget() {
  const { mode, facts, pages, flows, route, userRole, loading, error, onRetry } = useAutoGuide();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  useFocusTrap(panelRef, open, () => setOpen(false));

  const helpContext = useMemo(
    () => resolveHelpContext(route, pages, flows, facts, mode, userRole),
    [route, pages, flows, facts, mode, userRole],
  );

  const searchHits = useMemo(
    () => searchKnowledge(query, pages, flows, userRole),
    [query, pages, flows, userRole],
  );

  const closePanel = () => setOpen(false);

  return (
    <div style={agTokenCssVars()}>
      <button
        type="button"
        aria-label="Hilfe öffnen"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        style={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          border: 'none',
          background: 'var(--ag-primary)',
          color: '#fff',
          cursor: 'pointer',
          zIndex: 9999,
          boxShadow: 'var(--ag-shadow)',
        }}
      >
        ?
      </button>
      {open ? (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="AutoGuide Hilfe"
          aria-busy={loading || undefined}
          style={{
            position: 'fixed',
            right: 24,
            bottom: 96,
            width: 380,
            maxWidth: 'calc(100vw - 48px)',
            background: 'var(--ag-surface)',
            border: '1px solid var(--ag-border)',
            borderRadius: 'var(--ag-radius)',
            boxShadow: 'var(--ag-shadow)',
            padding: 16,
            zIndex: 9999,
            color: 'var(--ag-text)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600 }}>
              Hilfe{helpContext.pageTitle ? `: ${helpContext.pageTitle}` : ''}
            </h2>
            <button
              type="button"
              aria-label="Hilfe schließen"
              onClick={closePanel}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--ag-text-muted)',
                cursor: 'pointer',
                fontSize: 18,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          {error ? (
            <div role="alert" style={{ fontSize: 14 }}>
              <p style={{ margin: '0 0 12px', color: 'var(--ag-warning)' }}>{error}</p>
              {onRetry ? (
                <button
                  type="button"
                  onClick={onRetry}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--ag-radius)',
                    border: '1px solid var(--ag-border)',
                    background: 'var(--ag-surface-muted)',
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  Erneut versuchen
                </button>
              ) : null}
            </div>
          ) : loading ? (
            <PanelSkeleton />
          ) : (
            <>
              <input
                type="search"
                placeholder="Suchen…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                style={{
                  width: '100%',
                  marginBottom: 12,
                  padding: '8px 10px',
                  borderRadius: 6,
                  border: '1px solid var(--ag-border)',
                  fontSize: 14,
                  color: 'var(--ag-text)',
                }}
              />
              {query.trim() ? (
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14 }}>
                  {searchHits.length === 0 ? (
                    <li>Keine Treffer.</li>
                  ) : (
                    searchHits.map((hit) => (
                      <li key={`${hit.kind}-${hit.id}`}>
                        <strong>{hit.title}</strong> ({hit.kind})
                      </li>
                    ))
                  )}
                </ul>
              ) : helpContext.actions.length === 0 && helpContext.flows.length === 0 ? (
                <div style={{ fontSize: 14 }}>
                  <p style={{ margin: 0, color: 'var(--ag-text-muted)' }}>
                    Keine Dokumentation für diese Seite.
                  </p>
                  {mode === 'development' ? (
                    <p style={{ margin: '8px 0 0', color: 'var(--ag-text-muted)', fontSize: 12 }}>
                      Mit <code>autoguide review list</code> unsichere Einträge prüfen.
                    </p>
                  ) : null}
                </div>
              ) : (
                <>
                  {helpContext.flows.length > 0 ? (
                    <>
                      <h3 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 600 }}>Abläufe</h3>
                      {helpContext.flows.map((flow) => (
                        <div key={flow.id} style={{ marginBottom: 12 }}>
                          <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 600 }}>{flow.title}</p>
                          <FlowStepList flow={flow} />
                        </div>
                      ))}
                    </>
                  ) : null}
                  {helpContext.actions.length > 0 ? (
                    <>
                      <h3 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 600 }}>Aktionen</h3>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14 }}>
                        {helpContext.actions.map((fact) => (
                          <li key={fact.id}>
                            <strong>{String(fact.key)}</strong>: {String(fact.value ?? '')}
                            <ReviewBadge fact={fact} mode={mode} />
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                </>
              )}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
