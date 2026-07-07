/**
 * @autoguide/react — Inspector overlay for dev-mode element inspection.
 */

import { useState, type MouseEvent } from 'react';
import { scanDom } from '@autoguide/runtime';
import type { RuntimeElement } from '@autoguide/runtime';
import { useAutoGuide } from './context.js';

export function InspectorOverlay() {
  const { mode } = useAutoGuide();
  const [active, setActive] = useState(false);
  const [selected, setSelected] = useState<RuntimeElement | null>(null);

  if (mode !== 'development') return null;

  const onInspectClick = () => {
    setActive((value) => !value);
    setSelected(null);
  };

  const onMouseOver = (event: MouseEvent) => {
    if (!active) return;
    event.stopPropagation();
    const target = event.target as HTMLElement;
    target.style.outline = '2px solid #2563eb';
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
  };

  return (
    <>
      <button
        type="button"
        onClick={onInspectClick}
        style={{
          position: 'fixed',
          right: 24,
          bottom: 88,
          zIndex: 9999,
          padding: '8px 12px',
          borderRadius: 8,
          border: 'none',
          background: active ? '#1d4ed8' : '#64748b',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        Inspector
      </button>
      {active ? (
        <div
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
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: 12,
            zIndex: 9999,
          }}
        >
          <strong>Element</strong>
          <p style={{ margin: '8px 0 0', fontSize: 14 }}>{selected.label ?? selected.selector}</p>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 12 }}>{selected.selector}</p>
        </div>
      ) : null}
    </>
  );
}
