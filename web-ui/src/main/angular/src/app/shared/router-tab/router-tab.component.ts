import {
  Component,
  ViewEncapsulation,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ContentChildren,
  QueryList,
  ViewChildren,
} from '@angular/core';

import { MatTabGroup } from '@angular/material/tabs';

import { Subscription } from 'rxjs';

import { Router, NavigationEnd } from '@angular/router';
import { RouterTabItemDirective } from './router-tab-item.directive';
import { RouterTabDirective } from './router-tab.directive';

@Component({
  selector: 'fm-router-tab',
  templateUrl: './router-tab.component.html',
  styleUrls: ['./router-tab.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class RouterTabComponent implements AfterViewInit, OnDestroy {
  @ViewChild('matTabGroup', { static: true })
  public matTabGroup!: MatTabGroup;

  @ContentChildren(RouterTabItemDirective)
  public routerTabItems!: QueryList<RouterTabItemDirective>;

  @ViewChildren(RouterTabDirective)
  public routerTabs!: QueryList<RouterTabDirective>;

  private _subscription?: Subscription;

  constructor(private router: Router) {}

  ngAfterViewInit() {
    // Remove tab click event
    this.matTabGroup._handleClick = () => {};
    // Select current tab depending on url
    this.setIndex();
    // Subscription to navigation change
    this._subscription = this.router.events.subscribe(e => {
        if (e instanceof NavigationEnd) {
          this.setIndex();
        }
      });
  }

  ngOnDestroy(): void {
    this._subscription?.unsubscribe();
  }

  /**
   * Set current selected tab depending on navigation
   */
  private setIndex() {
    this.routerTabs.find((tab, i) => {
      if (
        !this.router.isActive(
          tab.routerLink.urlTree,
          tab.routerLinkActiveOptions ? tab.routerLinkActiveOptions.exact : false,
        )
      ) {
        return false;
      }
      tab.tab.isActive = true;
      this.matTabGroup.selectedIndex = i;
      return true;
    });
  }
}
