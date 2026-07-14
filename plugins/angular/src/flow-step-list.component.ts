/**
 * @iamthamanic/autoguide-angular — numbered flow steps for Help Widget panel.
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { FlowRecord } from '@iamthamanic/autoguide-core';
import { listOrderedFlowSteps } from '@iamthamanic/autoguide-ui';

@Component({
  selector: 'ag-flow-step-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ol
      style="margin: 0 0 12px; padding-left: 0; list-style: none; font-size: 14px; color: var(--ag-text)"
    >
      @for (step of steps; track step.order) {
        <li style="display: flex; gap: 10px; margin-bottom: 8px; align-items: flex-start">
          <span
            aria-hidden="true"
            style="
              flex-shrink: 0;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: var(--ag-surface-muted);
              border: 1px solid var(--ag-border);
              display: inline-flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              font-weight: 600;
              color: var(--ag-primary);
            "
            >{{ step.order }}</span
          >
          <span>
            <strong>{{ step.title }}</strong>
            @if (step.description) {
              <span style="display: block; color: var(--ag-text-muted); font-size: 12px">{{
                step.description
              }}</span>
            }
          </span>
        </li>
      }
    </ol>
  `,
})
export class FlowStepListComponent {
  @Input({ required: true }) flow!: FlowRecord;

  get steps() {
    return listOrderedFlowSteps(this.flow);
  }
}
