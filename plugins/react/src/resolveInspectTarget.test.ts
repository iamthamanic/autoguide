/**
 * @iamthamanic/autoguide-react — resolveInspectTarget unit tests.
 */

import { describe, expect, it } from 'vitest';
import { fallbackInspectElement, resolveInspectTarget } from './resolveInspectTarget.js';

describe('resolveInspectTarget', () => {
  it('skips overlay chrome and returns the underlying host element', () => {
    const overlay = document.createElement('div');
    overlay.setAttribute('data-ag-inspect-overlay', '');
    const overlayChild = document.createElement('span');
    overlay.appendChild(overlayChild);

    const host = document.createElement('button');
    host.textContent = 'Speichern';

    const hit = resolveInspectTarget([overlay, overlayChild, host], overlay);
    expect(hit).toBe(host);
  });

  it('skips AutoGuide dock chrome in the hit stack', () => {
    const overlay = document.createElement('div');
    overlay.setAttribute('data-ag-inspect-overlay', '');
    const dock = document.createElement('div');
    dock.className = 'ag-dock';
    const dockBtn = document.createElement('button');
    dock.appendChild(dockBtn);
    const host = document.createElement('button');
    host.textContent = 'Host';

    expect(resolveInspectTarget([overlay, dock, dockBtn, host], overlay)).toBe(host);
  });

  it('returns null when only overlay elements are in the hit stack', () => {
    const overlay = document.createElement('div');
    const overlayChild = document.createElement('span');
    overlay.appendChild(overlayChild);

    expect(resolveInspectTarget([overlay, overlayChild], overlay)).toBeNull();
  });

  it('returns null for an empty hit stack', () => {
    const overlay = document.createElement('div');
    expect(resolveInspectTarget([], overlay)).toBeNull();
  });

  it('builds a fallback RuntimeElement for undocumented hosts', () => {
    const host = document.createElement('button');
    host.setAttribute('aria-label', 'Speichern');
    const el = fallbackInspectElement(host, '/dashboard');
    expect(el.label).toBe('Speichern');
    expect(el.tagName).toBe('button');
    expect(el.route).toBe('/dashboard');
    expect(el.interactive).toBe(true);
  });
});
