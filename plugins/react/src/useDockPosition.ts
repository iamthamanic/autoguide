/**
 * @iamthamanic/autoguide-react — drag + persist dock position (viewport-clamped).
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  clearDockPosition,
  clampDockPosition,
  readDockPosition,
  writeDockPosition,
  type DockPosition,
} from './dock-position.js';

const NUDGE_PX = 8;

function getViewportSize(): { width: number; height: number } {
  if (typeof window === 'undefined') return { width: 1024, height: 768 };
  return { width: window.innerWidth, height: window.innerHeight };
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export interface UseDockPositionResult {
  position: DockPosition | null;
  isCustom: boolean;
  dockRef: MutableRefObject<HTMLElement | null>;
  handleProps: {
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
    onDoubleClick: () => void;
    onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => void;
    role: 'button';
    tabIndex: 0;
    'aria-label': string;
    title: string;
  };
  reset: () => void;
  dragging: boolean;
}

export function useDockPosition(appId: string): UseDockPositionResult {
  const dockRef = useRef<HTMLElement | null>(null);
  const [position, setPosition] = useState<DockPosition | null>(() =>
    readDockPosition(getStorage(), appId),
  );
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originLeft: number;
    originTop: number;
  } | null>(null);

  const measureAndClamp = useCallback((next: DockPosition): DockPosition => {
    const el = dockRef.current;
    const { width: vw, height: vh } = getViewportSize();
    const width = el?.offsetWidth ?? 120;
    const height = el?.offsetHeight ?? 52;
    return clampDockPosition(next.left, next.top, width, height, vw, vh);
  }, []);

  // Re-clamp on resize / when appId changes (reload storage)
  useEffect(() => {
    const stored = readDockPosition(getStorage(), appId);
    setPosition(stored ? measureAndClamp(stored) : null);
  }, [appId, measureAndClamp]);

  useEffect(() => {
    if (!position) return;
    const onResize = () => {
      setPosition((prev) => (prev ? measureAndClamp(prev) : null));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [position, measureAndClamp]);

  const persist = useCallback(
    (next: DockPosition | null) => {
      const storage = getStorage();
      if (next) {
        writeDockPosition(storage, appId, next);
      } else {
        clearDockPosition(storage, appId);
      }
      setPosition(next);
    },
    [appId],
  );

  const reset = useCallback(() => {
    persist(null);
  }, [persist]);

  const beginFromDefaultRect = useCallback((): DockPosition => {
    const el = dockRef.current;
    if (!el) return { left: 0, top: 0 };
    const rect = el.getBoundingClientRect();
    return measureAndClamp({ left: rect.left, top: rect.top });
  }, [measureAndClamp]);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.button !== 0 && event.pointerType === 'mouse') return;
      event.preventDefault();
      const origin = position ?? beginFromDefaultRect();
      if (!position) {
        // Switch to absolute coords before first move so layout doesn't jump
        setPosition(origin);
      }
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originLeft: origin.left,
        originTop: origin.top,
      };
      setDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);

      const target = event.currentTarget;
      const onMove = (moveEvent: PointerEvent) => {
        const drag = dragRef.current;
        if (!drag || moveEvent.pointerId !== drag.pointerId) return;
        const next = measureAndClamp({
          left: drag.originLeft + (moveEvent.clientX - drag.startX),
          top: drag.originTop + (moveEvent.clientY - drag.startY),
        });
        setPosition(next);
      };
      const onUp = (upEvent: PointerEvent) => {
        const drag = dragRef.current;
        if (!drag || upEvent.pointerId !== drag.pointerId) return;
        dragRef.current = null;
        setDragging(false);
        target.releasePointerCapture(upEvent.pointerId);
        target.removeEventListener('pointermove', onMove);
        target.removeEventListener('pointerup', onUp);
        target.removeEventListener('pointercancel', onUp);
        setPosition((prev) => {
          if (!prev) return prev;
          writeDockPosition(getStorage(), appId, prev);
          return prev;
        });
      };
      target.addEventListener('pointermove', onMove);
      target.addEventListener('pointerup', onUp);
      target.addEventListener('pointercancel', onUp);
    },
    [appId, beginFromDefaultRect, measureAndClamp, position],
  );

  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>) => {
      const keys: Record<string, { dx: number; dy: number }> = {
        ArrowLeft: { dx: -NUDGE_PX, dy: 0 },
        ArrowRight: { dx: NUDGE_PX, dy: 0 },
        ArrowUp: { dx: 0, dy: -NUDGE_PX },
        ArrowDown: { dx: 0, dy: NUDGE_PX },
      };
      const delta = keys[event.key];
      if (!delta) return;
      event.preventDefault();
      const origin = position ?? beginFromDefaultRect();
      const next = measureAndClamp({
        left: origin.left + delta.dx,
        top: origin.top + delta.dy,
      });
      persist(next);
    },
    [beginFromDefaultRect, measureAndClamp, persist, position],
  );

  return {
    position,
    isCustom: position !== null,
    dockRef,
    handleProps: {
      onPointerDown,
      onDoubleClick: reset,
      onKeyDown,
      role: 'button',
      tabIndex: 0,
      'aria-label':
        'Dock verschieben. Pfeiltasten zum Feinjustieren. Doppelklick setzt die Position zurück.',
      title: 'Ziehen zum Verschieben · Doppelklick: Standardposition',
    },
    reset,
    dragging,
  };
}

/** Merge custom dock coords into shell style (caller supplies base from agDockShellStyle). */
export function applyCustomDockPosition(
  base: CSSProperties,
  position: DockPosition | null,
): CSSProperties {
  if (!position) return base;
  return {
    ...base,
    left: position.left,
    top: position.top,
    right: 'auto',
    bottom: 'auto',
    transform: 'none',
  };
}
