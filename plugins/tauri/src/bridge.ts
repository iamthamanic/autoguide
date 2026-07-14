/**
 * @iamthamanic/autoguide-tauri — webview bridge helpers for DOM runtime scan.
 */

import { scanDom } from '@iamthamanic/autoguide-runtime';
import type { RuntimeSnapshot } from '@iamthamanic/autoguide-runtime';
import { isTauriRuntime } from './runtime.js';

export interface WebviewScanOptions {
  route?: string;
  document?: Document;
}

/**
 * Runs the same DOM scanner as browser apps inside a Tauri webview.
 */
export function scanTauriWebview(options: WebviewScanOptions = {}): RuntimeSnapshot {
  const doc = options.document ?? (typeof document !== 'undefined' ? document : undefined);
  if (!doc) {
    throw new Error('scanTauriWebview benötigt ein Document (Webview-Kontext).');
  }
  const route =
    options.route ??
    (typeof window !== 'undefined' ? window.location.pathname : '/');
  return scanDom(doc, route);
}

export function createWebviewBridge() {
  return {
    isTauri: isTauriRuntime(),
    scan: (route?: string) => scanTauriWebview({ route }),
  };
}
