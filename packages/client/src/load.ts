/**
 * @iamthamanic/autoguide-client — fetch knowledge artifacts from a static base URL.
 */

import type { Fact, FlowRecord, PageRecord, Recommendation, ReviewActionRecord, ReviewItem, Tour } from '@iamthamanic/autoguide-core';
import { RUNTIME_ARTIFACT_FILES } from './artifacts.js';
import type { ClientArtifactBundle, DocBundleManifest, LoadArtifactBundleOptions } from './types.js';

function joinArtifactUrl(baseUrl: string, fileName: string, cacheBust?: string | number): string {
  const normalized = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const url = `${normalized}${fileName}`;
  if (cacheBust === undefined || cacheBust === '') return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}v=${encodeURIComponent(String(cacheBust))}`;
}

async function fetchJson<T>(
  url: string,
  fetchImpl: typeof fetch,
  optional: boolean,
): Promise<T> {
  const response = await fetchImpl(url);
  if (!response.ok) {
    if (optional && response.status === 404) {
      return [] as T;
    }
    throw new Error(
      `AutoGuide: Artefakt nicht geladen (${response.status}): ${url}`,
    );
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (optional && !contentType.includes('json')) {
    return [] as T;
  }

  try {
    return (await response.json()) as T;
  } catch {
    if (optional) {
      return [] as T;
    }
    throw new Error(`AutoGuide: Ungültiges JSON: ${url}`);
  }
}

async function tryLoadManifest(
  baseUrl: string,
  fetchImpl: typeof fetch,
  cacheBust?: string | number,
): Promise<DocBundleManifest | undefined> {
  try {
    return await fetchJson<DocBundleManifest>(
      joinArtifactUrl(baseUrl, RUNTIME_ARTIFACT_FILES.docBundle, cacheBust),
      fetchImpl,
      true,
    );
  } catch {
    return undefined;
  }
}

export async function loadArtifactBundle(
  options: LoadArtifactBundleOptions,
): Promise<ClientArtifactBundle> {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  if (!fetchImpl) {
    throw new Error('AutoGuide: fetch ist in dieser Umgebung nicht verfügbar.');
  }

  const baseUrl = options.baseUrl.replace(/\/$/, '');
  const bust = options.cacheBust;
  await (options.manifest ??
    tryLoadManifest(baseUrl, fetchImpl, bust));

  const [facts, pages, flows, tours, recommendations, reviews, reviewHistory] =
    await Promise.all([
      fetchJson<Fact[]>(
        joinArtifactUrl(baseUrl, RUNTIME_ARTIFACT_FILES.facts, bust),
        fetchImpl,
        false,
      ),
      fetchJson<PageRecord[]>(
        joinArtifactUrl(baseUrl, RUNTIME_ARTIFACT_FILES.pages, bust),
        fetchImpl,
        false,
      ),
      fetchJson<FlowRecord[]>(
        joinArtifactUrl(baseUrl, RUNTIME_ARTIFACT_FILES.flows, bust),
        fetchImpl,
        false,
      ),
      fetchJson<Tour[]>(
        joinArtifactUrl(baseUrl, RUNTIME_ARTIFACT_FILES.tours, bust),
        fetchImpl,
        true,
      ),
      fetchJson<Recommendation[]>(
        joinArtifactUrl(baseUrl, RUNTIME_ARTIFACT_FILES.recommendations, bust),
        fetchImpl,
        true,
      ),
      fetchJson<ReviewItem[]>(
        joinArtifactUrl(baseUrl, RUNTIME_ARTIFACT_FILES.reviews, bust),
        fetchImpl,
        true,
      ),
      fetchJson<ReviewActionRecord[]>(
        joinArtifactUrl(baseUrl, RUNTIME_ARTIFACT_FILES.reviewHistory, bust),
        fetchImpl,
        true,
      ),
    ]);

  return {
    baseUrl,
    facts,
    pages,
    flows,
    tours,
    recommendations,
    reviews,
    reviewHistory,
  };
}
