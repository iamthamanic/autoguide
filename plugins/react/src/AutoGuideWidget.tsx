/**
 * @autoguide/react — Help Widget FAB and panel placeholder.
 */

import { useMemo, useState } from 'react';
import { filterFactsForMode } from '@autoguide/core';
import { useAutoGuide } from './context.js';

export function AutoGuideWidget() {
  const { mode, facts } = useAutoGuide();
  const [open, setOpen] = useState(false);
  const visibleFacts = useMemo(() => filterFactsForMode(facts, mode), [facts, mode]);

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
          <h2 style={{ margin: '0 0 8px', fontSize: 16 }}>Hilfe</h2>
          {visibleFacts.length === 0 ? (
            <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
              Keine Dokumentation für diese Seite.
              {mode === 'development' ? ' (Entwicklermodus)' : ''}
            </p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14 }}>
              {visibleFacts.slice(0, 8).map((fact) => (
                <li key={fact.id}>
                  <strong>{String(fact.key)}</strong>: {String(fact.value ?? '')}
                  {mode === 'development' && fact.confidence < 0.85 ? (
                    <span style={{ color: '#b45309' }}> (unsicher)</span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </>
  );
}
