/**
 * @iamthamanic/autoguide-angular — Help Widget with context resolution and search.
 */

import {
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { resolveHelpContext, searchKnowledge, explainHelpGap } from '@iamthamanic/autoguide-core';
import { agTokenCssVars, bindFocusTrap } from '@iamthamanic/autoguide-ui';
import { AutoGuideContextService } from './context.js';
import { FlowStepListComponent } from './flow-step-list.component.js';
import { PanelSkeletonComponent } from './panel-skeleton.component.js';
import { ReviewBadgeComponent } from './review-badge.component.js';

@Component({
  selector: 'ag-autoguide-widget',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FlowStepListComponent,
    PanelSkeletonComponent,
    ReviewBadgeComponent,
  ],
  template: `
    <div [ngStyle]="tokenVars">
      <button
        type="button"
        aria-label="Hilfe öffnen"
        [attr.aria-expanded]="open"
        (click)="toggleOpen()"
        [ngStyle]="fabStyle"
      >
        ?
      </button>
      @if (open) {
        <div
          #panel
          role="dialog"
          aria-label="AutoGuide Hilfe"
          [attr.aria-busy]="ctx.loading ? true : null"
          [ngStyle]="panelStyle"
        >
          <div style="display: flex; justify-content: space-between; align-items: center">
            <h2 style="margin: 0 0 8px; font-size: 16px; font-weight: 600">
              Hilfe{{ helpContext.pageTitle ? ': ' + helpContext.pageTitle : '' }}
            </h2>
            <button
              type="button"
              aria-label="Hilfe schließen"
              (click)="closePanel()"
              style="
                border: none;
                background: transparent;
                color: var(--ag-text-muted);
                cursor: pointer;
                font-size: 18px;
                line-height: 1;
              "
            >
              ×
            </button>
          </div>

          @if (ctx.error) {
            <div role="alert" style="font-size: 14px">
              <p style="margin: 0 0 12px; color: var(--ag-warning)">{{ ctx.error }}</p>
              @if (ctx.onRetry) {
                <button
                  type="button"
                  (click)="ctx.onRetry!()"
                  style="
                    padding: 8px 12px;
                    border-radius: var(--ag-radius);
                    border: 1px solid var(--ag-border);
                    background: var(--ag-surface-muted);
                    cursor: pointer;
                    font-size: 14px;
                  "
                >
                  Erneut versuchen
                </button>
              }
            </div>
          } @else if (ctx.loading) {
            <ag-panel-skeleton />
          } @else {
            <input
              type="search"
              placeholder="Suchen…"
              [(ngModel)]="query"
              style="
                width: 100%;
                margin-bottom: 12px;
                padding: 8px 10px;
                border-radius: 6px;
                border: 1px solid var(--ag-border);
                font-size: 14px;
                color: var(--ag-text);
              "
            />
            @if (query.trim()) {
              <ul style="margin: 0; padding-left: 18px; font-size: 14px">
                @if (searchHits.length === 0) {
                  <li>Keine Treffer.</li>
                } @else {
                  @for (hit of searchHits; track hit.kind + hit.id) {
                    <li><strong>{{ hit.title }}</strong> ({{ hit.kind }})</li>
                  }
                }
              </ul>
            } @else if (
              helpContext.actions.length === 0 &&
              helpContext.flows.length === 0 &&
              !(
                ctx.mode === 'development' &&
                helpContext.draftDigest &&
                (helpContext.draftDigest.samples.length > 0 ||
                  helpContext.draftDigest.pendingFactCount > 0)
              )
            ) {
              <div style="font-size: 14px">
                <p style="margin: 0; color: var(--ag-text-muted)">Keine Dokumentation für diese Seite.</p>
                @if (gapReasons.length > 0) {
                  <ul
                    style="margin: 10px 0 0; padding-left: 18px; color: var(--ag-text-muted); font-size: 13px; line-height: 1.45"
                  >
                    @for (reason of gapReasons; track reason.id) {
                      <li>{{ reason.message }}</li>
                    }
                  </ul>
                }
              </div>
            } @else if (
              helpContext.actions.length === 0 &&
              helpContext.flows.length === 0 &&
              helpContext.draftDigest
            ) {
              <div style="font-size: 14px">
                <p style="margin: 0; color: var(--ag-text-muted)">
                  Entwürfe vorhanden — noch nicht freigegeben.
                </p>
                <p style="margin: 8px 0 0; font-size: 13px; color: var(--ag-text-muted)">
                  {{ helpContext.draftDigest.pendingFactCount }} offene Fakten ·
                  {{ helpContext.draftDigest.pageCount }} Seiten ·
                  {{ helpContext.draftDigest.flowCount }} Abläufe
                </p>
              </div>
            } @else {
              @if (helpContext.flows.length > 0) {
                <h3 style="margin: 0 0 6px; font-size: 14px; font-weight: 600">Abläufe</h3>
                @for (flow of helpContext.flows; track flow.id) {
                  <div style="margin-bottom: 12px">
                    <p style="margin: 0 0 6px; font-size: 14px; font-weight: 600">{{ flow.title }}</p>
                    <ag-flow-step-list [flow]="flow" />
                  </div>
                }
              }
              @if (helpContext.actions.length > 0) {
                <h3 style="margin: 0 0 6px; font-size: 14px; font-weight: 600">Aktionen</h3>
                <ul style="margin: 0; padding-left: 18px; font-size: 14px">
                  @for (fact of helpContext.actions; track fact.id) {
                    <li>
                      <strong>{{ fact.key }}</strong
                      >: {{ fact.value }}
                      <ag-review-badge [fact]="fact" [mode]="ctx.mode" />
                    </li>
                  }
                </ul>
              }
            }
          }
        </div>
      }
    </div>
  `,
})
export class AutoGuideWidgetComponent implements OnDestroy {
  protected readonly ctx = inject(AutoGuideContextService);

