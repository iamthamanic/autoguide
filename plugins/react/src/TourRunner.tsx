/**
 * @iamthamanic/autoguide-react — guided tour runner with spotlight steps.
 */

import { useEffect, useMemo, useState } from 'react';
import type { Tour } from '@iamthamanic/autoguide-core';
import { useAutoGuide } from './context.js';

export interface TourRunnerProps {
  tourId?: string;
}

function findTarget(selector?: string): HTMLElement | null {
  if (!selector || typeof document === 'undefined') return null;
  try {
    return document.querySelector(selector);
  } catch {
    return null;
  }
}

export function TourRunner({ tourId }: TourRunnerProps) {
  const { mode, tours = [] } = useAutoGuide();
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const tour = useMemo(
    () => tours.find((item) => (tourId ? item.id === tourId : item.status === 'published')),
    [tours, tourId],
  );

  const step = tour?.steps[stepIndex];
  const target = step ? findTarget(step.targetSelector) : null;

  useEffect(() => {
    if (!target) return;
    target.style.outline = '3px solid #2563eb';
    target.style.outlineOffset = '2px';
    return () => {
      target.style.outline = '';
      target.style.outlineOffset = '';
    };
  }, [target, stepIndex]);

  if (mode !== 'published' || !tour) return null;

  const startTour = () => {
    setStepIndex(0);
    setActive(true);
  };

  const next = () => {
    if (!tour) return;
    const nextIndex = stepIndex + 1;
    if (nextIndex >= tour.steps.length) {
      setActive(false);
      setStepIndex(0);
      return;
    }
    const nextStep = tour.steps[nextIndex];
    if (nextStep?.targetSelector && !findTarget(nextStep.targetSelector)) {
      setStepIndex(nextIndex + 1 < tour.steps.length ? nextIndex + 1 : 0);
      setActive(nextIndex + 1 < tour.steps.length);
      return;
    }
    setStepIndex(nextIndex);
  };

  if (!active) {
    return (
      <button
        type="button"
        onClick={startTour}
        style={{
          position: 'fixed',
          left: 24,
          bottom: 24,
          zIndex: 9999,
          padding: '10px 14px',
          borderRadius: 8,
          border: 'none',
          background: '#0f766e',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        Tour: {tour.title}
      </button>
    );
  }

  if (!step) return null;

  if (step.targetSelector && !target) {
    return (
      <div
        style={{
          position: 'fixed',
          left: 24,
          bottom: 96,
          zIndex: 9999,
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: 12,
          maxWidth: 320,
        }}
      >
        <p style={{ margin: 0, fontSize: 14 }}>Schritt übersprungen — Element nicht gefunden.</p>
        <button type="button" onClick={next} style={{ marginTop: 8 }}>
          Weiter
        </button>
      </div>
    );
  }

  const rect = target?.getBoundingClientRect();

  return (
    <div
      style={{
        position: 'fixed',
        top: rect ? rect.bottom + 8 : 96,
        left: rect ? Math.min(rect.left, window.innerWidth - 340) : 24,
        zIndex: 10000,
        width: 320,
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        padding: 12,
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
      }}
    >
      <strong>{step.title}</strong>
      <p style={{ margin: '8px 0', fontSize: 14 }}>{step.body}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={next}>
          {stepIndex + 1 >= (tour?.steps.length ?? 0) ? 'Fertig' : 'Weiter'}
        </button>
        <button type="button" onClick={() => setActive(false)}>
          Beenden
        </button>
      </div>
    </div>
  );
}
