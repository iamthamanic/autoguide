#!/usr/bin/env node
/**
 * @autoguide/cli — entry point.
 */

import { Command } from 'commander';
import { runInit } from './commands/init.js';
import { runDoctor } from './commands/doctor.js';
import { runScan } from './commands/scan.js';
import { runReview } from './commands/review.js';
import { runExport } from './commands/export.js';
import { runPublish } from './commands/publish.js';
import { runValidateCommand } from './commands/validate.js';
import { runGenerate } from './commands/generate.js';

const program = new Command();

program
  .name('autoguide')
  .description('AutoGuide documentation intelligence CLI')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize AutoGuide in the current project')
  .action(async () => {
    await runInit(process.cwd());
    console.log('AutoGuide initialisiert.');
  });

program
  .command('doctor')
  .description('Check AutoGuide project health')
  .action(async () => {
    const result = await runDoctor(process.cwd());
    for (const message of result.messages) console.log(message);
    if (!result.ok) process.exitCode = 1;
  });

program
  .command('scan')
  .description('Scan source project and write .autoguide artifacts')
  .option('--source <dir>', 'source directory', 'src')
  .option('--playwright-import <path>', 'Playwright JSON report to import')
  .option('--base-url <url>', 'Base URL for crawl fallback')
  .option('--runtime', 'Capture runtime DOM via Playwright at baseUrl')
  .option('--runtime-url <url>', 'Override base URL for runtime capture only')
  .option('--crawl', 'Crawl uncovered routes with Playwright')
  .option('--verify-flows', 'Verify generated flows in a browser via Playwright')
  .option('--no-ai', 'Skip AI enrichment')
  .option('--cloud-consent', 'Record consent for cloud AI enrichment')
  .action(async (options: {
    source: string;
    playwrightImport?: string;
    baseUrl?: string;
    runtime?: boolean;
    runtimeUrl?: string;
    crawl?: boolean;
    verifyFlows?: boolean;
    noAi?: boolean;
    cloudConsent?: boolean;
  }) => {
    const result = await runScan(process.cwd(), {
      sourceDir: options.source,
      playwrightReport: options.playwrightImport,
      baseUrl: options.baseUrl,
      runtime: options.runtime,
      runtimeUrl: options.runtimeUrl,
      crawl: options.crawl,
      verifyFlows: options.verifyFlows,
      noAi: options.noAi,
      cloudConsent: options.cloudConsent,
    });
    if (!result.ok) {
      for (const error of result.errors) console.error(error);
      process.exitCode = 1;
      return;
    }
    for (const warning of result.warnings) console.warn(warning);
    console.log(`Scan abgeschlossen (${result.outputDir}).`);
  });

program
  .command('review')
  .description('Review queue: list, accept, or reject uncertain facts')
  .option('--list', 'List pending review items')
  .option('--accept <factId>', 'Approve a fact')
  .option('--reject <factId>', 'Reject a fact')
  .option('--edit <factId>', 'Edit and re-verify a fact')
  .option('--value <text>', 'Edited value when accepting or editing')
  .option('--json', 'JSON output for CI')
  .action(async (options: {
    list?: boolean;
    accept?: string;
    reject?: string;
    edit?: string;
    value?: string;
    json?: boolean;
  }) => {
    const code = await runReview(process.cwd(), options);
    if (code !== 0) process.exitCode = code;
  });

program
  .command('generate')
  .description('Generate derived artifacts from existing .autoguide scan output')
  .argument('[target]', 'tours | recommendations | bundle', 'bundle')
  .action(async (target: string) => {
    const normalized = target === 'tours' || target === 'recommendations' || target === 'bundle'
      ? target
      : 'bundle';
    const code = await runGenerate(process.cwd(), normalized);
    if (code !== 0) process.exitCode = code;
  });

program
  .command('export')
  .description('Export documentation artifacts')
  .option('--format <format>', 'Export format (md, html, pdf)', 'md')
  .option('--out <dir>', 'Output directory', 'docs/autoguide-export')
  .option('--role <role>', 'Filter export to a single user role')
  .action(async (options: { format: string; out: string; role?: string }) => {
    const code = await runExport(process.cwd(), {
      format: options.format as 'md' | 'html' | 'pdf',
      outDir: options.out,
      role: options.role,
    });
    if (code !== 0) process.exitCode = code;
  });

program
  .command('validate')
  .description('Validate .autoguide artifacts for CI (schemas, stale docs)')
  .option('--soft', 'Warn only for stale docs; still fail on schema errors')
  .option('--json', 'JSON output for CI')
  .option('--max-stale <count>', 'Allowed stale facts before failure', '0')
  .action(async (options: { soft?: boolean; json?: boolean; maxStale: string }) => {
    const code = await runValidateCommand(process.cwd(), {
      soft: options.soft,
      json: options.json,
      maxStale: Number.parseInt(options.maxStale, 10),
    });
    if (code !== 0) process.exitCode = code;
  });

program
  .command('publish')
  .description('Validate and switch project to published mode')
  .action(async () => {
    const code = await runPublish(process.cwd());
    if (code !== 0) process.exitCode = code;
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
