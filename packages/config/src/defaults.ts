/**
 * @autoguide/config — default configuration values.
 */

import type { AutoGuideConfig } from './types.js';

export const DEFAULT_CONFIG: Omit<AutoGuideConfig, 'appId'> = {
  framework: 'unknown',
  baseUrl: 'http://localhost:5173',
  outputDir: '.autoguide',
  mode: 'development',
  ai: {
    provider: 'ollama',
    endpoint: 'http://localhost:11434',
  },
  scan: {
    safeMode: true,
  },
};
