/**
 * @iamthamanic/autoguide-ai — OpenAI-compatible cloud provider (opt-in).
 */

import type { AutoGuideConfig } from '@iamthamanic/autoguide-config';
import { resolveAiApiKey } from '@iamthamanic/autoguide-config';
import type { AiEnrichmentInput, AiProvider, AiProposalDraft } from './types.js';
import { CLOUD_CONSENT_MESSAGE, hasCloudConsent } from './consent.js';
import { requestStructuredProposals } from './http-client.js';

export class OpenAiCompatibleProvider implements AiProvider {
  readonly id = 'openai-compatible';
  private readonly config: AutoGuideConfig;
  private readonly fetchImpl?: typeof fetch;
  private readonly model: string;
  private readonly outputDir: string;

  constructor(
    config: AutoGuideConfig,
    options?: { fetchImpl?: typeof fetch; model?: string; outputDir?: string },
  ) {
    this.config = config;
    this.fetchImpl = options?.fetchImpl;
    this.model = options?.model ?? 'gpt-4o-mini';
    this.outputDir = options?.outputDir ?? config.outputDir;
  }

  async isAvailable(): Promise<boolean> {
    const apiKey = resolveAiApiKey(this.config);
    if (!apiKey) return false;
    if (!(await hasCloudConsent(this.outputDir))) return false;
    return Boolean(this.config.ai.endpoint);
  }

  async proposeDescriptions(inputs: AiEnrichmentInput[]): Promise<AiProposalDraft[]> {
    const apiKey = resolveAiApiKey(this.config);
    if (!apiKey) {
      throw new Error('Cloud-KI: API-Key fehlt (AUTOGuide_AI_API_KEY oder config.ai.apiKey).');
    }
    if (!(await hasCloudConsent(this.outputDir))) {
      throw new Error(CLOUD_CONSENT_MESSAGE);
    }
    const endpoint = this.config.ai.endpoint;
    if (!endpoint) {
      throw new Error('Cloud-KI: Endpoint-URL fehlt (config.ai.endpoint).');
    }

    return requestStructuredProposals(inputs, {
      endpoint,
      model: this.model,
      headers: { authorization: `Bearer ${apiKey}` },
      fetchImpl: this.fetchImpl,
    });
  }
}
