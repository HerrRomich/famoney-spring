import { Directive, Input } from '@angular/core';

import { RouterLink } from '@angular/router';

@Directive({ selector: 'fm-router-tab-item' })
export class RouterTabItemDirective {
  @Input()
  public routerLink?: RouterLink;

  @Input()
  public routerLinkActiveOptions?: {
    exact: boolean;
  };

  @Input()
  public disabled?: boolean;

  @Input()
  public label?: string;
}
