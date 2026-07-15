/**
 * @iamthamanic/autoguide-tauri — public exports for Tauri 2 desktop hosts.
 */

export { isTauriRuntime } from './runtime.js';
export { resolveAutoguideOutputDir, buildTauriAutoguideConfig } from './paths.js';
export { scanTauriWebview, createWebviewBridge } from './bridge.js';
export type { WebviewScanOptions } from './bridge.js';
