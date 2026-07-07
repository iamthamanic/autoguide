/**
 * @autoguide/angular — Inspector overlay for dev-mode element inspection.
 */

import { Component, inject } from '@angular/core';
import { scanDom } from '@autoguide/runtime';
import type { RuntimeElement } from '@autoguide/runtime';
import { AutoGuideContextService } from './context.js';

@Component({
  selector: 'ag-inspector-overlay',
  standalone: true,
  template: `
    @if (ctx.mode === 'development') {
      <button
        type="button"
        (click)="toggleInspector()"
        [style.background]="active ? '#1d4ed8' : '#64748b'"
        style="position: fixed; right: 24px; bottom: 88px; z-index: 9999; padding: 8px 12px; border-radius: 8px; border: none; color: #fff; cursor: pointer"
      >
        Inspector
      </button>
      @if (active) {
        <div
          style="position: fixed; inset: 0; z-index: 9998; cursor: crosshair"
          (mouseover)="onMouseOver($event)"
          (click.capture)="onClickCapture($event)"
        ></div>
      }
      @if (selected) {
        <div
          style="position: fixed; right: 24px; bottom: 140px; width: 320px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; z-index: 9999"
        >
          <strong>Element</strong>
          <p style="margin: 8px 0 0; font-size: 14px">{{ selected.label ?? selected.selector }}</p>
          <p style="margin: 4px 0 0; color: #64748b; font-size: 12px">{{ selected.selector }}</p>
        </div>
      }
    }
  `,
})
export class InspectorOverlayComponent {
  protected readonly ctx = inject(AutoGuideContextService);

  active = false;
  selected: RuntimeElement | null = null;

  toggleInspector(): void {
    this.active = !this.active;
    this.selected = null;
  }

  onMouseOver(event: MouseEvent): void {
    if (!this.active) return;
    event.stopPropagation();
    const target = event.target as HTMLElement;
    target.style.outline = '2px solid #2563eb';
  }

  onClickCapture(event: Event): void {
    if (!this.active) return;
    const mouseEvent = event as MouseEvent;
    mouseEvent.preventDefault();
    mouseEvent.stopPropagation();
    const target = mouseEvent.target as HTMLElement;
    const snapshot = scanDom(document, window.location.pathname);
    const match = snapshot.elements.find((el) => target.matches(el.selector));
    this.selected = match ?? null;
    this.active = false;
  }
}
