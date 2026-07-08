/**
 * @autoguide/core — plugin ↔ AutoGuide version compatibility.
 */

import { AUTOGUIDE_VERSION } from './version.js';

function parseVersion(value: string): [number, number, number] {
  const [major = 0, minor = 0, patch = 0] = value.split('.').map((part) => Number(part));
  return [major, minor, patch];
}

/** Minimal semver caret check for MVP (^0.1.0). */
export function isPluginCompatible(
  declaredRange: string,
  runtimeVersion: string = AUTOGUIDE_VERSION,
): boolean {
  if (declaredRange === '*' || declaredRange === runtimeVersion) return true;
  if (declaredRange.startsWith('^')) {
    const [bm, bn, bp] = parseVersion(declaredRange.slice(1));
    const [vm, vn, vp] = parseVersion(runtimeVersion);
    if (bm === 0) {
      return vm === 0 && vn === bn && vp >= bp;
    }
    return vm === bm && (vn > bn || (vn === bn && vp >= bp));
  }
  return declaredRange === runtimeVersion;
}
