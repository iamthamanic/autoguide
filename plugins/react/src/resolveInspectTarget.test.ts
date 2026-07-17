/**
 * @iamthamanic/autoguide-react — resolveInspectTarget unit tests.
 */

import { describe, expect, it } from 'vitest';
import { resolveInspectTarget } from './resolveInspectTarget.js';

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
});
