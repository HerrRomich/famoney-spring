import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { HttpClientModule } from '@angular/common/http';

const ANGULAR_MODULES = [
  FormsModule,
  CommonModule,
  RouterModule,
  ReactiveFormsModule,
  ScrollingModule,
  HttpClientModule,
];

@NgModule({
  imports: ANGULAR_MODULES,
  exports: [...ANGULAR_MODULES],
  providers:[
    {
      provide: DecimalPipe
    }
  ]
})
export class AngularModule {}
