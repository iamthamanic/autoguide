import { describe, expect, it } from 'vitest';
import type { Fact } from '../types/fact.js';
import { markAffectedFactsStale, mergeRescanFacts } from './apply-stale.js';
import { detectChanges } from './detect-changes.js';
import { appendHistoryEntry, createEmptyHistoryLog, createHistoryEntry } from './history-log.js';
import { buildScanSnapshot } from './snapshot.js';

const previousSnapshot = buildScanSnapshot({
  routes: [{ route: '/dashboard', filePath: 'src/App.tsx' }],
  elements: [{ filePath: 'src/App.tsx', componentName: 'DashboardPage' }],
});

const currentSnapshot = buildScanSnapshot({
  routes: [{ route: '/dashboard', filePath: 'src/App.tsx' }],
  elements: [{ filePath: 'src/App.tsx', componentName: 'DashboardPage' }],
});

describe('version history', () => {
  it('detects changed routes from git diff files', () => {
    const detection = detectChanges(previousSnapshot, currentSnapshot, ['src/App.tsx']);
    expect(detection.changedRoutes).toContain('/dashboard');
    expect(detection.changedComponents).toContain('DashboardPage');
  });

  it('flags backend-only changes as uncertain', () => {
    const detection = detectChanges(previousSnapshot, currentSnapshot, ['server/api.ts']);
    expect(detection.uncertain).toBe(true);
    expect(detection.changedRoutes).toHaveLength(0);
  });

  it('marks approved facts stale and logs history', () => {
    const facts: Fact[] = [
      {
        id: 'f1',
        entityId: 'DashboardPage',
        key: 'action',
        value: 'Speichern',
        status: 'verified',
        reviewStatus: 'approved',
        confidence: 0.95,
        provenance: [{ source: 'source_code', filePath: 'src/App.tsx', confidence: 0.9, observedAt: '' }],
        createdAt: '',
        updatedAt: '',
      },
    ];
    const detection = detectChanges(previousSnapshot, currentSnapshot, ['src/App.tsx']);
    const { facts: staleFacts, staleFactIds } = markAffectedFactsStale(facts, detection, 'abc123');
    expect(staleFactIds).toEqual(['f1']);
    expect(staleFacts[0]?.status).toBe('stale');
    expect(staleFacts[0]?.reviewStatus).toBe('pending');

    const entry = createHistoryEntry(detection, staleFactIds, 'abc123');
    const log = appendHistoryEntry(createEmptyHistoryLog(), entry);
    expect(log.entries).toHaveLength(1);
    expect(log.entries[0]?.staleFactIds).toEqual(['f1']);
  });

  it('preserves approved facts as stale on rescan merge', () => {
    const previous: Fact[] = [
      {
        id: 'f1',
        entityId: 'DashboardPage',
        key: 'action',
        value: 'Speichern',
        status: 'verified',
        reviewStatus: 'approved',
        confidence: 0.95,
        provenance: [{ source: 'source_code', filePath: 'src/App.tsx', confidence: 0.9, observedAt: '' }],
        createdAt: '',
        updatedAt: '',
      },
    ];
    const next: Fact[] = [
      {
        id: 'f2',
        entityId: 'DashboardPage',
        key: 'action',
        value: 'Speichern neu',
        status: 'needs_review',
        reviewStatus: 'pending',
        confidence: 0.7,
        provenance: [{ source: 'source_code', filePath: 'src/App.tsx', confidence: 0.7, observedAt: '' }],
        createdAt: '',
        updatedAt: '',
      },
    ];
    const detection = detectChanges(previousSnapshot, currentSnapshot, ['src/App.tsx']);
    const merged = mergeRescanFacts(previous, next, detection, 'abc123');
    expect(merged.staleFactIds).toEqual(['f1']);
    expect(merged.facts[0]?.status).toBe('stale');
    expect(merged.facts[0]?.value).toBe('Speichern');
  });
});
