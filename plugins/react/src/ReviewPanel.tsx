/**
 * @iamthamanic/autoguide-react — dev-only review panel (controlled by AutoGuideBar).
 */

import { useMemo, useRef, useState } from 'react';
import { agTokenCssVars } from '@iamthamanic/autoguide-ui';
import { agPanelAboveBarStyle } from './bar-styles.js';
import { useFocusTrap } from './useFocusTrap.js';
import { useAutoGuide } from './context.js';

export interface ReviewPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReviewPanel({ open, onOpenChange }: ReviewPanelProps) {
  const { mode, facts, reviews, reviewHistory, applyReview } = useAutoGuide();
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const panelRef = useRef<HTMLDivElement>(null);

  useFocusTrap(panelRef, open, () => onOpenChange(false));

  const pendingCount = reviews.length;

  const itemsByFactId = useMemo(
    () =>
      reviews
        .map((item) => ({ item, fact: facts.find((entry) => entry.id === item.factId) }))
        .filter((entry) => entry.fact !== undefined),
    [facts, reviews],
  );

  if (mode !== 'development' || !open) return null;

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
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Review-Warteschlange"
        style={{
          ...agPanelAboveBarStyle(),
          maxHeight: 'min(70vh, 520px)',
          overflow: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Review</h2>
          <button
            type="button"
            aria-label="Review schließen"
            onClick={() => onOpenChange(false)}
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
        {pendingCount === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--ag-text-muted)', lineHeight: 1.5 }}>
            Keine offenen Reviews. Nach einem Scan erscheinen hier Fakten mit niedriger Confidence.
          </p>
        ) : null}
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
    </div>
  );
}

/** Pending review count for dock bar visibility (development only). */
export function useReviewPendingCount(): number {
  const { mode, reviews } = useAutoGuide();
  return mode === 'development' ? reviews.length : 0;
}
