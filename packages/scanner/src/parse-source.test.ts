import { describe, expect, it } from 'vitest';
import { extractElementsFromText, extractRoutesFromText } from './parse-source.js';

describe('@autoguide/scanner', () => {
  it('extracts react-router paths', () => {
    const content = `<Route path="/settings" element={<Settings />} />`;
    const routes = extractRoutesFromText('App.tsx', content);
    expect(routes[0]?.route).toBe('/settings');
  });

  it('extracts data-doc attributes and handlers', () => {
    const content = `<button data-doc-action="save" onClick={handleSave}>Save</button>`;
    const elements = extractElementsFromText('Page.tsx', content);
    expect(elements.some((e) => e.dataDocKey === 'action')).toBe(true);
    expect(elements.some((e) => e.handlerName === 'handleSave')).toBe(true);
  });

  it('detects icon-only buttons without aria-label', () => {
    const content = `<button onClick={handleClick}>✓</button>`;
    const elements = extractElementsFromText('Page.tsx', content);
    expect(elements.some((e) => e.missingAriaLabel)).toBe(true);
  });
});
