/**
 * @autoguide/ai — cloud consent persistence for opt-in enrichment.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

const CONSENT_FILE = 'cloud-ai-consent.json';

export function hasCloudConsentFromEnv(): boolean {
  return process.env.AUTOGuide_AI_CONSENT === '1' || process.env.AUTOGuide_AI_CONSENT === 'true';
}

export async function hasCloudConsent(outputDir: string): Promise<boolean> {
  if (hasCloudConsentFromEnv()) return true;
  const path = join(outputDir, CONSENT_FILE);
  if (!existsSync(path)) return false;
  try {
    const data = JSON.parse(await readFile(path, 'utf8')) as { accepted?: boolean };
    return data.accepted === true;
  } catch {
    return false;
  }
}

export async function recordCloudConsent(outputDir: string): Promise<void> {
  await mkdir(outputDir, { recursive: true });
  const path = join(outputDir, CONSENT_FILE);
  await writeFile(
    path,
    `${JSON.stringify({ accepted: true, acceptedAt: new Date().toISOString() }, null, 2)}\n`,
    'utf8',
  );
}

export const CLOUD_CONSENT_MESSAGE =
  'Cloud-KI sendet Evidenz an einen externen Endpunkt. Nur mit Zustimmung fortfahren (AUTOGuide_AI_CONSENT=1 oder --cloud-consent).';
