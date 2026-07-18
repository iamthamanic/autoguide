/**
 * @iamthamanic/autoguide-core — decide which facts are user-useful in Help (not Review).
 */

import {
  isGenericHandlerNoiseFact,
  isHandlerIdentifierNoise,
} from '../naming/generic-handlers.js';

const HELP_KEYS = new Set(['action', 'description', 'label']);

const TECHNICAL_KEYS = new Set([
  'element',
  'handler',
  'component',
  'prop',
  'props',
  'selector',
  'file',
  'filepath',
  'filePath',
  'type',
  'entity',
]);

/** True for Help content keys (label / description / action). */
export function isHelpContentKey(key: string): boolean {
  return HELP_KEYS.has(key);
}

/** Setter-style identifiers (setOpen, setUser) — noise in Help. */
export function isSetterIdentifierNoise(name: string): boolean {
  return /^set[A-Z][A-Za-z0-9]*$/.test(name.trim());
}

/**
 * PascalCase compound like `LoginForm` / `WorkflowBuilder` (not single German words).
 */
export function looksLikeComponentIdentifier(value: string): boolean {
  const trimmed = value.trim();
  if (!/^[A-Z][A-Za-z0-9]*$/.test(trimmed)) return false;
  return /[a-z][A-Z]/.test(trimmed);
}

/** Route-like values (`/workflows/:id`) without spaces. */
export function looksLikeRawRouteValue(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.startsWith('/') && !/\s/.test(trimmed);
}

/**
 * Source-scan identifiers that must never be primary Help “Aktionen”.
 * Broader than review seed: includes set*, element keys, component names, routes.
 */
export function isHelpNoiseFact(fact: {
  key: string;
  value: unknown;
  entityId?: string;
}): boolean {
  if (isGenericHandlerNoiseFact(fact)) return true;
  if (TECHNICAL_KEYS.has(fact.key)) return true;
  if (isHandlerIdentifierNoise(fact.key) || isSetterIdentifierNoise(fact.key)) return true;

  const value = String(fact.value ?? '').trim();
  if (!value) return true;
  if (isHandlerIdentifierNoise(value) || isSetterIdentifierNoise(value)) return true;
  if (looksLikeComponentIdentifier(value)) return true;
  if (looksLikeRawRouteValue(value)) return true;
  return false;
}

/** Fact suitable as a Help action / draft sample for end users. */
export function isUserFacingHelpFact(fact: {
  key: string;
  value: unknown;
  entityId?: string;
}): boolean {
  if (!isHelpContentKey(fact.key)) return false;
  if (isHelpNoiseFact(fact)) return false;
  return String(fact.value ?? '').trim().length > 0;
}

/** End-user label for a Help action (value only — no `key:` prefix). */
export function formatHelpActionText(fact: { value: unknown }): string {
  return String(fact.value ?? '').trim();
}

/** Prefer human page titles over raw route strings in Help search. */
export function isFriendlyHelpPageTitle(title: string, route: string): boolean {
  const t = title.trim();
  if (!t) return false;
  if (looksLikeRawRouteValue(t)) return false;
  const normalizedRoute = route.trim().replace(/\/+$/, '') || '/';
  if (t === route.trim() || t === normalizedRoute) return false;
  if (/\(page\)$/i.test(t)) return false;
  return true;
}
