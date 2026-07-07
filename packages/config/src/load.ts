/**
 * @autoguide/config — load config from project file or object.
 */

import { defineAutoGuideConfig } from './define.js';
import type { AutoGuideConfig, AutoGuideConfigInput } from './types.js';

export function loadConfigFromObject(input: AutoGuideConfigInput): AutoGuideConfig {
  return defineAutoGuideConfig(input);
}

/** Resolve API key from config or environment without persisting secrets to disk. */
export function resolveAiApiKey(config: AutoGuideConfig): string | undefined {
  return config.ai.apiKey ?? process.env.AUTOGuide_AI_API_KEY;
}
