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
 * Facts whose primary documented value is a generic handler name are noise for
 * the review queue (rename guidance lives in recommendations instead).
 */
export function isGenericHandlerNoiseFact(fact: {
  key: string;
  value: unknown;
  entityId?: string;
}): boolean {
  const value = String(fact.value ?? '').trim();
  if (value && isGenericHandlerName(value)) return true;
  if (fact.key === 'handler' && value && isGenericHandlerName(value)) return true;
  const entityTail = (fact.entityId ?? '').split(':').pop() ?? '';
  if (entityTail && isGenericHandlerName(entityTail) && (!value || isGenericHandlerName(value))) {
    return true;
  }
  return false;
}
