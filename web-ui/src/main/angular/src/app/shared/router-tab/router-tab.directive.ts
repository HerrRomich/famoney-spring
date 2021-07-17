import { Directive, Input } from '@angular/core';

import { MatTab } from '@angular/material/tabs';

import { RouterLink } from '@angular/router';

@Directive({
  selector: 'mat-tab[routerLink]',
})
export class RouterTabDirective {
  @Input()
  public routerLinkActiveOptions?: {
    exact: boolean;
  };

  constructor(public tab: MatTab, public routerLink: RouterLink) {}
}
