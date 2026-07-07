/**
 * @autoguide/angular — root provider for host applications.
 */

import { Component, Input, OnChanges, OnInit, inject } from '@angular/core';
import type { Fact, FlowRecord, PageRecord, VisibilityMode } from '@autoguide/core';
import { AutoGuideContextService } from './context.js';

@Component({
  selector: 'ag-autoguide-provider',
  standalone: true,
  template: '<ng-content />',
  providers: [AutoGuideContextService],
})
export class AutoGuideProviderComponent implements OnInit, OnChanges {
  private readonly ctx = inject(AutoGuideContextService);

  @Input({ required: true }) appId!: string;
  @Input() userRole?: string;
  @Input() mode: VisibilityMode = 'development';
  @Input() route = typeof window !== 'undefined' ? window.location.pathname : '/';
  @Input() facts: Fact[] = [];
  @Input() pages: PageRecord[] = [];
  @Input() flows: FlowRecord[] = [];

  ngOnInit(): void {
    this.syncContext();
  }

  ngOnChanges(): void {
    this.syncContext();
  }

  private syncContext(): void {
    this.ctx.appId = this.appId;
    this.ctx.userRole = this.userRole;
    this.ctx.mode = this.mode;
    this.ctx.route = this.route;
    this.ctx.facts = this.facts;
    this.ctx.pages = this.pages;
    this.ctx.flows = this.flows;
  }
}

export type AutoGuideProviderProps = {
  appId: string;
  userRole?: string;
  mode?: VisibilityMode;
  route?: string;
  facts?: Fact[];
  pages?: PageRecord[];
  flows?: FlowRecord[];
};
