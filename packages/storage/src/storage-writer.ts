/**
 * @autoguide/storage — high-level storage API for .autoguide/ artifacts.
 */

import { join } from 'node:path';
import { writeJsonAtomic, ensureDir } from './json-writer.js';
import { SqliteIndex } from './sqlite-index.js';

export interface StoragePaths {
  outputDir: string;
  appJson: string;
  pagesJson: string;
  featuresJson: string;
  flowsJson: string;
  factsJson: string;
  confidenceJson: string;
  reviewsJson: string;
}

export function resolveStoragePaths(outputDir: string): StoragePaths {
  return {
    outputDir,
    appJson: join(outputDir, 'app.json'),
    pagesJson: join(outputDir, 'pages.json'),
    featuresJson: join(outputDir, 'features.json'),
    flowsJson: join(outputDir, 'flows.json'),
    factsJson: join(outputDir, 'facts.json'),
    confidenceJson: join(outputDir, 'confidence.json'),
    reviewsJson: join(outputDir, 'reviews.json'),
  };
}

export class StorageWriter {
  readonly paths: StoragePaths;
  readonly index: SqliteIndex;

  constructor(outputDir: string) {
    this.paths = resolveStoragePaths(outputDir);
    this.index = new SqliteIndex(outputDir);
  }

  async init(): Promise<void> {
    await ensureDir(this.paths.outputDir);
    await writeJsonAtomic(this.paths.appJson, {
      version: '0.1.0',
      initializedAt: new Date().toISOString(),
    });
    await writeJsonAtomic(this.paths.pagesJson, []);
    await writeJsonAtomic(this.paths.featuresJson, []);
    await writeJsonAtomic(this.paths.flowsJson, []);
    await writeJsonAtomic(this.paths.factsJson, []);
    await writeJsonAtomic(this.paths.confidenceJson, { scores: {} });
    await writeJsonAtomic(this.paths.reviewsJson, []);
  }

  async writeJson<T>(path: string, data: T): Promise<void> {
    await writeJsonAtomic(path, data);
  }

  async writeRuntimeSnapshot(snapshot: unknown): Promise<void> {
    await writeJsonAtomic(join(this.paths.outputDir, 'runtime-snapshot.json'), snapshot);
  }

  dispose(): void {
    this.index.close();
  }
}
