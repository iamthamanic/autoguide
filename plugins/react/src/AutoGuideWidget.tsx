/**
 * @iamthamanic/autoguide-react — Help panel (content only; trigger lives in AutoGuideBar).
 */

import { useMemo, useRef, useState } from 'react';
import {
  explainHelpGap,
  formatHelpActionText,
  resolveHelpContext,
  searchKnowledge,
} from '@iamthamanic/autoguide-core';
import { agTokenCssVars } from '@iamthamanic/autoguide-ui';
import { agPanelAboveBarStyle } from './bar-styles.js';
import { FlowStepList } from './FlowStepList.js';
import { PanelSkeleton } from './PanelSkeleton.js';
import { ReviewBadge } from './ReviewBadge.js';
import { useFocusTrap } from './useFocusTrap.js';
import { useAutoGuide } from './context.js';

export interface AutoGuideWidgetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AutoGuideWidget({ open, onOpenChange }: AutoGuideWidgetProps) {
  const {
    mode,
    facts,
    pages,
    flows,
    reviews,
    route,
    userRole,
    loading,
    error,
    onRetry,
    dockBottomOffset = 0,
  } = useAutoGuide();
  const panelRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');

  useFocusTrap(panelRef, open, () => onOpenChange(false));

  const helpContext = useMemo(
    () => resolveHelpContext(route, pages, flows, facts, mode, userRole),
    [route, pages, flows, facts, mode, userRole],
  );

  const gapReasons = useMemo(
    () =>
      explainHelpGap({
        mode,
        route,
        pages,
        flows,
        facts,
        reviews,
        userRole,
      }),
    [mode, route, pages, flows, facts, reviews, userRole],
  );

  const searchHits = useMemo(
    () => searchKnowledge(query, pages, flows, userRole),
    [query, pages, flows, userRole],
  );

  if (!open) return null;

  const closePanel = () => onOpenChange(false);

  const hasRouteHelp = helpContext.actions.length > 0 || helpContext.flows.length > 0;
  const draftDigest = helpContext.draftDigest;
  const showDraftDigest =
    mode === 'development' &&
    !hasRouteHelp &&
    draftDigest !== undefined &&
    draftDigest.samples.length > 0;

  return (
    <div style={agTokenCssVars()}>
      <div
        ref={panelRef}
        role="dialog"
        aria-label="AutoGuide Hilfe"
        aria-busy={loading || undefined}
        style={agPanelAboveBarStyle(360, dockBottomOffset)}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>
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
                className="ag-panel-input"
                placeholder="Suchen…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                style={{
                  width: '100%',
                  marginBottom: 14,
                  padding: '10px 12px',
                  borderRadius: 999,
                  border: '1px solid var(--ag-border-strong)',
                  background: 'rgba(255, 255, 255, 0.72)',
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
                      <strong>{hit.title}</strong> ({hit.kindLabel})
                    </li>
                  ))
                )}
              </ul>
            ) : hasRouteHelp ? (
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
                          {formatHelpActionText(fact)}
                          <ReviewBadge fact={fact} mode={mode} surface="help" />
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </>
            ) : showDraftDigest && draftDigest ? (
              <div style={{ fontSize: 14 }}>
                <p style={{ margin: 0, color: 'var(--ag-text-muted)' }}>
                  Entwürfe vorhanden — noch nicht freigegeben.
                </p>
                <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--ag-text-muted)' }}>
                  {draftDigest.pendingFactCount} offene Fakten · {draftDigest.pageCount} Seiten ·{' '}
                  {draftDigest.flowCount} Abläufe
                </p>
                {draftDigest.samples.length > 0 ? (
                  <>
                    <h3 style={{ margin: '12px 0 6px', fontSize: 14, fontWeight: 600 }}>
                      Entwurf (Auswahl)
                    </h3>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14 }}>
                      {draftDigest.samples.map((fact) => (
                        <li key={fact.id}>
                          {formatHelpActionText(fact)}
                          <ReviewBadge fact={fact} mode={mode} surface="help" />
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p style={{ margin: '10px 0 0', fontSize: 13, color: 'var(--ag-text-muted)' }}>
                    Im Review-Panel freigeben oder `autoguide scan --auto` für Abläufe.
                  </p>
                )}
              </div>
            ) : (
              <div style={{ fontSize: 14 }}>
                <p style={{ margin: 0, color: 'var(--ag-text-muted)' }}>
                  Keine Dokumentation für diese Seite.
                </p>
                {gapReasons.length > 0 ? (
                  <ul
                    style={{
                      margin: '10px 0 0',
                      paddingLeft: 18,
                      color: 'var(--ag-text-muted)',
                      fontSize: 13,
                      lineHeight: 1.45,
                    }}
                  >
                    {gapReasons.map((reason) => (
                      <li key={reason.id}>{reason.message}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
