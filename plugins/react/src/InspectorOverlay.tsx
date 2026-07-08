/**
 * @autoguide/react — Inspector overlay for dev-mode element inspection.
 */

import { useEffect, useState, type MouseEvent } from 'react';
import { scanDom } from '@autoguide/runtime';
import type { RuntimeElement } from '@autoguide/runtime';
import { agTokenCssVars } from '@autoguide/ui';
import { useAutoGuide } from './context.js';

export function InspectorOverlay() {
  const { mode } = useAutoGuide();
  const [active, setActive] = useState(false);
  const [selected, setSelected] = useState<RuntimeElement | null>(null);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (mode !== 'development') return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (selected) {
        setSelected(null);
        setAnnouncement('Elementauswahl geschlossen.');
        return;
      }
      if (active) {
        setActive(false);
        setAnnouncement('Inspector beendet.');
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [active, mode, selected]);

  if (mode !== 'development') return null;

  const onInspectClick = () => {
    setActive((value) => !value);
    setSelected(null);
    setAnnouncement(active ? 'Inspector beendet.' : 'Inspector aktiv. Element auswählen.');
  };

  const onMouseOver = (event: MouseEvent) => {
    if (!active) return;
    event.stopPropagation();
    const target = event.target as HTMLElement;
    target.style.outline = '2px solid var(--ag-primary)';
  };

  const onClickCapture = (event: MouseEvent) => {
    if (!active) return;
    event.preventDefault();
    event.stopPropagation();
    const target = event.target as HTMLElement;
    const snapshot = scanDom(document, window.location.pathname);
    const match = snapshot.elements.find((el) => target.matches(el.selector));
    setSelected(match ?? null);
    setActive(false);
    setAnnouncement(
      match
        ? `Ausgewählt: ${match.label ?? match.selector}`
        : 'Kein dokumentiertes Element gefunden.',
    );
  };

  return (
    <div style={agTokenCssVars()}>
      <div className="sr-only" aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>
        {announcement}
      </div>
      <button
        type="button"
        onClick={onInspectClick}
        aria-pressed={active}
        style={{
          position: 'fixed',
          right: 24,
          bottom: 88,
          zIndex: 9999,
          padding: '8px 12px',
          borderRadius: 'var(--ag-radius)',
          border: 'none',
          background: active ? '#1d4ed8' : 'var(--ag-text-muted)',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        Inspector
      </button>
      {active ? (
        <div
          role="presentation"
          onMouseOver={onMouseOver}
          onClickCapture={onClickCapture}
          style={{ position: 'fixed', inset: 0, zIndex: 9998, cursor: 'crosshair' }}
        />
      ) : null}
      {selected ? (
        <div
          style={{
            position: 'fixed',
            right: 24,
            bottom: 140,
            width: 320,
            background: 'var(--ag-surface)',
            border: '1px solid var(--ag-border)',
            borderRadius: 'var(--ag-radius)',
            padding: 12,
            zIndex: 9999,
            color: 'var(--ag-text)',
            boxShadow: 'var(--ag-shadow)',
          }}
        >
          <strong>Element</strong>
          <p style={{ margin: '8px 0 0', fontSize: 14 }}>{selected.label ?? selected.selector}</p>
          <p style={{ margin: '4px 0 0', color: 'var(--ag-text-muted)', fontSize: 12 }}>{selected.selector}</p>
          <p style={{ margin: '4px 0 0', color: 'var(--ag-text-muted)', fontSize: 12 }}>
            Graph: {selected.entityId ?? selected.id}
          </p>
        </div>
      ) : null}
    </div>
  );
}
