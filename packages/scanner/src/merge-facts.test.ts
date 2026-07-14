import { describe, expect, it } from 'vitest';
import type { RuntimeSnapshot } from '@iamthamanic/autoguide-runtime';
import { mergeScanResults, runtimeSnapshotToFacts } from './merge-facts.js';
import type { SourceScanResult } from './types.js';

const emptySource: SourceScanResult = {
  routes: [{ route: '/dashboard', filePath: 'src/App.tsx' }],
  elements: [],
};

describe('mergeScanResults runtime', () => {
  it('adds runtime_dom provenance when snapshot is provided', () => {
    const snapshot: RuntimeSnapshot = {
      capturedAt: '2026-01-01T00:00:00.000Z',
      route: '/dashboard',
      elements: [
        {
          id: 'el-1',
          entityId: 'runtime:button',
          tagName: 'button',
          selector: 'button',
          label: 'Speichern',
          interactive: true,
          route: '/dashboard',
        },
      ],
      forms: [],
      dialogs: [],
      textRegions: [],
      navigation: [],
    };

    const merged = mergeScanResults(emptySource, snapshot);
    expect(merged.facts.some((fact) => fact.provenance.some((p) => p.source === 'runtime_dom'))).toBe(
      true,
    );
    expect(merged.facts.find((fact) => fact.value === 'Speichern')).toBeTruthy();
  });

  it('runtimeSnapshotToFacts maps labels to fact values', () => {
    const facts = runtimeSnapshotToFacts({
      capturedAt: '2026-01-01T00:00:00.000Z',
      route: '/',
      elements: [
        {
          id: 'el-1',
          entityId: 'runtime:#save',
          tagName: 'button',
          selector: '#save',
          label: 'Exportieren',
          interactive: true,
        },
      ],
      forms: [],
      dialogs: [],
      textRegions: [],
      navigation: [],
    });
    expect(facts[0]?.provenance[0]?.source).toBe('runtime_dom');
    expect(facts[0]?.value).toBe('Exportieren');
  });
});
