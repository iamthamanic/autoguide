/**
 * @iamthamanic/autoguide-react — dock bottom offset helpers tests.
 */

import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { AG_BAR_BOTTOM, agDockShellStyle, resolveDockBottom } from './bar-styles.js';
import { AutoGuideBar } from './AutoGuideBar.js';
import { AutoGuideProvider } from './AutoGuideProvider.js';

describe('resolveDockBottom', () => {
  it('defaults to AG_BAR_BOTTOM', () => {
    expect(resolveDockBottom()).toBe(AG_BAR_BOTTOM);
    expect(resolveDockBottom(0)).toBe(AG_BAR_BOTTOM);
  });

  it('adds a non-negative offset for host bottom navigation', () => {
    expect(resolveDockBottom(64)).toBe(AG_BAR_BOTTOM + 64);
    expect(resolveDockBottom(-10)).toBe(AG_BAR_BOTTOM);
    expect(agDockShellStyle(48).bottom).toBe(AG_BAR_BOTTOM + 48);
  });
});

describe('dockBottomOffset prop', () => {
  it('applies offset to the dock shell style', () => {
    render(
      <AutoGuideProvider appId="demo" mode="development" dockBottomOffset={72}>
        <AutoGuideBar features={{ widget: true }} />
      </AutoGuideProvider>,
    );
    const dock = screen.getByLabelText('AutoGuide');
    expect(dock.style.bottom).toBe(`${AG_BAR_BOTTOM + 72}px`);
  });

  it('keeps default bottom when offset is omitted', () => {
    render(
      <AutoGuideProvider appId="demo" mode="development">
        <AutoGuideBar features={{ widget: true }} />
      </AutoGuideProvider>,
    );
    expect(screen.getByLabelText('AutoGuide').style.bottom).toBe(`${AG_BAR_BOTTOM}px`);
    fireEvent.click(screen.getByLabelText('Hilfe öffnen'));
    expect(screen.getByRole('dialog', { name: 'AutoGuide Hilfe' })).toBeTruthy();
  });
});
