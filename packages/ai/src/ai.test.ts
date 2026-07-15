import { describe, expect, it } from 'vitest';
import {
  mergeAiProposals,
  proposalsToFacts,
  validateAiProposals,
} from './validate-output.js';
import { hasCloudConsentFromEnv, CLOUD_CONSENT_MESSAGE } from './consent.js';
import type { Fact } from '@iamthamanic/autoguide-core';

const baseFact: Fact = {
  id: 'f1',
  entityId: 'btn-approve',
  key: 'action',
  value: 'Genehmigen',
  status: 'verified',
  reviewStatus: 'approved',
  confidence: 0.95,
  provenance: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('@iamthamanic/autoguide-ai', () => {
  it('rejects invalid AI JSON shape', () => {
    const result = validateAiProposals({ proposals: [{ entityId: 1 }] });
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('marks proposals as ai_proposal with capped confidence', () => {
    const facts = proposalsToFacts(
      [{ entityId: 'btn-save', key: 'description', value: 'Speichert den Datensatz.' }],
      new Set(['btn-save']),
    );
    expect(facts[0]?.status).toBe('ai_proposal');
    expect(facts[0]?.confidence).toBeLessThanOrEqual(0.55);
  });

  it('does not overwrite approved facts', () => {
    const merged = mergeAiProposals([baseFact], [
      { entityId: 'btn-approve', key: 'action', value: 'Hack' },
    ]);
    expect(merged.facts).toHaveLength(1);
    expect(merged.facts[0]?.value).toBe('Genehmigen');
  });

  it('exposes cloud consent env gate', () => {
    const previous = process.env.AUTOGuide_AI_CONSENT;
    process.env.AUTOGuide_AI_CONSENT = '1';
    expect(hasCloudConsentFromEnv()).toBe(true);
    process.env.AUTOGuide_AI_CONSENT = previous;
    expect(CLOUD_CONSENT_MESSAGE).toContain('Cloud-KI');
  });
});
