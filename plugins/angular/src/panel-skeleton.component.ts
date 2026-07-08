/**
 * @autoguide/angular — loading skeleton for Help Widget panel.
 */

import { Component } from '@angular/core';

@Component({
  selector: 'ag-panel-skeleton',
  standalone: true,
  template: `
    <div aria-hidden="true">
      <div
        style="height: 12px; width: 70%; border-radius: 4px; background: var(--ag-surface-muted); margin-bottom: 10px"
      ></div>
      <div
        style="height: 12px; width: 100%; border-radius: 4px; background: var(--ag-surface-muted); margin-bottom: 10px"
      ></div>
      <div
        style="height: 12px; width: 85%; border-radius: 4px; background: var(--ag-surface-muted); margin-bottom: 10px"
      ></div>
    </div>
  `,
})
export class PanelSkeletonComponent {}
