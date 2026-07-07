/**
 * @autoguide/angular — Help Widget with context resolution and search.
 */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { resolveHelpContext, searchKnowledge } from '@autoguide/core';
import { AutoGuideContextService } from './context.js';

@Component({
  selector: 'ag-autoguide-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <button
      type="button"
      aria-label="Hilfe öffnen"
      (click)="open = !open"
      [ngStyle]="fabStyle"
    >
      ?
    </button>
    @if (open) {
      <div role="dialog" aria-label="AutoGuide Hilfe" [ngStyle]="panelStyle">
        <h2 style="margin: 0 0 8px; font-size: 16px">
          Hilfe{{ helpContext.pageTitle ? ': ' + helpContext.pageTitle : '' }}
        </h2>
        <input
          type="search"
          placeholder="Suchen…"
          [(ngModel)]="query"
          style="width: 100%; margin-bottom: 12px; padding: 8px 10px; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 14px"
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
        } @else if (helpContext.actions.length === 0 && helpContext.flows.length === 0) {
          <p style="margin: 0; color: #64748b; font-size: 14px">
            Keine Dokumentation für diese Seite.
            @if (ctx.mode === 'development') {
              (Entwicklermodus)
            }
          </p>
        } @else {
          @if (helpContext.flows.length > 0) {
            <h3 style="margin: 0 0 6px; font-size: 14px">Abläufe</h3>
            <ul style="margin: 0 0 12px; padding-left: 18px; font-size: 14px">
              @for (flow of helpContext.flows; track flow.id) {
                <li>{{ flow.title }}</li>
              }
            </ul>
          }
          @if (helpContext.actions.length > 0) {
            <h3 style="margin: 0 0 6px; font-size: 14px">Aktionen</h3>
            <ul style="margin: 0; padding-left: 18px; font-size: 14px">
              @for (fact of helpContext.actions; track fact.id) {
                <li>
                  <strong>{{ fact.key }}</strong
                  >: {{ fact.value }}
                  @if (ctx.mode === 'development' && fact.confidence < 0.85) {
                    <span style="color: #b45309"> (unsicher)</span>
                  }
                </li>
              }
            </ul>
          }
        }
      </div>
    }
  `,
})
export class AutoGuideWidgetComponent {
  protected readonly ctx = inject(AutoGuideContextService);

  open = false;
  query = '';

  readonly fabStyle = {
    position: 'fixed',
    right: '24px',
    bottom: '24px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    border: 'none',
    background: '#2563eb',
    color: '#fff',
    cursor: 'pointer',
    zIndex: 9999,
  };

  readonly panelStyle = {
    position: 'fixed',
    right: '24px',
    bottom: '96px',
    width: '380px',
    maxWidth: 'calc(100vw - 48px)',
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
    padding: '16px',
    zIndex: 9999,
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

  get searchHits() {
    return searchKnowledge(this.query, this.ctx.pages, this.ctx.flows);
  }
}
