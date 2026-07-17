/**
 * @iamthamanic/autoguide-react — dock position clamp + localStorage helpers.
 */

export interface DockPosition {
  left: number;
  top: number;
}

const STORAGE_PREFIX = 'autoguide:dock-position:';

export function dockPositionStorageKey(appId: string): string {
  const id = appId.trim() || 'unknown';
  return `${STORAGE_PREFIX}${id}`;
}

export function clampDockPosition(
  left: number,
  top: number,
  dockWidth: number,
  dockHeight: number,
  viewportWidth: number,
  viewportHeight: number,
): DockPosition {
  const maxLeft = Math.max(0, viewportWidth - Math.max(0, dockWidth));
  const maxTop = Math.max(0, viewportHeight - Math.max(0, dockHeight));
  return {
    left: Math.min(Math.max(0, left), maxLeft),
    top: Math.min(Math.max(0, top), maxTop),
  };
}

export function parseDockPosition(raw: string | null): DockPosition | null {
  if (raw == null || raw === '') return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('left' in parsed) ||
      !('top' in parsed)
    ) {
      return null;
    }
    const left = Number((parsed as { left: unknown }).left);
    const top = Number((parsed as { top: unknown }).top);
    if (!Number.isFinite(left) || !Number.isFinite(top)) return null;
    return { left, top };
  } catch {
    return null;
  }
}

export function readDockPosition(storage: Storage | null | undefined, appId: string): DockPosition | null {
  if (!storage) return null;
  try {
    return parseDockPosition(storage.getItem(dockPositionStorageKey(appId)));
  } catch {
    return null;
  }
}

export function writeDockPosition(
  storage: Storage | null | undefined,
  appId: string,
  position: DockPosition,
): void {
  if (!storage) return;
  try {
    storage.setItem(dockPositionStorageKey(appId), JSON.stringify(position));
  } catch {
    // Quota / private mode — ignore
  }
}

export function clearDockPosition(storage: Storage | null | undefined, appId: string): void {
  if (!storage) return;
  try {
    storage.removeItem(dockPositionStorageKey(appId));
  } catch {
    // ignore
  }
}
