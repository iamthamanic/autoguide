import { describe, expect, it } from 'vitest';
import { defineAutoGuideConfig, ConfigValidationError } from './index.js';

describe('@iamthamanic/autoguide-config', () => {
  it('applies defaults and validates', () => {
    const config = defineAutoGuideConfig({ appId: 'hrthis' });
    expect(config.mode).toBe('development');
    expect(config.ai.provider).toBe('ollama');
    expect(config.outputDir).toBe('.autoguide');
  });

  it('requires cloud endpoint and key', () => {
    expect(() =>
      defineAutoGuideConfig({
        appId: 'x',
        ai: { provider: 'openai-compatible' },
      }),
    ).toThrow(ConfigValidationError);
  });
});
