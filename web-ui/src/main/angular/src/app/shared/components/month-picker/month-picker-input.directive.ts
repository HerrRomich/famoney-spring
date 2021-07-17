import { Directive, forwardRef, Input } from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  MatDatepicker, MatDatepickerInput
} from '@angular/material/datepicker';
import { MAT_INPUT_VALUE_ACCESSOR } from '@angular/material/input';

export const APP_MONTHPICKER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MonthpickerInputDirective),
  multi: true,
};

export const APP_MONTHPICKER_VALIDATORS: any = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => MonthpickerInputDirective),
  multi: true,
};

@Directive({
  selector: 'input[fmMonthpicker]',
  providers: [
    APP_MONTHPICKER_VALUE_ACCESSOR,
    APP_MONTHPICKER_VALIDATORS,
    { provide: MAT_INPUT_VALUE_ACCESSOR, useExisting: MonthpickerInputDirective },
  ],
  host: {
    'aria-haspopup': 'dialog',
    '[attr.aria-owns]': '(_datepicker?.opened && _datepicker.id) || null',
    '[attr.min]': 'min ? _dateAdapter.toIso8601(min) : null',
    '[attr.max]': 'max ? _dateAdapter.toIso8601(max) : null',
    '[disabled]': 'disabled',
    '(input)': '_onInput($event.target.value)',
    '(change)': '_onChange()',
    '(blur)': '_onBlur()',
    '(keydown)': '_onKeydown($event)',
  },
  exportAs: 'fmMonthpickerInput',
})
export class MonthpickerInputDirective<D> extends MatDatepickerInput<D> {
  @Input()
  set fmMonthpicker(value: MatDatepicker<D>) {
    this.matDatepicker = value;
  }
}
