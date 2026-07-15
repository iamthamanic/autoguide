/**
 * @iamthamanic/autoguide-react — Inspector overlay (no trigger; controlled by AutoGuideBar).
 */

import { useEffect, useState, type MouseEvent } from 'react';
import { scanDom } from '@iamthamanic/autoguide-runtime';
import type { RuntimeElement } from '@iamthamanic/autoguide-runtime';
import { agTokenCssVars } from '@iamthamanic/autoguide-ui';
import { agPanelAboveBarStyle } from './bar-styles.js';
import { useAutoGuide } from './context.js';

export interface InspectorOverlayProps {
  active: boolean;
  onActiveChange: (active: boolean) => void;
}

export function InspectorOverlay({ active, onActiveChange }: InspectorOverlayProps) {
  const { mode } = useAutoGuide();
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
        onActiveChange(false);
        setAnnouncement('Inspector beendet.');
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [active, mode, onActiveChange, selected]);

  if (mode !== 'development') return null;

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
    onActiveChange(false);
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
      {active ? (
        <div
          role="presentation"
          onMouseOver={onMouseOver}
          onClickCapture={onClickCapture}
          style={{ position: 'fixed', inset: 0, zIndex: 9998, cursor: 'crosshair' }}
        />
      ) : null}
      {selected ? (
        <div style={{ ...agPanelAboveBarStyle(320), maxHeight: 'min(50vh, 360px)', overflow: 'auto' }}>
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
