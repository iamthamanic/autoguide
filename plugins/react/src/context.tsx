/**
 * @iamthamanic/autoguide-react — React context for AutoGuide runtime.
 */

import { createContext, useContext } from 'react';
import type {
  Fact,
  FlowRecord,
  PageRecord,
  ReviewActionRecord,
  ReviewItem,
  VisibilityMode,
  Tour,
} from '@iamthamanic/autoguide-core';
import type { ReviewDecisionPayload } from './review-types.js';

export interface DocElementRegistration {
  id: string;
  title: string;
  description?: string;
  roles?: string[];
}

export interface AutoGuideContextValue {
  appId: string;
  userRole?: string;
  mode: VisibilityMode;
  route: string;
  facts: Fact[];
  pages: PageRecord[];
  flows: FlowRecord[];
  tours?: Tour[];
  reviews: ReviewItem[];
  reviewHistory: ReviewActionRecord[];
  docElements: DocElementRegistration[];
  registerDocElement: (entry: DocElementRegistration) => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  devScanUrl?: string | false;
  /** Extra px above the viewport bottom (e.g. host bottom navigation). Default 0. */
  dockBottomOffset?: number;
  applyReview: (factId: string, status: 'approved' | 'rejected', editedValue?: string) => void;
  onReviewDecision?: (payload: ReviewDecisionPayload) => void | Promise<void>;
}

export const AutoGuideContext = createContext<AutoGuideContextValue | null>(null);

const noopRegister = () => {};
const noopApplyReview = () => {};

export function useAutoGuide(): AutoGuideContextValue {
  const ctx = useContext(AutoGuideContext);
  if (!ctx) {
    return {
      appId: 'unknown',
      mode: 'development',
      route: '/',
      facts: [],
      pages: [],
      flows: [],
      tours: [],
      reviews: [],
      reviewHistory: [],
      docElements: [],
      registerDocElement: noopRegister,
      dockBottomOffset: 0,
      applyReview: noopApplyReview,
    };
  }
  return ctx;
}
