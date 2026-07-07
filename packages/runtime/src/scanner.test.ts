import { describe, expect, it } from 'vitest';
import { scanDom } from './scanner.js';

describe('@autoguide/runtime', () => {
  it('detects interactive elements with accessible names', () => {
    document.body.innerHTML = `
      <button data-testid="save">Speichern</button>
      <a href="/settings">Einstellungen</a>
    `;
    const snapshot = scanDom(document, '/');
    expect(snapshot.elements.length).toBeGreaterThanOrEqual(2);
    expect(snapshot.elements[0]?.label).toBe('Speichern');
  });
});
