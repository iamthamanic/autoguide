/**
 * @iamthamanic/autoguide-react — dev-only in-app review panel for pending facts.
 */

import { useMemo, useRef, useState } from 'react';
import { agTokenCssVars } from '@iamthamanic/autoguide-ui';
import { useFocusTrap } from './useFocusTrap.js';
import { useAutoGuide } from './context.js';

export function ReviewPanel() {
  const { mode, facts, reviews, reviewHistory, applyReview } = useAutoGuide();
  const [open, setOpen] = useState(false);
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const panelRef = useRef<HTMLDivElement>(null);

  useFocusTrap(panelRef, open, () => setOpen(false));

  const pendingCount = reviews.length;
  const visible = mode === 'development' && pendingCount > 0;

  const itemsByFactId = useMemo(
    () =>
      reviews
        .map((item) => ({ item, fact: facts.find((entry) => entry.id === item.factId) }))
        .filter((entry) => entry.fact !== undefined),
    [facts, reviews],
  );

  if (!visible) return null;

  const resolveDraftValue = (factId: string, fallback: unknown): string =>
    draftValues[factId] ?? String(fallback ?? '');

  const handleDecision = (factId: string, status: 'approved' | 'rejected') => {
    const fact = facts.find((entry) => entry.id === factId);
    if (!fact) return;
    const editedValue = status === 'approved' ? resolveDraftValue(factId, fact.value) : undefined;
    applyReview(factId, status, editedValue);
    setDraftValues((prev) => {
      const next = { ...prev };
      delete next[factId];
      return next;
    });
  };

  return (
    <div style={agTokenCssVars()}>
      <button
        type="button"
        aria-label={`Review-Warteschlange öffnen (${pendingCount})`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        style={{
          position: 'fixed',
          right: 96,
          bottom: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          border: 'none',
          background: 'var(--ag-warning)',
          color: '#fff',
          cursor: 'pointer',
          zIndex: 9999,
          boxShadow: 'var(--ag-shadow)',
          fontWeight: 700,
        }}
      >
        R
        <span
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            minWidth: 20,
            height: 20,
            padding: '0 6px',
            borderRadius: 10,
            background: 'var(--ag-primary)',
            color: '#fff',
            fontSize: 12,
            lineHeight: '20px',
            textAlign: 'center',
          }}
        >
          {pendingCount}
        </span>
      </button>
      {open ? (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Review-Warteschlange"
          style={{
            position: 'fixed',
            right: 24,
            bottom: 96,
            width: 380,
            maxWidth: 'calc(100vw - 48px)',
            maxHeight: 'min(70vh, 520px)',
            overflow: 'auto',
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
            <h2 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600 }}>Review-Warteschlange</h2>
            <button
              type="button"
              aria-label="Review schließen"
              onClick={() => setOpen(false)}
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
          <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--ag-text-muted)' }}>
            {pendingCount} offene Einträge · Historie: {reviewHistory.length}
          </p>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {itemsByFactId.map(({ item, fact }) => {
              if (!fact) return null;
              return (
                <li
                  key={item.factId}
                  style={{
                    marginBottom: 12,
                    padding: 12,
                    border: '1px solid var(--ag-border)',
                    borderRadius: 'var(--ag-radius)',
                    background: 'var(--ag-surface-muted)',
                  }}
                >
                  <p style={{ margin: '0 0 4px', fontSize: 12, color: 'var(--ag-text-muted)' }}>
                    {item.key} · Confidence {Math.round(item.confidence * 100)}%
                  </p>
                  <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--ag-warning)' }}>{item.reason}</p>
                  <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }} htmlFor={`review-${item.factId}`}>
                    Wert
                  </label>
                  <input
                    id={`review-${item.factId}`}
                    type="text"
                    value={resolveDraftValue(item.factId, fact.value)}
                    onChange={(event) =>
                      setDraftValues((prev) => ({ ...prev, [item.factId]: event.target.value }))
                    }
                    style={{
                      width: '100%',
                      marginBottom: 8,
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: '1px solid var(--ag-border)',
                      fontSize: 14,
                      color: 'var(--ag-text)',
                    }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => handleDecision(item.factId, 'approved')}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 'var(--ag-radius)',
                        border: 'none',
                        background: 'var(--ag-success)',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: 14,
                      }}
                    >
                      Annehmen
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecision(item.factId, 'rejected')}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 'var(--ag-radius)',
                        border: '1px solid var(--ag-border)',
                        background: 'var(--ag-surface)',
                        color: 'var(--ag-text)',
                        cursor: 'pointer',
                        fontSize: 14,
                      }}
                    >
                      Ablehnen
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
