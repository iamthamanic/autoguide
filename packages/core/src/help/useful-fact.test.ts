/**
 * @iamthamanic/autoguide-core — Help usefulness heuristics (noise vs user-facing).
 */

import { describe, expect, it } from 'vitest';
import {
  formatHelpActionText,
  isFriendlyHelpPageTitle,
  isHelpNoiseFact,
  isUserFacingHelpFact,
  looksLikeComponentIdentifier,
} from './useful-fact.js';
import { resolveHelpContext } from './context-resolver.js';
import { explainHelpGap } from './empty-state.js';
import { searchKnowledge } from './search.js';
import type { Fact } from '../types/fact.js';
import type { FlowRecord, PageRecord } from '../types/records.js';

function fact(partial: Partial<Fact> & Pick<Fact, 'id' | 'key' | 'value'>): Fact {
  const now = '2026-07-18T00:00:00.000Z';
  return {
    entityId: 'e1',
    status: 'needs_review',
    reviewStatus: 'pending',
    confidence: 0.7,
    provenance: [{ source: 'source_code', confidence: 0.7, observedAt: now }],
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

describe('useful-fact heuristics', () => {
  it('flags handler, setter, element, and component noise', () => {
    expect(isHelpNoiseFact({ key: 'action', value: 'onDismiss' })).toBe(true);
    expect(isHelpNoiseFact({ key: 'action', value: 'setOpen' })).toBe(true);
    expect(isHelpNoiseFact({ key: 'element', value: 'LoginForm' })).toBe(true);
    expect(isHelpNoiseFact({ key: 'label', value: 'WorkflowBuilder' })).toBe(true);
    expect(isHelpNoiseFact({ key: 'action', value: '/workflows/builder/:id' })).toBe(true);
    expect(isHelpNoiseFact({ key: 'label', value: 'Speichern' })).toBe(false);
    expect(looksLikeComponentIdentifier('LoginForm')).toBe(true);
    expect(looksLikeComponentIdentifier('Urlaub')).toBe(false);
  });

  it('only treats label/description/action with human values as user-facing', () => {
    expect(isUserFacingHelpFact({ key: 'label', value: 'Antrag stellen' })).toBe(true);
    expect(isUserFacingHelpFact({ key: 'element', value: 'LoginForm' })).toBe(false);
    expect(isUserFacingHelpFact({ key: 'handler', value: 'onSave' })).toBe(false);
    expect(formatHelpActionText({ value: 'Speichern' })).toBe('Speichern');
  });

  it('rejects raw route page titles for Help browse', () => {
    expect(isFriendlyHelpPageTitle('/workflows/builder/:id', '/workflows/builder/:id')).toBe(false);
    expect(isFriendlyHelpPageTitle('Workflow-Builder', '/workflows/builder/:id')).toBe(true);
  });
});

describe('resolveHelpContext user-useful content', () => {
  const page: PageRecord = {
    id: 'p1',
    route: '/login',
    title: 'Anmelden',
    roleIds: [],
    elementIds: [],
    featureIds: [],
    flowIds: [],
    factIds: ['f-noise', 'f-el', 'f-label', 'f-set'],
    status: 'draft',
  };

  it('excludes handler/element/set noise from Help actions', () => {
    const ctx = resolveHelpContext(
      '/login',
      [page],
      [],
      [
        fact({ id: 'f-noise', key: 'action', value: 'onDismiss', reviewStatus: 'approved', confidence: 0.9 }),
        fact({ id: 'f-el', key: 'element', value: 'LoginForm', reviewStatus: 'approved', confidence: 0.9 }),
        fact({ id: 'f-set', key: 'action', value: 'setOpen', reviewStatus: 'approved', confidence: 0.9 }),
        fact({
          id: 'f-label',
          key: 'label',
          value: 'Anmelden',
          reviewStatus: 'approved',
          confidence: 0.9,
          status: 'verified',
        }),
      ],
      'development',
    );
    expect(ctx.actions.map((a) => a.id)).toEqual(['f-label']);
    expect(ctx.actions[0]?.value).toBe('Anmelden');
  });

  it('marks technical-only draft digest when pending facts are all noise', () => {
    const ctx = resolveHelpContext(
      '/login',
      [page],
      [],
      [
        fact({ id: 'f-noise', key: 'action', value: 'onDismiss' }),
        fact({ id: 'f-el', key: 'element', value: 'LoginForm' }),
      ],
      'development',
    );
    expect(ctx.actions).toHaveLength(0);
    expect(ctx.draftDigest?.technicalOnly).toBe(true);
    expect(ctx.draftDigest?.samples).toHaveLength(0);
  });

  it('prefers flows with human titles when present', () => {
    const flow: FlowRecord = {
      id: 'fl1',
      title: 'Login abschließen',
      steps: [{ order: 1, title: 'E-Mail eingeben', factIds: [] }],
      roleIds: [],
      pageIds: ['p1'],
      factIds: [],
      status: 'draft',
    };
    const ctx = resolveHelpContext(
      '/login',
      [page],
      [flow],
      [fact({ id: 'f-noise', key: 'action', value: 'onDismiss', reviewStatus: 'approved', confidence: 0.9 })],
      'development',
    );
    expect(ctx.flows[0]?.title).toBe('Login abschließen');
    expect(ctx.actions).toHaveLength(0);
  });
});

describe('explainHelpGap technical drafts', () => {
  it('shows DE technical-draft message when only noise pending', () => {
    const page: PageRecord = {
      id: 'p1',
      route: '/login',
      title: 'Anmelden',
      roleIds: [],
      elementIds: [],
      featureIds: [],
      flowIds: [],
      factIds: ['f-noise'],
      status: 'draft',
    };
    const reasons = explainHelpGap({
      mode: 'development',
      route: '/login',
      pages: [page],
      flows: [],
      facts: [fact({ id: 'f-noise', key: 'action', value: 'onDismiss' })],
    });
    expect(reasons.some((r) => r.id === 'technical_drafts')).toBe(true);
    expect(reasons.some((r) => /verständliche Hilfe/.test(r.message))).toBe(true);
  });
});

describe('searchKnowledge friendly pages', () => {
  it('hides raw route titles from Help browse', () => {
    const pages: PageRecord[] = [
      {
        id: 'p-raw',
        route: '/workflows/builder/:id',
        title: '/workflows/builder/:id',
        roleIds: [],
        elementIds: [],
        featureIds: [],
        flowIds: [],
        factIds: [],
        status: 'draft',
      },
      {
        id: 'p-friendly',
        route: '/vacation',
        title: 'Urlaub',
        roleIds: [],
        elementIds: [],
        featureIds: [],
        flowIds: [],
        factIds: [],
        status: 'draft',
      },
    ];
    const hits = searchKnowledge('', pages, []);
    expect(hits.some((h) => h.id === 'p-raw')).toBe(false);
    expect(hits.some((h) => h.id === 'p-friendly')).toBe(true);
    expect(hits.find((h) => h.id === 'p-friendly')?.kindLabel).toBe('Seite');
  });
});
