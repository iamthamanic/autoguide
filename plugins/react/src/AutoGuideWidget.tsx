/**
 * @autoguide/react — Help Widget with context resolution and search.
 */

import { useMemo, useState } from 'react';
import { resolveHelpContext, searchKnowledge } from '@autoguide/core';
import { useAutoGuide } from './context.js';

export function AutoGuideWidget() {
  const { mode, facts, pages, flows, route, userRole } = useAutoGuide();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const helpContext = useMemo(
    () => resolveHelpContext(route, pages, flows, facts, mode, userRole),
    [route, pages, flows, facts, mode, userRole],
  );

  const searchHits = useMemo(
    () => searchKnowledge(query, pages, flows, userRole),
    [query, pages, flows, userRole],
  );

  return (
    <>
      <button
        type="button"
        aria-label="Hilfe öffnen"
        onClick={() => setOpen((value) => !value)}
        style={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          border: 'none',
          background: '#2563eb',
          color: '#fff',
          cursor: 'pointer',
          zIndex: 9999,
        }}
      >
        ?
      </button>
      {open ? (
        <div
          role="dialog"
          aria-label="AutoGuide Hilfe"
          style={{
            position: 'fixed',
            right: 24,
            bottom: 96,
            width: 380,
            maxWidth: 'calc(100vw - 48px)',
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            padding: 16,
            zIndex: 9999,
          }}
        >
          <h2 style={{ margin: '0 0 8px', fontSize: 16 }}>
            Hilfe{helpContext.pageTitle ? `: ${helpContext.pageTitle}` : ''}
          </h2>
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
              border: '1px solid #e2e8f0',
              fontSize: 14,
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
            <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
              Keine Dokumentation für diese Seite.
              {mode === 'development' ? ' (Entwicklermodus)' : ''}
            </p>
          ) : (
            <>
              {helpContext.flows.length > 0 ? (
                <>
                  <h3 style={{ margin: '0 0 6px', fontSize: 14 }}>Abläufe</h3>
                  <ul style={{ margin: '0 0 12px', paddingLeft: 18, fontSize: 14 }}>
                    {helpContext.flows.map((flow) => (
                      <li key={flow.id}>{flow.title}</li>
                    ))}
                  </ul>
                </>
              ) : null}
              {helpContext.actions.length > 0 ? (
                <>
                  <h3 style={{ margin: '0 0 6px', fontSize: 14 }}>Aktionen</h3>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14 }}>
                    {helpContext.actions.map((fact) => (
                      <li key={fact.id}>
                        <strong>{String(fact.key)}</strong>: {String(fact.value ?? '')}
                        {mode === 'development' && fact.confidence < 0.85 ? (
                          <span style={{ color: '#b45309' }}> (unsicher)</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </>
  );
}
