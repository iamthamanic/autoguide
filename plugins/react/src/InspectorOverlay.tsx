/**
 * @iamthamanic/autoguide-react — Inspector overlay (no trigger; controlled by AutoGuideBar).
 */

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { scanDom } from '@iamthamanic/autoguide-runtime';
import type { RuntimeElement } from '@iamthamanic/autoguide-runtime';
import { agTokenCssVars } from '@iamthamanic/autoguide-ui';
import { agPanelAboveBarStyle } from './bar-styles.js';
import { useAutoGuide } from './context.js';
import { resolveInspectTarget } from './resolveInspectTarget.js';

export interface InspectorOverlayProps {
  active: boolean;
  onActiveChange: (active: boolean) => void;
}

export function InspectorOverlay({ active, onActiveChange }: InspectorOverlayProps) {
  const { mode, dockBottomOffset = 0 } = useAutoGuide();
  const [selected, setSelected] = useState<RuntimeElement | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const lastOutlineRef = useRef<HTMLElement | null>(null);

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

  useEffect(() => {
    if (active) return;
    if (lastOutlineRef.current) {
      lastOutlineRef.current.style.outline = '';
      lastOutlineRef.current = null;
    }
  }, [active]);

  if (mode !== 'development') return null;

  const clearOutline = () => {
    if (lastOutlineRef.current) {
      lastOutlineRef.current.style.outline = '';
      lastOutlineRef.current = null;
    }
  };

  const hostFromEvent = (event: MouseEvent): HTMLElement | null => {
    const overlay = overlayRef.current;
    if (!overlay) return null;
    const stack = document.elementsFromPoint(event.clientX, event.clientY);
    return resolveInspectTarget(stack, overlay);
  };

  const onMouseOver = (event: MouseEvent) => {
    if (!active) return;
    event.stopPropagation();
    const target = hostFromEvent(event);
    if (!target || target === lastOutlineRef.current) return;
    clearOutline();
    target.style.outline = '2px solid var(--ag-primary)';
    lastOutlineRef.current = target;
  };

  const onClickCapture = (event: MouseEvent) => {
    if (!active) return;
    event.preventDefault();
    event.stopPropagation();
    clearOutline();
    const target = hostFromEvent(event);
    const snapshot = scanDom(document, window.location.pathname);
    const match = target
      ? snapshot.elements.find((el) => {
          try {
            return target.matches(el.selector);
          } catch {
            return false;
          }
        })
      : undefined;
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
          ref={overlayRef}
          data-ag-inspect-overlay=""
          role="presentation"
          onMouseOver={onMouseOver}
          onClickCapture={onClickCapture}
          style={{ position: 'fixed', inset: 0, zIndex: 9998, cursor: 'crosshair' }}
        />
      ) : null}
      {selected ? (
        <div style={{ ...agPanelAboveBarStyle(320, dockBottomOffset), maxHeight: 'min(50vh, 360px)', overflow: 'auto' }}>
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
