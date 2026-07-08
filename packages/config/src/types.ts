/**
 * @autoguide/config — configuration types.
 */

import type { VisibilityMode } from '@autoguide/core';

export type AiProviderKind = 'ollama' | 'openai-compatible' | 'none';

export interface AiConfig {
  provider: AiProviderKind;
  endpoint?: string;
  apiKey?: string;
}

export interface ScanConfig {
  safeMode: boolean;
  playwrightImportPath?: string;
}

export interface RedactionConfig {
  enabled?: boolean;
  extraPatterns?: string[];
}

export interface AutoGuideConfig {
  appId: string;
  framework: 'react' | 'vue' | 'angular' | 'svelte' | 'tauri' | 'flutter' | 'unknown';
  baseUrl: string;
  outputDir: string;
  mode: VisibilityMode;
  ai: AiConfig;
  scan: ScanConfig;
  redaction?: RedactionConfig;
  plugins?: string[];
}

export type AutoGuideConfigInput = Partial<AutoGuideConfig> & Pick<AutoGuideConfig, 'appId'>;
