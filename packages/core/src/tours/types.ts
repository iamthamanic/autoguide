/**
 * @autoguide/core — guided tour types.
 * Location: packages/core/src/tours/types.ts
 */

export type TourStatus = 'draft' | 'reviewed' | 'published';

export type TourStepAction = 'click' | 'input' | 'navigate' | 'observe';

export interface TourStep {
  id: string;
  targetSelector?: string;
  title: string;
  body: string;
  expectedState?: string;
  action?: TourStepAction;
}

export interface Tour {
  id: string;
  title: string;
  description?: string;
  roleIds: string[];
  steps: TourStep[];
  status: TourStatus;
}
