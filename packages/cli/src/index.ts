#!/usr/bin/env node
/**
 * @iamthamanic/autoguide-cli — entry point.
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
import { runSearch } from './commands/search.js';
import { runSyncCommand } from './commands/sync.js';
import { getCliVersion } from './lib/cli-version.js';

const program = new Command();

program
  .name('autoguide')
  .description('AutoGuide documentation intelligence CLI')
  .version(getCliVersion());

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
  .option(
    '--storage-state <path>',
    'Playwright storageState JSON (cookies/session) for authenticated runtime scan',
  )
  .option('--crawl', 'Crawl uncovered routes with Playwright')
  .option(
    '--auto',
    'Autonomy path: sufficiency gate → escalate with own crawl (runtime only if enabled)',
  )
  .option('--verify-flows', 'Verify generated flows in a browser via Playwright')
  .option('--no-ai', 'Skip AI enrichment')
  .option('--cloud-consent', 'Record consent for cloud AI enrichment')
  .action(async (options: {
    source: string;
    playwrightImport?: string;
    baseUrl?: string;
    runtime?: boolean;
    runtimeUrl?: string;
    storageState?: string;
    crawl?: boolean;
    auto?: boolean;
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
      storageState: options.storageState,
      crawl: options.crawl,
      auto: options.auto,
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
  .command('search <query...>')
  .description('Search indexed pages and flows (SQLite FTS, JSON fallback)')
  .option('--role <role>', 'Filter results to a user role')
  .option('--published', 'Only published records')
  .option('--limit <count>', 'Maximum results', '20')
  .option('--json', 'JSON output for CI')
  .action(async (queryParts: string[], options: { role?: string; published?: boolean; limit: string; json?: boolean }) => {
    const query = queryParts.join(' ');
    const code = await runSearch(process.cwd(), query, {
      role: options.role,
      publishedOnly: options.published,
      limit: Number.parseInt(options.limit, 10),
      json: options.json,
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

program
  .command('sync')
  .description('Copy publish-ready .autoguide artifacts to a static target directory')
  .option('--target <dir>', 'Target directory for static assets', 'public/autoguide')
  .option('--clean', 'Remove target directory before copying')
  .action(async (options: { target: string; clean?: boolean }) => {
    const code = await runSyncCommand(process.cwd(), { target: options.target, clean: options.clean });
    if (code !== 0) process.exitCode = code;
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
