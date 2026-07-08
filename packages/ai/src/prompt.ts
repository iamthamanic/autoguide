/**
 * @autoguide/ai — evidence-only prompt for structured proposals.
 */

import type { AiEnrichmentInput } from './types.js';
import { redactString } from '@autoguide/core';

export function buildEnrichmentPrompt(inputs: AiEnrichmentInput[]): string {
  const evidence = inputs
    .map((item) =>
      `- ${item.entityId} / ${item.key}: ${redactString(String(item.value ?? ''))}`,
    )
    .join('\n');

  return [
    'Du bist ein Dokumentations-Assistent. Antworte NUR mit gültigem JSON.',
    'Regeln:',
    '- Nutze ausschließlich die gelieferten Evidenz-Fakten.',
    '- Erfinde keine Routen, Buttons oder Features.',
    '- Wenn unsicher, lasse das Feld weg.',
    '',
    'JSON-Format:',
    '{"proposals":[{"entityId":"...","key":"description","value":"...","description":"optional"}]}',
    '',
    'Evidenz:',
    evidence,
  ].join('\n');
}
