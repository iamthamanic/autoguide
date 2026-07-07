#!/usr/bin/env node
/**
 * @autoguide/cli — entry point.
 */

import { Command } from 'commander';
import { runInit } from './commands/init.js';
import { runDoctor } from './commands/doctor.js';
import { runScan } from './commands/scan.js';

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
  .action(() => {
    const result = runDoctor(process.cwd());
    for (const message of result.messages) console.log(message);
    if (!result.ok) process.exitCode = 1;
  });

program
  .command('scan')
  .description('Scan source project and write .autoguide artifacts')
  .option('--source <dir>', 'source directory', 'src')
  .option('--playwright-import <path>', 'Playwright JSON report to import')
  .option('--base-url <url>', 'Base URL for crawl fallback')
  .option('--crawl', 'Crawl uncovered routes with Playwright')
  .action(async (options: {
    source: string;
    playwrightImport?: string;
    baseUrl?: string;
    crawl?: boolean;
  }) => {
    await runScan(process.cwd(), {
      sourceDir: options.source,
      playwrightReport: options.playwrightImport,
      baseUrl: options.baseUrl,
      crawl: options.crawl,
    });
    console.log('Scan abgeschlossen.');
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
