import { CdkVirtualScrollViewport, FixedSizeVirtualScrollStrategy } from '@angular/cdk/scrolling';
import { Injectable } from '@angular/core';
import { Subject, Subscription, timer } from 'rxjs';
import { mergeMap, skipWhile, takeWhile, tap } from 'rxjs/operators';

@Injectable()
export class AccountMovementsViertualScrollStrategy extends FixedSizeVirtualScrollStrategy {
  private viewport?: CdkVirtualScrollViewport;
  private _accountSwitched$: Subject<number>;
  private dataLengthChangedProcessorSubscription: Subscription;

  constructor() {
    super(40, 600, 800);
    this._accountSwitched$ = new Subject();
    this.dataLengthChangedProcessorSubscription = this._accountSwitched$
      .pipe(
        tap(() => this.viewport?.scrollToIndex(0)),
        mergeMap(() =>
          timer(0, 50).pipe(
            skipWhile(() => this.viewport?.getRenderedRange().start !== 0),
            tap(() => this.viewport?.scrollToIndex(this.viewport?.getDataLength())),
            takeWhile(() => this.viewport?.getRenderedRange().end !== this.viewport?.getDataLength()),
          ),
        ),
      )
      .subscribe();
  }

  attach(viewport: CdkVirtualScrollViewport) {
    this.viewport = viewport;
    super.attach(viewport);
  }

  switchAccount(operationTimestamp: moment.Moment, movementCount: number) {
    this._accountSwitched$.next(movementCount);
  }

  detach() {
    this.dataLengthChangedProcessorSubscription.unsubscribe();
    super.detach();
  }
}
