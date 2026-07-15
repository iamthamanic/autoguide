/**
 * @iamthamanic/autoguide-ai — Ollama local provider (default).
 */

import type { AutoGuideConfig } from '@iamthamanic/autoguide-config';
import type { AiEnrichmentInput, AiProvider, AiProposalDraft } from './types.js';
import { requestStructuredProposals } from './http-client.js';

export class OllamaProvider implements AiProvider {
  readonly id = 'ollama';
  private readonly endpoint: string;
  private readonly model: string;
  private readonly fetchImpl?: typeof fetch;

  constructor(config: AutoGuideConfig, options?: { fetchImpl?: typeof fetch; model?: string }) {
    this.endpoint = config.ai.endpoint ?? 'http://localhost:11434';
    this.model = options?.model ?? 'llama3.2';
    this.fetchImpl = options?.fetchImpl;
  }

  async isAvailable(): Promise<boolean> {
    const fetchFn = this.fetchImpl ?? fetch;
    try {
      const response = await fetchFn(`${this.endpoint.replace(/\/$/, '')}/api/tags`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async proposeDescriptions(inputs: AiEnrichmentInput[]): Promise<AiProposalDraft[]> {
    const fetchFn = this.fetchImpl ?? fetch;
    const url = `${this.endpoint.replace(/\/$/, '')}/api/chat`;
    const { buildEnrichmentPrompt } = await import('./prompt.js');
    const { parseAiJsonResponse, validateAiProposals } = await import('./validate-output.js');

    const response = await fetchFn(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        stream: false,
        messages: [{ role: 'user', content: buildEnrichmentPrompt(inputs) }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama nicht erreichbar (${response.status}).`);
    }

    const payload = (await response.json()) as { message?: { content?: string } };
    const content = payload.message?.content ?? '';
    const parsed = parseAiJsonResponse(content);
    const { proposals, errors } = validateAiProposals(parsed);
    if (errors.length > 0 && proposals.length === 0) {
      throw new Error(errors.join(' '));
    }
    return proposals;
  }
}
