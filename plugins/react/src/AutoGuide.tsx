/**
 * @iamthamanic/autoguide-react — drop-in root component with automatic artifact loading.
 */

import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  Fact,
  FlowRecord,
  PageRecord,
  ReviewActionRecord,
  ReviewItem,
  Tour,
  VisibilityMode,
} from '@iamthamanic/autoguide-core';
import { loadArtifactBundle } from '@iamthamanic/autoguide-client';
import { AutoGuideProvider } from './AutoGuideProvider.js';
import { AutoGuideWidget } from './AutoGuideWidget.js';
import { InspectorOverlay } from './InspectorOverlay.js';
import { TourRunner } from './TourRunner.js';

export interface AutoGuideFeatures {
  widget?: boolean;
  inspector?: boolean;
  tours?: boolean;
}

export interface AutoGuideProps {
  appId: string;
  bundleBase?: string;
  mode?: VisibilityMode;
  userRole?: string;
  features?: AutoGuideFeatures;
  children?: ReactNode;
}

interface LoadedState {
  loading: boolean;
  error: string | null;
  facts: Fact[];
  pages: PageRecord[];
  flows: FlowRecord[];
  tours: Tour[];
  reviews: ReviewItem[];
  reviewHistory: ReviewActionRecord[];
}

const emptyState: LoadedState = {
  loading: true,
  error: null,
  facts: [],
  pages: [],
  flows: [],
  tours: [],
  reviews: [],
  reviewHistory: [],
};

export function AutoGuide({
  appId,
  bundleBase = '/autoguide',
  mode = 'published',
  userRole,
  features = { widget: true },
  children,
}: AutoGuideProps) {
  const [state, setState] = useState<LoadedState>(emptyState);

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const bundle = await loadArtifactBundle({ baseUrl: bundleBase });
      setState({
        loading: false,
        error: null,
        facts: bundle.facts,
        pages: bundle.pages,
        flows: bundle.flows,
        tours: bundle.tours,
        reviews: bundle.reviews,
        reviewHistory: bundle.reviewHistory,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'AutoGuide: Laden fehlgeschlagen.';
      setState((prev) => ({ ...prev, loading: false, error: message }));
    }
  }, [bundleBase]);

  useEffect(() => {
    void load();
  }, [load]);

  const primaryTour = useMemo(
    () => state.tours.find((tour) => tour.status === 'published') ?? state.tours[0],
    [state.tours],
  );

  const showWidget = features.widget !== false;
  const showInspector = features.inspector === true;
  const showTours = features.tours === true;

  return (
    <AutoGuideProvider
      appId={appId}
      userRole={userRole}
      mode={mode}
      facts={state.facts}
      pages={state.pages}
      flows={state.flows}
      tours={state.tours}
      reviews={state.reviews}
      reviewHistory={state.reviewHistory}
      loading={state.loading}
      error={state.error}
      onRetry={() => void load()}
    >
      {children}
      {showWidget ? <AutoGuideWidget /> : null}
      {showInspector ? <InspectorOverlay /> : null}
      {showTours && primaryTour ? <TourRunner tourId={primaryTour.id} /> : null}
    </AutoGuideProvider>
  );
}