  @ViewChild('panel') panelRef?: ElementRef<HTMLElement>;

  open = false;
  query = '';
  readonly tokenVars = agTokenCssVars();
  private focusCleanup?: () => void;

  readonly fabStyle = {
    position: 'fixed',
    right: '24px',
    bottom: '24px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    border: 'none',
    background: 'var(--ag-primary)',
    color: '#fff',
    cursor: 'pointer',
    zIndex: 9999,
    boxShadow: 'var(--ag-shadow)',
  };

  readonly panelStyle = {
    position: 'fixed',
    right: '24px',
    bottom: '96px',
    width: '380px',
    maxWidth: 'calc(100vw - 48px)',
    background: 'var(--ag-surface)',
    border: '1px solid var(--ag-border)',
    borderRadius: 'var(--ag-radius)',
    boxShadow: 'var(--ag-shadow)',
    padding: '16px',
    zIndex: 9999,
    color: 'var(--ag-text)',
  };

  get helpContext() {
    return resolveHelpContext(
      this.ctx.route,
      this.ctx.pages,
      this.ctx.flows,
      this.ctx.facts,
      this.ctx.mode,
      this.ctx.userRole,
    );
  }

  get gapReasons() {
    return explainHelpGap({
      mode: this.ctx.mode,
      route: this.ctx.route,
      pages: this.ctx.pages,
      flows: this.ctx.flows,
      facts: this.ctx.facts,
      userRole: this.ctx.userRole,
    });
  }

  get searchHits() {
    return searchKnowledge(this.query, this.ctx.pages, this.ctx.flows, this.ctx.userRole);
  }

  toggleOpen(): void {
    this.open = !this.open;
    if (this.open) {
      queueMicrotask(() => this.attachFocusTrap());
    } else {
      this.detachFocusTrap();
    }
  }

  closePanel(): void {
    this.open = false;
    this.detachFocusTrap();
  }

  ngOnDestroy(): void {
    this.detachFocusTrap();
  }

  private attachFocusTrap(): void {
    const el = this.panelRef?.nativeElement;
    if (!el) return;
    this.detachFocusTrap();
    this.focusCleanup = bindFocusTrap(el, () => this.closePanel());
  }

  private detachFocusTrap(): void {
    this.focusCleanup?.();
    this.focusCleanup = undefined;
  }
}
