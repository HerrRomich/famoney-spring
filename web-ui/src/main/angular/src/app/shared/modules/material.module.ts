import { SharedModule } from '@famoney-shared/modules/shared.module';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { DateAdapter, MatNativeDateModule, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LocaleService } from '@famoney-shared/services/locale.service';

export const MY_FORMATS = {
  parse: {
    dateInput: 'L',
  },
  display: {
    dateInput: 'L',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

const MATERIAL_MODULES = [
  MatToolbarModule,
  MatIconModule,
  MatNativeDateModule,
  MatBadgeModule,
  MatMenuModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatTooltipModule,
  MatListModule,
  MatChipsModule,
  MatAutocompleteModule,
  MatInputModule,
  MatFormFieldModule,
  MatDatepickerModule,
  MatMomentDateModule,
  MatDialogModule,
  FlexLayoutModule,
];

@NgModule({
  imports: [SharedModule, ...MATERIAL_MODULES],
  exports: [...MATERIAL_MODULES],
  providers: [
    {
      provide: MAT_DATE_LOCALE,
      useFactory: (localeService: LocaleService) => {
        return localeService.locale;
      },
      deps: [LocaleService],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { strict: true } },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
  ]
})
export class MaterialModule {}
