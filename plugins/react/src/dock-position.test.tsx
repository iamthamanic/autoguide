/**
 * @iamthamanic/autoguide-react — dock position clamp + storage tests.
 */

import { afterEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { AG_BAR_BOTTOM } from './bar-styles.js';
import { AutoGuideBar } from './AutoGuideBar.js';
import { AutoGuideProvider } from './AutoGuideProvider.js';
import {
  clampDockPosition,
  clearDockPosition,
  dockPositionStorageKey,
  parseDockPosition,
  readDockPosition,
  writeDockPosition,
} from './dock-position.js';
import { applyCustomDockPosition } from './useDockPosition.js';

describe('clampDockPosition', () => {
  it('keeps position inside the viewport', () => {
    expect(clampDockPosition(10, 20, 100, 50, 400, 300)).toEqual({ left: 10, top: 20 });
  });

  it('clamps negative and overflow edges', () => {
    expect(clampDockPosition(-40, -10, 80, 40, 200, 100)).toEqual({ left: 0, top: 0 });
    expect(clampDockPosition(500, 400, 80, 40, 200, 100)).toEqual({ left: 120, top: 60 });
  });

  it('handles dock larger than viewport', () => {
    expect(clampDockPosition(50, 50, 500, 400, 200, 100)).toEqual({ left: 0, top: 0 });
  });
});

describe('dock position storage', () => {
  const appId = 'demo-dock';

  afterEach(() => {
    clearDockPosition(localStorage, appId);
  });

  it('uses an appId-scoped key', () => {
    expect(dockPositionStorageKey('my-app')).toBe('autoguide:dock-position:my-app');
  });

  it('round-trips a valid position', () => {
    writeDockPosition(localStorage, appId, { left: 42, top: 88 });
    expect(readDockPosition(localStorage, appId)).toEqual({ left: 42, top: 88 });
  });

  it('ignores corrupt storage values', () => {
    expect(parseDockPosition('not-json')).toBeNull();
    expect(parseDockPosition('{"left":"x","top":1}')).toBeNull();
    expect(parseDockPosition('{"foo":1}')).toBeNull();
    localStorage.setItem(dockPositionStorageKey(appId), '{broken');
    expect(readDockPosition(localStorage, appId)).toBeNull();
  });

  it('clears stored position', () => {
    writeDockPosition(localStorage, appId, { left: 1, top: 2 });
    clearDockPosition(localStorage, appId);
    expect(readDockPosition(localStorage, appId)).toBeNull();
  });
});

describe('applyCustomDockPosition', () => {
  it('leaves default shell style when position is null', () => {
    const base = { position: 'fixed' as const, bottom: 14, left: '50%', transform: 'translateX(-50%)' };
    expect(applyCustomDockPosition(base, null)).toEqual(base);
  });

  it('switches to absolute left/top when custom', () => {
    const base = { position: 'fixed' as const, bottom: 14, left: '50%', transform: 'translateX(-50%)' };
    expect(applyCustomDockPosition(base, { left: 30, top: 40 })).toMatchObject({
      left: 30,
      top: 40,
      bottom: 'auto',
      transform: 'none',
    });
  });
});

describe('AutoGuideBar dock position', () => {
  const appId = 'demo-dock-bar';

  afterEach(() => {
    clearDockPosition(localStorage, appId);
  });

  it('uses dockBottomOffset default when nothing is stored', () => {
    render(
      <AutoGuideProvider appId={appId} mode="development" dockBottomOffset={72}>
        <AutoGuideBar features={{ widget: true }} />
      </AutoGuideProvider>,
    );
    const dock = screen.getByLabelText('AutoGuide');
    expect(dock.style.bottom).toBe(`${AG_BAR_BOTTOM + 72}px`);
    expect(dock.style.top).toBe('');
  });

  it('restores a saved custom position on mount', () => {
    writeDockPosition(localStorage, appId, { left: 64, top: 120 });
    render(
      <AutoGuideProvider appId={appId} mode="development" dockBottomOffset={72}>
        <AutoGuideBar features={{ widget: true }} />
      </AutoGuideProvider>,
    );
    const dock = screen.getByLabelText('AutoGuide');
    expect(dock.style.left).toBe('64px');
    expect(dock.style.top).toBe('120px');
    expect(dock.style.bottom).toBe('auto');
  });

  it('resets to default on drag-handle double-click', () => {
    writeDockPosition(localStorage, appId, { left: 64, top: 120 });
    render(
      <AutoGuideProvider appId={appId} mode="development">
        <AutoGuideBar features={{ widget: true }} />
      </AutoGuideProvider>,
    );
    const handle = screen.getByRole('button', {
      name: /Dock verschieben/,
    });
    fireEvent.doubleClick(handle);
    const dock = screen.getByLabelText('AutoGuide');
    expect(dock.style.bottom).toBe(`${AG_BAR_BOTTOM}px`);
    expect(readDockPosition(localStorage, appId)).toBeNull();
  });

  it('keeps Hilfe usable while a drag handle is present', () => {
    render(
      <AutoGuideProvider appId={appId} mode="development">
        <AutoGuideBar features={{ widget: true }} />
      </AutoGuideProvider>,
    );
    fireEvent.click(screen.getByLabelText('Hilfe öffnen'));
    expect(screen.getByRole('dialog', { name: 'AutoGuide Hilfe' })).toBeTruthy();
  });
});
