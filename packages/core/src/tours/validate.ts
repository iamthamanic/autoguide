/**
 * @autoguide/core — validate guided tour records.
 */

import type { Tour, TourStep } from './types.js';

function isTourStep(value: unknown): value is TourStep {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === 'string' && typeof v.title === 'string' && typeof v.body === 'string';
}

export function isTour(value: unknown): value is Tour {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.title === 'string' &&
    Array.isArray(v.roleIds) &&
    Array.isArray(v.steps) &&
    v.steps.every(isTourStep) &&
    typeof v.status === 'string'
  );
}

export function validateTours(data: unknown): string[] {
  if (!Array.isArray(data)) return ['tours muss ein Array sein.'];
  const errors: string[] = [];
  data.forEach((item, index) => {
    if (!isTour(item)) errors.push(`tours[${index}] hat ungültige Struktur.`);
  });
  return errors;
}
