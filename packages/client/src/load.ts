/**
 * @iamthamanic/autoguide-client — fetch knowledge artifacts from a static base URL.
 */

import type { Fact, FlowRecord, PageRecord, Recommendation, ReviewActionRecord, ReviewItem, Tour } from '@iamthamanic/autoguide-core';
import { RUNTIME_ARTIFACT_FILES } from './artifacts.js';
import type { ClientArtifactBundle, DocBundleManifest, LoadArtifactBundleOptions } from './types.js';

function joinArtifactUrl(baseUrl: string, fileName: string): string {
  const normalized = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${normalized}${fileName}`;
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
  return (await response.json()) as T;
}

async function tryLoadManifest(
  baseUrl: string,
  fetchImpl: typeof fetch,
): Promise<DocBundleManifest | undefined> {
  try {
    return await fetchJson<DocBundleManifest>(
      joinArtifactUrl(baseUrl, RUNTIME_ARTIFACT_FILES.docBundle),
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
  await (options.manifest ?? tryLoadManifest(baseUrl, fetchImpl));

  const [facts, pages, flows, tours, recommendations, reviews, reviewHistory] =
    await Promise.all([
      fetchJson<Fact[]>(
        joinArtifactUrl(baseUrl, RUNTIME_ARTIFACT_FILES.facts),
        fetchImpl,
        false,
      ),
      fetchJson<PageRecord[]>(
        joinArtifactUrl(baseUrl, RUNTIME_ARTIFACT_FILES.pages),
        fetchImpl,
        false,
      ),
      fetchJson<FlowRecord[]>(
        joinArtifactUrl(baseUrl, RUNTIME_ARTIFACT_FILES.flows),
        fetchImpl,
        false,
      ),
      fetchJson<Tour[]>(
        joinArtifactUrl(baseUrl, RUNTIME_ARTIFACT_FILES.tours),
        fetchImpl,
        true,
      ),
      fetchJson<Recommendation[]>(
        joinArtifactUrl(baseUrl, RUNTIME_ARTIFACT_FILES.recommendations),
        fetchImpl,
        true,
      ),
      fetchJson<ReviewItem[]>(
        joinArtifactUrl(baseUrl, RUNTIME_ARTIFACT_FILES.reviews),
        fetchImpl,
        true,
      ),
      fetchJson<ReviewActionRecord[]>(
        joinArtifactUrl(baseUrl, RUNTIME_ARTIFACT_FILES.reviewHistory),
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
