import { Component, ChangeDetectionStrategy } from '@angular/core';

import { MatCalendarHeader } from '@angular/material/datepicker';

@Component({
  selector: 'fm-month-calendar-header',
  template: `
    <div class="mat-calendar-header">
      <div class="mat-calendar-controls">
        <button
          mat-button
          type="button"
          class="mat-calendar-period-button"
          (click)="currentPeriodClicked()"
          [attr.aria-label]="periodButtonLabel"
          cdkAriaLive="polite"
        >
          {{ periodButtonText }}
          <div class="mat-calendar-arrow" [class.mat-calendar-invert]="calendar.currentView != 'month'"></div>
        </button>

        <div class="mat-calendar-spacer"></div>

        <ng-content></ng-content>

        <button
          mat-icon-button
          type="button"
          class="mat-calendar-previous-button"
          [disabled]="!previousEnabled()"
          (click)="previousClicked()"
          [attr.aria-label]="prevButtonLabel"
        ></button>

        <button
          mat-icon-button
          type="button"
          class="mat-calendar-next-button"
          [disabled]="!nextEnabled()"
          (click)="nextClicked()"
          [attr.aria-label]="nextButtonLabel"
        ></button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthCalendarHeaderComponent<D> extends MatCalendarHeader<D> {
  currentPeriodClicked(): void {
    this.calendar.currentView = this.calendar.currentView === 'year' ? 'multi-year' : 'year';
  }
}
