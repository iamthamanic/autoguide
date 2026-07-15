/**
 * @iamthamanic/autoguide-react — guided tour runner (controlled by AutoGuideBar).
 */

import { useEffect, useMemo, useState } from 'react';
import { useAutoGuide } from './context.js';
import { AG_BAR_BOTTOM, AG_BAR_GAP, AG_DOCK_HEIGHT } from './bar-styles.js';

const TOUR_PANEL_BOTTOM = AG_BAR_BOTTOM + AG_DOCK_HEIGHT + AG_BAR_GAP;

export interface TourRunnerProps {
  tourId?: string;
  active: boolean;
  onActiveChange: (active: boolean) => void;
}

function findTarget(selector?: string): HTMLElement | null {
  if (!selector || typeof document === 'undefined') return null;
  try {
    return document.querySelector(selector);
  } catch {
    return null;
  }
}

export function TourRunner({ tourId, active, onActiveChange }: TourRunnerProps) {
  const { tours = [] } = useAutoGuide();
  const [stepIndex, setStepIndex] = useState(0);

  const tour = useMemo(
    () => tours.find((item) => (tourId ? item.id === tourId : item.status === 'published')),
    [tours, tourId],
  );

  const step = tour?.steps[stepIndex];
  const target = step ? findTarget(step.targetSelector) : null;

  useEffect(() => {
    if (!active) {
      setStepIndex(0);
    }
  }, [active]);

  useEffect(() => {
    if (!target) return;
    target.style.outline = '3px solid #2563eb';
    target.style.outlineOffset = '2px';
    return () => {
      target.style.outline = '';
      target.style.outlineOffset = '';
    };
  }, [target, stepIndex]);

  if (!tour || !active) return null;

  const next = () => {
    if (!tour) return;
    const nextIndex = stepIndex + 1;
    if (nextIndex >= tour.steps.length) {
      onActiveChange(false);
      setStepIndex(0);
      return;
    }
    const nextStep = tour.steps[nextIndex];
    if (nextStep?.targetSelector && !findTarget(nextStep.targetSelector)) {
      const skipTo = nextIndex + 1 < tour.steps.length ? nextIndex + 1 : 0;
      setStepIndex(skipTo);
      onActiveChange(skipTo < tour.steps.length);
      return;
    }
    setStepIndex(nextIndex);
  };

  if (!step) return null;

  if (step.targetSelector && !target) {
    return (
      <div
        style={{
          position: 'fixed',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: TOUR_PANEL_BOTTOM,
          zIndex: 10000,
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
        <button type="button" onClick={() => onActiveChange(false)}>
          Beenden
        </button>
      </div>
    </div>
  );
}

/** Resolves the primary tour for bar visibility. */
export function usePrimaryTour(tourId?: string) {
  const { tours = [] } = useAutoGuide();
  return useMemo(
    () => tours.find((item) => (tourId ? item.id === tourId : item.status === 'published')),
    [tours, tourId],
  );
}
