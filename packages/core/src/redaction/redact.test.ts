import { describe, expect, it } from 'vitest';
import { redactString, redactUnknown } from './redact.js';

describe('redaction', () => {
  it('redacts API keys, bearer tokens, and JWTs', () => {
    const input =
      'sk_live_1234567890abcdefghij token Bearer abc.def.ghi eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature';
    const output = redactString(input);
    expect(output).not.toContain('sk_live_');
    expect(output).not.toContain('Bearer abc');
    expect(output).not.toContain('eyJhbGci');
    expect(output).toContain('[REDACTED]');
  });

  it('redacts emails, phones, and IBAN-like strings', () => {
    const input = 'Kontakt max@example.com +49 30 12345678 DE89370400440532013000';
    const output = redactString(input);
    expect(output).not.toContain('max@example.com');
    expect(output).not.toContain('DE89370400440532013000');
  });

  it('redacts sensitive object keys deeply', () => {
    const output = redactUnknown({
      label: 'Save',
      password: 'hunter2',
      nested: { apiKey: 'sk_live_secretvalue1234567890ab' },
      note: 'Authorization: Bearer secret-token-value',
    }) as Record<string, unknown>;
    expect(output.password).toBe('[REDACTED]');
    expect(output.nested).toEqual({ apiKey: '[REDACTED]' });
    expect(String(output.note)).not.toContain('secret-token');
  });

  it('preserves semantic doc context for benign labels', () => {
    const output = redactUnknown({
      entityId: 'btn-save',
      key: 'label',
      value: 'Aktion speichern',
    }) as Record<string, unknown>;
    expect(output.value).toBe('Aktion speichern');
  });
});
