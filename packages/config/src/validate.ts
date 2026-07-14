/**
 * @iamthamanic/autoguide-config — configuration validation with German error messages.
 */

import type { AutoGuideConfig } from './types.js';

export class ConfigValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

export function validateConfig(config: AutoGuideConfig): void {
  if (!config.appId?.trim()) {
    throw new ConfigValidationError('appId ist erforderlich.');
  }
  if (!config.baseUrl?.trim()) {
    throw new ConfigValidationError('baseUrl ist erforderlich.');
  }
  if (!config.outputDir?.trim()) {
    throw new ConfigValidationError('outputDir ist erforderlich.');
  }
  if (config.mode !== 'development' && config.mode !== 'published') {
    throw new ConfigValidationError('mode muss development oder published sein.');
  }
  if (config.ai.provider === 'openai-compatible') {
    if (!config.ai.endpoint?.trim()) {
      throw new ConfigValidationError('Cloud-AI erfordert endpoint (URL).');
    }
    if (!config.ai.apiKey?.trim() && !process.env.AUTOGuide_AI_API_KEY?.trim()) {
      throw new ConfigValidationError('Cloud-AI erfordert apiKey in Config oder AUTOGuide_AI_API_KEY.');
    }
  }
}
