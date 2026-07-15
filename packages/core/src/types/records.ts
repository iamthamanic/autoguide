/**
 * @iamthamanic/autoguide-core — application entity records (pages, features, flows).
 * Location: packages/core/src/types/records.ts
 */

export type RecordStatus = 'draft' | 'reviewed' | 'published' | 'stale';

export type FlowVerificationStatus = 'unverified' | 'verified' | 'failed' | 'partial';

export interface FlowVerificationProfile {
  status: FlowVerificationStatus;
  baseUrl: string;
  verifiedAt?: string;
  failedStepOrder?: number;
  expectedRoute?: string;
  actualRoute?: string;
  artifactPath?: string;
  message?: string;
}

export interface PageRecord {
  id: string;
  route: string;
  title: string;
  description?: string;
  roleIds: string[];
  elementIds: string[];
  featureIds: string[];
  flowIds: string[];
  factIds: string[];
  status: RecordStatus;
}

export interface FeatureRecord {
  id: string;
  title: string;
  description?: string;
  pageIds: string[];
  roleIds: string[];
  elementIds: string[];
  flowIds: string[];
  factIds: string[];
  status: RecordStatus;
}

export interface FlowStep {
  order: number;
  title: string;
  description?: string;
  elementId?: string;
  route?: string;
  factIds: string[];
}

export interface FlowRecord {
  id: string;
  title: string;
  description?: string;
  steps: FlowStep[];
  roleIds: string[];
  pageIds: string[];
  factIds: string[];
  status: RecordStatus;
  verification?: FlowVerificationProfile;
}

export interface ElementRecord {
  id: string;
  pageId: string;
  selector: string;
  label?: string;
  role?: string;
  handlerName?: string;
  factIds: string[];
}
