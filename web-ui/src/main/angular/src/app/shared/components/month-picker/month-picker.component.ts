import { Component, OnInit } from '@angular/core';
import { MatDatepicker, MAT_SINGLE_DATE_SELECTION_MODEL_PROVIDER } from '@angular/material/datepicker';
import { MonthCalendarHeaderComponent } from './month-calendar-header.component';

@Component({
  selector: 'fm-monthpicker',
  template: '',
  providers: [
    MAT_SINGLE_DATE_SELECTION_MODEL_PROVIDER,
  ],
})
export class MonthPickerComponent<D> extends MatDatepicker<D> implements OnInit {
  ngOnInit() {
    this.startView = 'year';
    this.calendarHeaderComponent = MonthCalendarHeaderComponent;
  }

  _selectMonth(normalizedMonth: D) {
    super._selectMonth(normalizedMonth);
    this.select(normalizedMonth);
    this.close();
  }
}
