import { CdkVirtualScrollViewport, VIRTUAL_SCROLL_STRATEGY } from '@angular/cdk/scrolling';
import { AfterViewInit, Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { EcoFabSpeedDialActionsComponent, EcoFabSpeedDialComponent } from '@ecodev/fab-speed-dial';
import { MovementEventDto } from '@famoney-apis/account-events';
import { AccountDto, MovementDto } from '@famoney-apis/accounts';
import { AccountsService } from '@famoney-features/accounts/services/accounts.service';
import { EntryCategoryService } from '@famoney-shared/services/entry-category.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationsService } from 'angular2-notifications';
import * as moment from 'moment';
import { Moment } from 'moment';
import { BehaviorSubject, EMPTY, iif, merge, of, Subject, Subscription } from 'rxjs';
import {
  debounceTime,
  delay,
  filter,
  map,
  pairwise,
  retryWhen,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
import { AccountEntryDialogComponent } from '../../components/account-entry-dialog';
import { EntryDialogData } from '../../models/account-entry.model';
import { MovementsService } from '../../services/movements.service';
import { AccountMovementsViertualScrollStrategy } from './account-movements.virtual-scroller-strategy';
import { MovementDataSource } from './movement-data-source';

const fabSpeedDialDelayOnHover = 350;

@Component({
  selector: 'fm-account-table',
  templateUrl: 'account-table.component.html',
  styleUrls: ['account-table.component.scss'],
  providers: [
    {
      provide: VIRTUAL_SCROLL_STRATEGY,
      useClass: AccountMovementsViertualScrollStrategy,
    },
  ],
})
export class AccountTableComponent implements AfterViewInit, OnDestroy {
  movementDataSource: MovementDataSource;

  @ViewChild('fabSpeedDial', { static: true })
  fabSpeedDial: EcoFabSpeedDialComponent | undefined;

  @ViewChild('fabSpeedDialActions', { static: true })
  fabSpeedDialActions: EcoFabSpeedDialActionsComponent | undefined;

  @ViewChild(CdkVirtualScrollViewport)
  viewPort!: CdkVirtualScrollViewport;

  private _updateTrigger = new Subject<Moment>();
  private _speedDialHovered$ = new Subject<boolean>();

  private _speedDialTriggerSubscription?: Subscription;

  private _fabSpeedDialOpenChangeSubbscription?: Subscription;
  private _accountDTO?: AccountDto;

  constructor(
    private _route: ActivatedRoute,
    private _accountsService: AccountsService,
    private _movementsService: MovementsService,
    private _accountEntryDialogComponent: MatDialog,
    private _entryCategoriesService: EntryCategoryService,
    private _notificationsService: NotificationsService,
    private _translateService: TranslateService,
    @Inject(VIRTUAL_SCROLL_STRATEGY)
    private _accountMovementsViertualScrollStrategy: AccountMovementsViertualScrollStrategy,
  ) {
    const account$ = this._route.paramMap.pipe(
      map(params => Number.parseInt(params.get('accountId') ?? '', 10)),
      tap(() => (this._accountDTO = undefined)),
      filter(accountId => accountId !== NaN),
      switchMap(accountId => {
        let prevTimestamp = moment();
        return merge(this._updateTrigger, this._movementsService.getMovementsChangeEventsByAccountId(accountId)).pipe(
          map(timestamp => ['subsequent', timestamp] as const),
          startWith(['initial', moment(0)] as const),
          switchMap(([round, timestamp]) => {
            if (round === 'initial' || timestamp.isAfter(prevTimestamp)) {
              return this._accountsService.getAccount(accountId).pipe(
                tap(([operationTimestamp, accountDTO]) => {
                  prevTimestamp = operationTimestamp;
                  if (round === 'initial') {
                    this._accountDTO = accountDTO;
                    this._accountMovementsViertualScrollStrategy.switchAccount(
                      operationTimestamp,
                      accountDTO.movementCount,
                    );
                  }
                }),
              );
            } else {
              return EMPTY;
            }
          }),
        );
      }),
      map(([, accountDTO]) => accountDTO),
      shareReplay(1),
    );
    this.movementDataSource = new MovementDataSource(this._movementsService, account$);
  }

  ngAfterViewInit() {
    this._fabSpeedDialOpenChangeSubbscription = this.fabSpeedDial!.openChange.pipe(
      tap(opened => {
        this.fabSpeedDial!.fixed = !opened;
      }),
    ).subscribe();

    this._speedDialTriggerSubscription = this._speedDialHovered$
      .pipe(
        debounceTime(fabSpeedDialDelayOnHover),
        tap(hovered => {
          this.fabSpeedDial!.open = hovered;
        }),
      )
      .subscribe();
  }

  ngOnDestroy() {
    this._fabSpeedDialOpenChangeSubbscription?.unsubscribe();
    this._speedDialTriggerSubscription?.unsubscribe();
  }

  get inverseTranslation(): string {
    if (!this.viewPort || !this.viewPort['_renderedContentTransform']) {
      return '-0px';
    }
    return `-${this.viewPort['_renderedContentOffset']}px`;
  }

  triggerSpeedDial() {
    this._speedDialHovered$.next(true);
  }

  stopSpeedDial() {
    this._speedDialHovered$.next(false);
  }

  getMovementComments(movement?: MovementDto) {
    switch (movement?.data?.type) {
      case 'entry':
        const entryItems = movement?.data?.entryItems ?? [];
        return entryItems.length === 1 ? entryItems[0].comments : undefined;
      case 'refund':
      case 'transfer':
        return movement?.data?.comments;
    }
  }

  getMovementCategoryPath$(movement?: MovementDto) {
    switch (movement?.data?.type) {
      case 'entry':
        const entryItems = movement?.data?.entryItems ?? [];
        return entryItems.length === 1 ? this.getCategoryPathById$(entryItems[0].categoryId) : EMPTY;
      case 'refund':
        return this.getCategoryPathById$(movement?.data?.categoryId);
      default:
        return EMPTY;
    }
  }

  private getCategoryPathById$(categoryId: number) {
    return this._entryCategoriesService.entryCategoriesForVisualisation$.pipe(
      map(entryCategories => entryCategories.flatEntryCategories.get(categoryId)?.fullPath),
    );
  }

  addEntry() {
    this.stopSpeedDial();
    if (this._accountDTO === undefined) {
      this.showNoAccountErrorNotification();
      return;
    }
    const accountId = this._accountDTO.id;
    this.openAccountEntryDialog({
      accountId: accountId,
    })
      .pipe(
        tap(value => {
          if (value) {
            const [operationTimestamp, movement] = value;
            const movementEvent: MovementEventDto = {
              event: 'movementAdd',
              accountId: accountId,
              timestamp: operationTimestamp.format(),
              position: movement.position,
              movementData: movement.data,
            };
            this._updateTrigger.next(moment(movementEvent.timestamp));
            this._accountMovementsViertualScrollStrategy.scrollToIndex(movementEvent.position, 'smooth');
          }
        }),
      )
      .subscribe();
  }

  private showNoAccountErrorNotification() {
    this._translateService
      .get(['notifications.title.error', 'accounts.table.errors.noAccount'])
      .pipe(
        tap((errorMesages: { [key: string]: string }) =>
          this._notificationsService.error(
            errorMesages['notifications.title.error'],
            errorMesages['accounts.table.errors.noAccount'],
          ),
        ),
      )
      .subscribe();
  }

  private openAccountEntryDialog(data: EntryDialogData) {
    const accountEntryDialogRef = this._accountEntryDialogComponent.open<
      AccountEntryDialogComponent,
      EntryDialogData,
      [Moment, MovementDto]
    >(AccountEntryDialogComponent, {
      width: '520px',
      minWidth: '520px',
      maxWidth: '520px',
      panelClass: 'account-entry-dialog',
      disableClose: true,
      hasBackdrop: true,
      data: data,
    });
    return accountEntryDialogRef.afterClosed();
  }

  addTransfer() {
    console.log('Add transfer.');
  }

  addRefund() {
    console.log('Add refund.');
  }

  edit(movement: MovementDto) {
    if (this._accountDTO === undefined) {
      this.showNoAccountErrorNotification();
      return;
    }
    const accountId = this._accountDTO.id;
    if (movement.data?.type === 'entry') {
      this.openAccountEntryDialog({
        accountId: accountId,
        movementId: movement.id,
        entryData: movement.data,
      })
        .pipe(
          tap(value => {
            if (value) {
              const [operationTimestamp, movement] = value;
              const movementEvent: MovementEventDto = {
                event: 'movementAdd',
                accountId: accountId,
                timestamp: operationTimestamp.format(),
                position: movement.position,
                movementData: movement.data,
              };
              this._updateTrigger.next(moment(movementEvent.timestamp));
              this._accountMovementsViertualScrollStrategy.scrollToIndex(movementEvent.position, 'smooth');
            }
          }),
        )
        .subscribe();
    }
  }
}
