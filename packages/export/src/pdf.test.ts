import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { FlowRecord, PageRecord } from '@autoguide/core';
import { exportKnowledgePdf } from './pdf.js';

const samplePages: PageRecord[] = [
  {
    id: 'p1',
    route: '/',
    title: 'Beispiel mit Umlauten äöü',
    roleIds: [],
    elementIds: [],
    featureIds: [],
    flowIds: [],
    factIds: [],
    status: 'published',
  },
];

const sampleFlows: FlowRecord[] = [
  {
    id: 'f1',
    title: 'Einführung',
    steps: [{ order: 1, title: 'Start', factIds: [] }],
    roleIds: [],
    pageIds: [],
    factIds: [],
    status: 'published',
  },
];

describe('exportKnowledgePdf', () => {
  it('writes a non-empty PDF file when Playwright is available', async () => {
    let chromiumAvailable = true;
    try {
      const { chromium } = await import('playwright');
      const browser = await chromium.launch();
      await browser.close();
    } catch {
      chromiumAvailable = false;
    }
    if (!chromiumAvailable) return;

    const dir = await mkdtemp(join(tmpdir(), 'ag-pdf-'));
    const pdfPath = join(dir, 'knowledge.pdf');
    try {
      await exportKnowledgePdf(samplePages, sampleFlows, [], pdfPath, {
        mode: 'published',
      });
      const info = await stat(pdfPath);
      expect(info.size).toBeGreaterThan(500);
      const header = await readFile(pdfPath);
      expect(header.subarray(0, 4).toString()).toBe('%PDF');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
