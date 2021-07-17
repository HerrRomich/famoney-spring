import { RouterTabComponent } from './router-tab.component';
import { RouterTabItemDirective } from './router-tab-item.directive';
import { RouterTabDirective } from './router-tab.directive';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  imports: [CommonModule, RouterModule, MatTabsModule],
  declarations: [RouterTabComponent, RouterTabItemDirective, RouterTabDirective],
  exports: [RouterTabComponent, RouterTabItemDirective, RouterTabDirective],
})
export class RouterTabModule {}
