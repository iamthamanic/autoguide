/**
 * @autoguide/core — default secret and PII redaction patterns.
 */

import type { RedactionRule } from './types.js';
import { REDACTED_PLACEHOLDER } from './types.js';

export const SENSITIVE_KEY_PATTERN =
  /password|secret|token|api[_-]?key|apikey|authorization|cookie|bearer|private[_-]?key|credential/i;

export const DEFAULT_REDACTION_RULES: RedactionRule[] = [
  {
    id: 'api_key',
    pattern: /\b(sk|pk)_(live|test)_[A-Za-z0-9]{16,}\b/g,
  },
  {
    id: 'aws_key',
    pattern: /\bAKIA[0-9A-Z]{16}\b/g,
  },
  {
    id: 'bearer',
    pattern: /\bBearer\s+[A-Za-z0-9._~+/=-]{10,}\b/gi,
  },
  {
    id: 'jwt',
    pattern: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,
  },
  {
    id: 'email',
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  },
  {
    id: 'phone',
    pattern: /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/g,
  },
  {
    id: 'iban',
    pattern: /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g,
  },
  {
    id: 'env_var',
    pattern: /\b([A-Z][A-Z0-9_]{2,})=([^\s"'`,]{4,})/g,
    replacement: `$1=${REDACTED_PLACEHOLDER}`,
  },
  {
    id: 'private_key',
    pattern: /-----BEGIN (?:RSA )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA )?PRIVATE KEY-----/g,
  },
  {
    id: 'auth_header',
    pattern: /\b(authorization|cookie|set-cookie)\s*:\s*[^\n]+/gi,
    replacement: `$1: ${REDACTED_PLACEHOLDER}`,
  },
  {
    id: 'password_value',
    pattern: /\b(password|passwd|pwd)\s*[:=]\s*[^\s,}"']+/gi,
    replacement: `$1=${REDACTED_PLACEHOLDER}`,
  },
];
