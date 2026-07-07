/**
 * @autoguide/ai — provider contracts and proposal types.
 */

export interface AiEnrichmentInput {
  entityId: string;
  key: string;
  value: unknown;
}

export interface AiProposalDraft {
  entityId: string;
  key: string;
  value: string;
  description?: string;
}

export interface AiProvider {
  readonly id: string;
  isAvailable(): Promise<boolean>;
  proposeDescriptions(inputs: AiEnrichmentInput[]): Promise<AiProposalDraft[]>;
}

export const AI_PROPOSAL_CONFIDENCE_CAP = 0.55;
