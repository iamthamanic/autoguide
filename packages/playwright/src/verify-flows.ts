/**
 * @autoguide/playwright — execute flow steps in a browser and record verification results.
 */

import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { FlowRecord, FlowStep, FlowVerificationProfile } from '@autoguide/core';
import { isSafeAction } from './crawl.js';

export interface VerifyFlowsOptions {
  baseUrl: string;
  outputDir: string;
  safeMode?: boolean;
}

interface StepRunResult {
  ok: boolean;
  expectedRoute?: string;
  actualRoute?: string;
  message?: string;
}

function normalizeRoute(route: string): string {
  const path = route.replace(/\/$/, '') || '/';
  return path.startsWith('/') ? path : `/${path}`;
}

async function captureFailureArtifact(
  page: import('playwright').Page,
  outputDir: string,
  flowId: string,
  stepOrder: number,
): Promise<string> {
  const dir = join(outputDir, 'verify-artifacts', flowId);
  await mkdir(dir, { recursive: true });
  const artifactPath = join(dir, `step-${stepOrder}.png`);
  await page.screenshot({ path: artifactPath, fullPage: true });
  return artifactPath;
}

async function runStep(
  page: import('playwright').Page,
  step: FlowStep,
  baseUrl: string,
  safeMode: boolean,
): Promise<StepRunResult> {
  const title = step.title.trim();
  if (!isSafeAction(title, safeMode)) {
    return { ok: false, message: 'Schritt in safeMode blockiert.' };
  }

  const gotoMatch = title.match(/^goto\s+(\S+)/i);
  if (gotoMatch) {
    const expectedRoute = normalizeRoute(gotoMatch[1]!);
    await page.goto(new URL(expectedRoute, baseUrl).toString(), {
      waitUntil: 'domcontentloaded',
      timeout: 15_000,
    });
    const actualRoute = normalizeRoute(new URL(page.url()).pathname);
    return {
      ok: actualRoute === expectedRoute,
      expectedRoute,
      actualRoute,
      message: actualRoute === expectedRoute ? undefined : 'Route stimmt nicht überein.',
    };
  }

  const clickMatch = title.match(/^click\s+(.+)/i);
  if (clickMatch) {
    const label = clickMatch[1]!.trim();
    const button = page.getByRole('button', { name: label });
    if (await button.count()) {
      await button.first().click({ timeout: 5_000 });
    } else {
      await page.locator('button', { hasText: label }).first().click({ timeout: 5_000 });
    }
    return { ok: true, actualRoute: normalizeRoute(new URL(page.url()).pathname) };
  }

  const fillMatch = title.match(/^fill\s+(.+)/i);
  if (fillMatch) {
    const label = fillMatch[1]!.trim();
    const field = page.getByLabel(label);
    if (await field.count()) {
      await field.fill('AutoGuide', { timeout: 5_000 });
    } else {
      await page.getByPlaceholder(label).fill('AutoGuide', { timeout: 5_000 });
    }
    return { ok: true };
  }

  await page.getByText(title, { exact: false }).first().waitFor({ state: 'visible', timeout: 5_000 });
  return { ok: true, actualRoute: normalizeRoute(new URL(page.url()).pathname) };
}

export async function verifyFlows(
  flows: FlowRecord[],
  options: VerifyFlowsOptions,
): Promise<FlowRecord[]> {
  if (flows.length === 0) return flows;

  let chromium: typeof import('playwright').chromium | undefined;
  try {
    const playwright = await import('playwright');
    chromium = playwright.chromium;
  } catch {
    return flows.map((flow) => ({
      ...flow,
      verification: {
        status: 'failed',
        baseUrl: options.baseUrl,
        message: 'Playwright nicht verfügbar.',
      } satisfies FlowVerificationProfile,
    }));
  }

  const safeMode = options.safeMode ?? true;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const verifiedAt = new Date().toISOString();
  const updated: FlowRecord[] = [];

  try {
    for (const flow of flows) {
      let passed = 0;
      let failedStepOrder: number | undefined;
      let artifactPath: string | undefined;
      let message: string | undefined;
      let expectedRoute: string | undefined;
      let actualRoute: string | undefined;

      await page.goto(options.baseUrl, { waitUntil: 'domcontentloaded', timeout: 15_000 });

      for (const step of [...flow.steps].sort((a, b) => a.order - b.order)) {
        try {
          const result = await runStep(page, step, options.baseUrl, safeMode);
          expectedRoute = result.expectedRoute ?? expectedRoute;
          actualRoute = result.actualRoute ?? actualRoute;
          if (result.ok) {
            passed += 1;
            continue;
          }
          failedStepOrder = step.order;
          message = result.message ?? `Schritt ${step.order} fehlgeschlagen: ${step.title}`;
          artifactPath = await captureFailureArtifact(page, options.outputDir, flow.id, step.order);
          break;
        } catch (error) {
          failedStepOrder = step.order;
          message = error instanceof Error ? error.message : String(error);
          artifactPath = await captureFailureArtifact(page, options.outputDir, flow.id, step.order);
          break;
        }
      }

      const total = flow.steps.length;
      const status =
        failedStepOrder === undefined && passed === total
          ? 'verified'
          : passed > 0
            ? 'partial'
            : 'failed';

      updated.push({
        ...flow,
        status: status === 'verified' ? 'reviewed' : flow.status,
        verification: {
          status,
          baseUrl: options.baseUrl,
          verifiedAt,
          failedStepOrder,
          expectedRoute,
          actualRoute,
          artifactPath,
          message,
        },
      });
    }
  } finally {
    await browser.close();
  }

  return updated;
}
