/**
 * @autoguide/scanner — walk project files for TS/TSX sources.
 */

import { readdir, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const SOURCE_EXT = new Set(['.ts', '.tsx', '.jsx', '.js']);

export async function walkSourceFiles(rootDir: string): Promise<string[]> {
  const results: string[] = [];

  async function walk(dir: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.')) {
        continue;
      }
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }
      if (SOURCE_EXT.has(extname(entry.name))) {
        results.push(fullPath);
      }
    }
  }

  await walk(rootDir);
  return results;
}

export async function readSourceFile(path: string): Promise<string> {
  return readFile(path, 'utf8');
}
