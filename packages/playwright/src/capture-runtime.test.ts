/**
 * @vitest-environment jsdom
 */

import { describe, expect, it } from 'vitest';
import { browserScanDom } from './browser-scan-dom.js';
import { mergeRuntimeSnapshots } from './capture-runtime.js';

describe('browserScanDom', () => {
  it('detects interactive elements with accessible names', () => {
    document.body.innerHTML = '<button aria-label="Speichern">Save</button><a href="/x">Link</a>';
    const snapshot = browserScanDom('/app');
    expect(snapshot.route).toBe('/app');
    expect(snapshot.elements.some((el) => el.label === 'Speichern')).toBe(true);
    expect(snapshot.elements.length).toBeGreaterThanOrEqual(2);
  });
});

describe('mergeRuntimeSnapshots', () => {
  it('combines elements from multiple route snapshots', () => {
    const merged = mergeRuntimeSnapshots([
      {
        capturedAt: '2026-01-01T00:00:00.000Z',
        route: '/a',
        elements: [
          {
            id: 'el-1',
            entityId: 'runtime:a',
            tagName: 'button',
            selector: 'button',
            label: 'A',
            interactive: true,
          },
        ],
        forms: [],
        dialogs: [],
        textRegions: [],
        navigation: [],
      },
      {
        capturedAt: '2026-01-01T00:00:00.000Z',
        route: '/b',
        elements: [
          {
            id: 'el-1',
            entityId: 'runtime:b',
            tagName: 'button',
            selector: 'button',
            label: 'B',
            interactive: true,
          },
        ],
        forms: [],
        dialogs: [],
        textRegions: [],
        navigation: [],
      },
    ]);
    expect(merged?.elements).toHaveLength(2);
    expect(merged?.route).toContain('/a');
  });
});
