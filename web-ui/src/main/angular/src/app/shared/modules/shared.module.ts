import { registerLocaleData } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import localeEn from '@angular/common/locales/en';
import localeRu from '@angular/common/locales/ru';
import { LOCALE_ID, NgModule } from '@angular/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { LocaleService } from '@famoney-shared/services/locale.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { FocusHighlightDirective } from './../directives/focus-highlight.directive';

@NgModule({
  declarations: [FocusHighlightDirective],
  imports: [
    SimpleNotificationsModule.forRoot({
      timeOut: 5000,
    }),
    TranslateModule.forRoot({
      defaultLanguage: 'ru',
      loader: {
        provide: TranslateLoader,
        useFactory: (httpClient: HttpClient) => new TranslateHttpLoader(httpClient, 'assets/i18n/'),
        deps: [HttpClient],
      },
    }),
  ],
  exports: [SimpleNotificationsModule, TranslateModule, FocusHighlightDirective],
  providers: [
    LocaleService,
    {
      provide: LOCALE_ID,
      useFactory: (localeService: LocaleService) => {
        return localeService.locale;
      },
      deps: [LocaleService],
    },
  ],
})
export class SharedModule {
  constructor() {
    registerLocaleData(localeEn);
    registerLocaleData(localeRu);
  }
}
