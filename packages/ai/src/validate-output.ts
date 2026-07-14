/**
 * @iamthamanic/autoguide-ai — validate and convert AI JSON output to facts.
 */

import type { Fact } from '@iamthamanic/autoguide-core';
import { scoreFromProvenance } from '@iamthamanic/autoguide-core';
import type { AiProposalDraft } from './types.js';
import { AI_PROPOSAL_CONFIDENCE_CAP } from './types.js';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseAiJsonResponse(raw: string): unknown {
  const trimmed = raw.trim();
  const jsonStart = trimmed.indexOf('{');
  const jsonEnd = trimmed.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error('KI-Antwort enthält kein JSON-Objekt.');
  }
  return JSON.parse(trimmed.slice(jsonStart, jsonEnd + 1));
}

export function validateAiProposals(data: unknown): { proposals: AiProposalDraft[]; errors: string[] } {
  const errors: string[] = [];
  if (!isRecord(data) || !Array.isArray(data.proposals)) {
    return { proposals: [], errors: ['KI-Ausgabe: proposals-Array fehlt.'] };
  }

  const proposals: AiProposalDraft[] = [];
  data.proposals.forEach((item, index) => {
    if (!isRecord(item)) {
      errors.push(`proposals[${index}] ist kein Objekt.`);
      return;
    }
    if (typeof item.entityId !== 'string' || typeof item.key !== 'string' || typeof item.value !== 'string') {
      errors.push(`proposals[${index}] benötigt entityId, key und value als String.`);
      return;
    }
    if (/^\/[a-zA-Z0-9/_-]+$/.test(item.value) && item.key === 'description') {
      errors.push(`proposals[${index}] sieht nach halluzinierter Route aus.`);
      return;
    }
    proposals.push({
      entityId: item.entityId,
      key: item.key,
      value: item.value,
      description: typeof item.description === 'string' ? item.description : undefined,
    });
  });

  return { proposals, errors };
}

export function proposalsToFacts(proposals: AiProposalDraft[], knownEntityIds: Set<string>): Fact[] {
  const now = new Date().toISOString();
  const facts: Fact[] = [];

  proposals.forEach((proposal, index) => {
    if (!knownEntityIds.has(proposal.entityId)) return;
    const provenance = [
      {
        source: 'ai_enrichment' as const,
        confidence: AI_PROPOSAL_CONFIDENCE_CAP,
        observedAt: now,
      },
    ];
    const confidence = Math.min(scoreFromProvenance(provenance), AI_PROPOSAL_CONFIDENCE_CAP);
    facts.push({
      id: `ai-fact-${index + 1}`,
      entityId: proposal.entityId,
      key: proposal.key,
      value: proposal.value,
      status: 'ai_proposal',
      reviewStatus: 'pending',
      confidence,
      provenance,
      createdAt: now,
      updatedAt: now,
    });
  });

  return facts;
}

export function mergeAiProposals(
  existing: Fact[],
  proposals: AiProposalDraft[],
): { facts: Fact[]; rejected: string[] } {
  const knownEntityIds = new Set(existing.map((fact) => fact.entityId));
  const { proposals: valid, errors } = validateAiProposals({ proposals });
  const aiFacts = proposalsToFacts(valid, knownEntityIds);
  const protectedIds = new Set(
    existing
      .filter((fact) => fact.status === 'manual_override' || fact.reviewStatus === 'approved')
      .map((fact) => `${fact.entityId}:${fact.key}`),
  );

  const merged = [...existing];
  for (const fact of aiFacts) {
    const compound = `${fact.entityId}:${fact.key}`;
    if (protectedIds.has(compound)) continue;
    merged.push(fact);
  }

  return { facts: merged, rejected: errors };
}
