/**
 * @autoguide/export — PDF export via Playwright print.
 */

import type { Fact } from '@autoguide/core';
import type { FlowRecord, PageRecord } from '@autoguide/core';
import { exportKnowledgeHtml } from './html.js';
import type { ExportRenderOptions } from './types.js';

export async function writeHtmlToPdf(html: string, outputPath: string): Promise<void> {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
    });
  } finally {
    await browser.close();
  }
}

export async function exportKnowledgePdf(
  pages: PageRecord[],
  flows: FlowRecord[],
  facts: Fact[],
  outputPath: string,
  options: ExportRenderOptions,
): Promise<void> {
  const html = exportKnowledgeHtml(pages, flows, facts, options);
  await writeHtmlToPdf(html, outputPath);
}
