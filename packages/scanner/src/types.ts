/**
 * @autoguide/scanner — source scan result types.
 */

export interface RouteCandidate {
  route: string;
  filePath: string;
}

export interface SourceElementFact {
  filePath: string;
  componentName?: string;
  handlerName?: string;
  dataDocKey?: string;
  dataDocValue?: string;
  missingAriaLabel?: boolean;
  line?: number;
}

export interface SourceScanResult {
  routes: RouteCandidate[];
  elements: SourceElementFact[];
}
