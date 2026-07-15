/**
 * @iamthamanic/autoguide-core — filter facts for development vs published visibility.
 */

import type { Fact } from '../types/fact.js';
import type { VisibilityMode } from '../types/fact.js';
import { isVisibleInPublishedMode } from '../validators/fact.js';
import { PUBLISHED_THRESHOLD } from '../confidence/score.js';

export function filterFactsForMode(facts: Fact[], mode: VisibilityMode): Fact[] {
  if (mode === 'development') return facts;
  return facts.filter((fact) => isVisibleInPublishedMode(fact, PUBLISHED_THRESHOLD));
}
