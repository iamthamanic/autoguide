/**
 * @iamthamanic/autoguide-core — route normalization helpers for Help / page linking.
 */

/** Normalize path: strip query/hash, ensure leading slash, drop trailing slash. */
export function normalizeRoute(route: string): string {
  let path = route.split('?')[0]?.split('#')[0] ?? '/';
  if (path === '') return '/';
  if (!path.startsWith('/')) path = `/${path}`;
  return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
}

/** First path segment of a normalized route (`/dashboard/info` → `dashboard`). */
export function routeSlug(route: string): string {
  const normalized = normalizeRoute(route);
  if (normalized === '/') return '';
  return normalized.replace(/^\//, '').split('/')[0] ?? '';
}

/**
 * True when a source file name likely belongs to a route slug
 * (e.g. DashboardScreen.tsx ↔ /dashboard).
 */
export function filePathMatchesRoute(filePath: string, route: string): boolean {
  const slug = routeSlug(route);
  const compact = slug.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (compact.length < 4) return false;

  const file = filePath.replace(/\\/g, '/').split('/').pop() ?? '';
  const name = file.replace(/\.[^.]+$/, '').toLowerCase();
  return name.includes(compact);
}
