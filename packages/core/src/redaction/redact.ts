/**
 * @autoguide/core — central redaction for artifacts, exports, and AI payloads.
 */

import { DEFAULT_REDACTION_RULES, SENSITIVE_KEY_PATTERN } from './patterns.js';
import type { RedactionOptions, RedactionRule } from './types.js';
import { REDACTED_PLACEHOLDER } from './types.js';

let extraRules: RedactionRule[] = [];

export function configureRedaction(input: { extraPatterns?: string[] }): void {
  extraRules = (input.extraPatterns ?? []).map((pattern, index) => ({
    id: `custom-${index}`,
    pattern: new RegExp(pattern, 'g'),
  }));
}

export function resolveRedactionRules(options?: RedactionOptions): RedactionRule[] {
  return [...(options?.rules ?? DEFAULT_REDACTION_RULES), ...extraRules];
}

export function redactString(input: string, options?: RedactionOptions): string {
  if (options?.enabled === false) return input;
  let output = input;
  for (const rule of resolveRedactionRules(options)) {
    output = output.replace(rule.pattern, rule.replacement ?? REDACTED_PLACEHOLDER);
  }
  return output;
}

export function redactUnknown(value: unknown, options?: RedactionOptions): unknown {
  if (options?.enabled === false) return value;
  if (typeof value === 'string') return redactString(value, options);
  if (Array.isArray(value)) {
    return value.map((item) => redactUnknown(item, options));
  }
  if (value && typeof value === 'object') {
    const output: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      if (SENSITIVE_KEY_PATTERN.test(key)) {
        output[key] = REDACTED_PLACEHOLDER;
        continue;
      }
      output[key] = redactUnknown(nested, options);
    }
    return output;
  }
  return value;
}
