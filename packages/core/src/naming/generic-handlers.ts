/**
 * @iamthamanic/autoguide-core — detect generic event-handler names that flood review.
 */

const GENERIC_HANDLERS = new Set([
  'handleclick',
  'handlechange',
  'handlesubmit',
  'onclick',
  'onsubmit',
  'onchange',
  'oninput',
  'onblur',
  'onfocus',
]);

/** True for boilerplate React/DOM handler names (handleSubmit, onClick, …). */
export function isGenericHandlerName(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  return GENERIC_HANDLERS.has(lower) || /^handle(click|submit|change|input|blur|focus)$/i.test(trimmed);
}

/**
 * Broader identifier noise for review/Help: any `onFoo` / `handleFoo` camelCase
 * handler id (not domain verbs like submitVacationRequest).
 */
export function isHandlerIdentifierNoise(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed) return false;
  if (isGenericHandlerName(trimmed)) return true;
  return /^(on|handle)[A-Z][A-Za-z0-9]*$/.test(trimmed);
}

/**
 * Facts whose primary documented value is a handler identifier are noise for
 * the review queue / Help actions (rename guidance lives in recommendations).
 */
export function isGenericHandlerNoiseFact(fact: {
  key: string;
  value: unknown;
  entityId?: string;
}): boolean {
  const value = String(fact.value ?? '').trim();
  if (value && isHandlerIdentifierNoise(value)) return true;
  if (fact.key === 'handler' && value && isHandlerIdentifierNoise(value)) return true;
  const entityTail = (fact.entityId ?? '').split(':').pop() ?? '';
  if (
    entityTail &&
    isHandlerIdentifierNoise(entityTail) &&
    (!value || isHandlerIdentifierNoise(value))
  ) {
    return true;
  }
  return false;
}
