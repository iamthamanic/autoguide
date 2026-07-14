/**
 * @iamthamanic/autoguide-core — redaction rule types.
 */

export interface RedactionRule {
  id: string;
  pattern: RegExp;
  replacement?: string;
}

export interface RedactionOptions {
  rules?: RedactionRule[];
  enabled?: boolean;
}

export const REDACTED_PLACEHOLDER = '[REDACTED]';
