/**
 * @iamthamanic/autoguide-ai — provider factory from AutoGuide config.
 */

import type { AutoGuideConfig } from '@iamthamanic/autoguide-config';
import type { AiProvider } from './types.js';
import { OllamaProvider } from './ollama.js';
import { OpenAiCompatibleProvider } from './openai-compatible.js';

export interface CreateAiProviderOptions {
  outputDir: string;
  fetchImpl?: typeof fetch;
}

export function createAiProvider(
  config: AutoGuideConfig,
  options: CreateAiProviderOptions,
): AiProvider | null {
  if (config.ai.provider === 'none') return null;
  if (config.ai.provider === 'openai-compatible') {
    return new OpenAiCompatibleProvider(config, {
      fetchImpl: options.fetchImpl,
      outputDir: options.outputDir,
    });
  }
  return new OllamaProvider(config, { fetchImpl: options.fetchImpl });
}
