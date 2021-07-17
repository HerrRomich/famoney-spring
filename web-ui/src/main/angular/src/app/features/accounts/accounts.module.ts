import { MaterialModule } from './../../shared/modules/material.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer } from '@angular/platform-browser';
import { EcoFabSpeedDialModule } from '@ecodev/fab-speed-dial';
import { MonthPickerModule } from '@famoney-shared/components/month-picker.module';
import { AngularModule } from '@famoney-shared/modules/angular.module';
import { SharedModule } from '@famoney-shared/modules/shared.module';
import { IConfig, NgxMaskModule } from 'ngx-mask';
import { RouterTabModule } from 'src/app/shared/router-tab/router-tab.module';
import { AccountsRoutingModule } from './accounts-routing.module';
import { AccountEntryDialogComponent } from './components/account-entry-dialog';
import { AccountTagsPopupComponent } from './components/account-tags-popup';
import { EntryItemComponent } from './components/entry-item';
import { AccountTableComponent } from './pages/account-table';
import { AccountsComponent } from './pages/accounts/accounts.component';

export const options: Partial<IConfig> | (() => Partial<IConfig>) = {
  decimalMarker: '.',
};

@NgModule({
  declarations: [
    AccountsComponent,
    AccountTableComponent,
    AccountTagsPopupComponent,
    AccountEntryDialogComponent,
    EntryItemComponent,
  ],
  imports: [
    AngularModule,
    MaterialModule,
    SharedModule,
    EcoFabSpeedDialModule,
    OverlayModule,
    RouterTabModule,
    MonthPickerModule,
    NgxMaskModule.forRoot(options),
    DragDropModule,
  ],
  exports: [AccountsRoutingModule],
})
export class AccountsModule {
  constructor(private matIconRegistry: MatIconRegistry, private domSanitzer: DomSanitizer) {
    this.matIconRegistry.addSvgIcon(
      'menu-down',
      this.domSanitzer.bypassSecurityTrustResourceUrl('assets/menu-down.svg'),
    );
  }
}
