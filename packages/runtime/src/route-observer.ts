/**
 * @autoguide/runtime — route change observer for SPA snapshot refresh.
 */

import { scanDom } from './scanner.js';
import type { RuntimeNavigationEvent, RuntimeSnapshot } from './types.js';

export function observeRouteChanges(
  getRoute: () => string,
  onChange: (route: string) => void,
  options?: { pollMs?: number },
): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  let lastRoute = getRoute();

  const check = () => {
    const nextRoute = getRoute();
    if (nextRoute === lastRoute) return;
    lastRoute = nextRoute;
    onChange(nextRoute);
  };

  window.addEventListener('popstate', check);
  window.addEventListener('hashchange', check);
  const interval =
    options?.pollMs && options.pollMs > 0
      ? window.setInterval(check, options.pollMs)
      : undefined;

  return () => {
    window.removeEventListener('popstate', check);
    window.removeEventListener('hashchange', check);
    if (interval !== undefined) window.clearInterval(interval);
  };
}

export interface SnapshotRecorder {
  getSnapshot: () => RuntimeSnapshot;
  stop: () => void;
}

export function createSnapshotRecorder(
  root: ParentNode,
  getRoute: () => string,
  options?: { pollMs?: number },
): SnapshotRecorder {
  const navigation: RuntimeNavigationEvent[] = [];
  let snapshot = scanDom(root, getRoute(), navigation);

  const stopRoute = observeRouteChanges(
    getRoute,
    (route) => {
      snapshot = scanDom(root, route, navigation);
      navigation.push({ route, capturedAt: snapshot.capturedAt });
    },
    options,
  );

  return {
    getSnapshot: () => snapshot,
    stop: stopRoute,
  };
}

export function observeDomMutations(
  root: ParentNode,
  onMutate: () => void,
  options?: { debounceMs?: number },
): () => void {
  if (typeof MutationObserver === 'undefined') {
    return () => undefined;
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  const debounceMs = options?.debounceMs ?? 120;

  const observer = new MutationObserver(() => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(onMutate, debounceMs);
  });

  observer.observe(root instanceof Document ? root.body : root, {
    childList: true,
    subtree: true,
    attributes: true,
  });

  return () => {
    observer.disconnect();
    if (timer) clearTimeout(timer);
  };
}
