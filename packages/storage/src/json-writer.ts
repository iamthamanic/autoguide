/**
 * @autoguide/storage — atomic JSON file writes.
 */

import { mkdir, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { redactUnknown } from '@autoguide/core';

export async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

export async function writeJsonAtomic<T>(filePath: string, data: T): Promise<void> {
  await ensureDir(dirname(filePath));
  const tmpPath = join(dirname(filePath), `.${randomUUID()}.tmp`);
  const sanitized = redactUnknown(data);
  const payload = `${JSON.stringify(sanitized, null, 2)}\n`;
  await writeFile(tmpPath, payload, 'utf8');
  await rename(tmpPath, filePath);
}
