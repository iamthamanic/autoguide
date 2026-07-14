/**
 * @iamthamanic/autoguide-angular — dev-only confidence and provenance badge for facts.
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Fact, VisibilityMode } from '@iamthamanic/autoguide-core';
import { getReviewBadgeState } from '@iamthamanic/autoguide-ui';

@Component({
  selector: 'ag-review-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (state.visible) {
      <span
        [title]="state.title"
        [ngStyle]="{
          marginLeft: '6px',
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(' + state.colorVar + ')'
        }"
        >({{ state.label }})</span
      >
    }
  `,
})
export class ReviewBadgeComponent {
  @Input({ required: true }) fact!: Fact;
  @Input({ required: true }) mode!: VisibilityMode;

  get state() {
    return getReviewBadgeState(this.fact, this.mode);
  }
}
