/**
 * @autoguide/core — review action types for the verification loop.
 */

export type ReviewAction =
  | 'pending'
  | 'accepted'
  | 'edited'
  | 'rejected'
  | 'verified_after_edit'
  | 'unsupported_manual_knowledge'
  | 'conflict';

export interface ReviewActionRecord {
  factId: string;
  entityId: string;
  key: string;
  action: ReviewAction;
  previousValue?: unknown;
  newValue?: unknown;
  at: string;
  note?: string;
}
