/**
 * @iamthamanic/autoguide-react — root provider for host applications.
 */

import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import type {
  Fact,
  FlowRecord,
  PageRecord,
  ReviewActionRecord,
  ReviewItem,
  VisibilityMode,
  Tour,
} from '@iamthamanic/autoguide-core';
import { applyReviewDecision } from './apply-review.js';
import { AutoGuideContext, type DocElementRegistration } from './context.js';
import type { ReviewDecisionPayload } from './review-types.js';
import { useSpaRoute } from './useSpaRoute.js';

export interface AutoGuideProviderProps {
  appId: string;
  userRole?: string;
  mode?: VisibilityMode;
  route?: string;
  facts?: Fact[];
  pages?: PageRecord[];
  flows?: FlowRecord[];
  tours?: Tour[];
  reviews?: ReviewItem[];
  reviewHistory?: ReviewActionRecord[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onReviewDecision?: (payload: ReviewDecisionPayload) => void | Promise<void>;
  devScanUrl?: string | false;
  children: ReactNode;
}

export function AutoGuideProvider({
  appId,
  userRole,
  mode = 'development',
  route = typeof window !== 'undefined' ? window.location.pathname : '/',
  facts = [],
  pages = [],
  flows = [],
  tours = [],
  reviews = [],
  reviewHistory = [],
  loading = false,
  error = null,
  onRetry,
  onReviewDecision,
  devScanUrl = '/__autoguide/scan',
  children,
}: AutoGuideProviderProps) {
  const liveRoute = useSpaRoute(route);
  const [docElements, setDocElements] = useState<DocElementRegistration[]>([]);
  const [localFacts, setLocalFacts] = useState(facts);
  const [localReviews, setLocalReviews] = useState(reviews);
  const [localHistory, setLocalHistory] = useState(reviewHistory);

  useEffect(() => {
    setLocalFacts(facts);
  }, [facts]);

  useEffect(() => {
    setLocalReviews(reviews);
  }, [reviews]);

  useEffect(() => {
    setLocalHistory(reviewHistory);
  }, [reviewHistory]);

  const registerDocElement = useCallback((entry: DocElementRegistration) => {
    setDocElements((prev) => {
      const index = prev.findIndex((item) => item.id === entry.id);
      if (index === -1) return [...prev, entry];
      const next = [...prev];
      next[index] = entry;
      return next;
    });
  }, []);

  const applyReview = useCallback(
    (factId: string, status: 'approved' | 'rejected', editedValue?: string) => {
      const payload = applyReviewDecision(
        factId,
        status,
        localFacts,
        localReviews,
        localHistory,
        editedValue,
      );
      if (!payload) return;

      if (onReviewDecision) {
        void onReviewDecision(payload);
        return;
      }

      setLocalFacts((prev) => prev.map((entry) => (entry.id === payload.fact.id ? payload.fact : entry)));
      setLocalReviews(payload.reviews);
      setLocalHistory(payload.history);
    },
    [localFacts, localHistory, localReviews, onReviewDecision],
  );

  return (
    <AutoGuideContext.Provider
      value={{
        appId,
        userRole,
        mode,
        route: liveRoute,
        facts: localFacts,
        pages,
        flows,
        tours,
        reviews: localReviews,
        reviewHistory: localHistory,
        docElements,
        registerDocElement,
        loading,
        error,
        onRetry,
        devScanUrl,
        applyReview,
        onReviewDecision,
      }}
    >
      {children}
    </AutoGuideContext.Provider>
  );
}
