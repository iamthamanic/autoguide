/**
 * @autoguide/angular — injectable context for AutoGuide runtime.
 */

import { Injectable } from '@angular/core';
import type { Fact, FlowRecord, PageRecord, VisibilityMode } from '@autoguide/core';

@Injectable()
export class AutoGuideContextService {
  appId = 'unknown';
  userRole?: string;
  mode: VisibilityMode = 'development';
  route = '/';
  facts: Fact[] = [];
  pages: PageRecord[] = [];
  flows: FlowRecord[] = [];
}

export function useAutoGuide(service: AutoGuideContextService): AutoGuideContextService {
  return service;
}
