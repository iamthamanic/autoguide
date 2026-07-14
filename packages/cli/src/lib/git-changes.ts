/**
 * @iamthamanic/autoguide-cli — git diff helper for rescan change detection.
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export async function getGitHead(cwd: string): Promise<string | undefined> {
  try {
    const { stdout } = await execFileAsync('git', ['rev-parse', '--short', 'HEAD'], { cwd });
    const head = stdout.trim();
    return head || undefined;
  } catch {
    return undefined;
  }
}

export async function getGitChangedFiles(cwd: string, paths: string[]): Promise<string[]> {
  try {
    const { stdout: inside } = await execFileAsync('git', ['rev-parse', '--is-inside-work-tree'], {
      cwd,
    });
    if (inside.trim() !== 'true') return [];

    const scopedPaths = paths.length > 0 ? paths : ['.'];
    const { stdout } = await execFileAsync(
      'git',
      ['diff', '--name-only', 'HEAD', '--', ...scopedPaths],
      { cwd },
    );
    return stdout
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}
