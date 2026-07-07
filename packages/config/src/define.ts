/**
 * @autoguide/config — defineAutoGuideConfig helper for autoguide.config.ts files.
 */

import { DEFAULT_CONFIG } from './defaults.js';
import { validateConfig } from './validate.js';
import type { AutoGuideConfig, AutoGuideConfigInput } from './types.js';

export function defineAutoGuideConfig(input: AutoGuideConfigInput): AutoGuideConfig {
  const merged: AutoGuideConfig = {
    ...DEFAULT_CONFIG,
    ...input,
    ai: { ...DEFAULT_CONFIG.ai, ...input.ai },
    scan: { ...DEFAULT_CONFIG.scan, ...input.scan },
  };
  validateConfig(merged);
  return merged;
}
