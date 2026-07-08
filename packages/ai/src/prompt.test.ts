import { describe, expect, it } from 'vitest';
import { buildEnrichmentPrompt } from './prompt.js';

describe('AI prompt redaction', () => {
  it('redacts secrets from enrichment evidence payload', () => {
    const prompt = buildEnrichmentPrompt([
      {
        entityId: 'btn-login',
        key: 'note',
        value: 'user@corp.example password=secret123 Bearer tokentokentoken',
      },
    ]);
    expect(prompt).not.toContain('user@corp.example');
    expect(prompt).not.toContain('secret123');
    expect(prompt).not.toContain('Bearer tokentokentoken');
    expect(prompt).toContain('[REDACTED]');
  });
});
