import { MaterialModule } from './shared/modules/material.module';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularModule } from '@famoney-shared/modules/angular.module';
import { ApisModule } from '@famoney-shared/modules/apis.module';
import { SharedModule } from '@famoney-shared/modules/shared.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularModule,
    MaterialModule,
    ApisModule,
    SharedModule
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
