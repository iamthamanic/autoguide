/**
 * @iamthamanic/autoguide-ai — shared HTTP chat completion helper.
 */

import { buildEnrichmentPrompt } from './prompt.js';
import { parseAiJsonResponse, validateAiProposals } from './validate-output.js';
import type { AiEnrichmentInput, AiProposalDraft } from './types.js';

export interface ChatCompletionOptions {
  endpoint: string;
  model: string;
  headers?: Record<string, string>;
  fetchImpl?: typeof fetch;
}

export async function requestStructuredProposals(
  inputs: AiEnrichmentInput[],
  options: ChatCompletionOptions,
): Promise<AiProposalDraft[]> {
  if (inputs.length === 0) return [];
  const fetchFn = options.fetchImpl ?? fetch;
  const url = options.endpoint.endsWith('/chat/completions')
    ? options.endpoint
    : `${options.endpoint.replace(/\/$/, '')}/v1/chat/completions`;

  const response = await fetchFn(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify({
      model: options.model,
      messages: [{ role: 'user', content: buildEnrichmentPrompt(inputs) }],
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`KI-Anfrage fehlgeschlagen (${response.status}).`);
  }

  const payload = (await response.json()) as {
    message?: { content?: string };
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content =
    payload.message?.content ?? payload.choices?.[0]?.message?.content ?? '';
  const parsed = parseAiJsonResponse(content);
  const { proposals, errors } = validateAiProposals(parsed);
  if (errors.length > 0 && proposals.length === 0) {
    throw new Error(errors.join(' '));
  }
  return proposals;
}
