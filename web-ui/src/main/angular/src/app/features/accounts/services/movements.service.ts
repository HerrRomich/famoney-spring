import { Injectable } from '@angular/core';
import { MovementEventDto } from '@famoney-apis/account-events';
import { AccountsApiService, Configuration as AccountsApiConfiguration, EntryDataDto } from '@famoney-apis/accounts';
import { ServerEventsService } from '@famoney-shared/services/server-events.service';
import { processServerResponse } from '@famoney-shared/utils/stream-operators.utils';
import { NotificationsService } from 'angular2-notifications';
import * as moment from 'moment';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MovementsService {
  constructor(
    private _accountsApiService: AccountsApiService,
    private _accountsApiConfiguration: AccountsApiConfiguration,
    private _serverEventsService: ServerEventsService,
    private notificationsService: NotificationsService,
  ) {}

  getMovements(accountId: number, offset: number, limit: number) {
    return this._accountsApiService
      .getMovements(accountId, offset, limit, 'response')
      .pipe(processServerResponse(this.notificationsService));
  }

  getMovementsChangeEventsByAccountId(accountId: number) {
    return this._serverEventsService
      .connectToServer<MovementEventDto>(
        `${this._accountsApiConfiguration.basePath}/accounts/${accountId}/movements/events`,
      )
      .pipe(
        filter(value => value.accountId === accountId),
        map(value => moment(value.timestamp)),
      );
  }

  addMovement(accountId: number, entryData: EntryDataDto) {
    return this._accountsApiService
      .addMovement(accountId, entryData, 'response')
      .pipe(processServerResponse(this.notificationsService));
  }
  changeMovement(accountId: number, movementId: number, entryData: EntryDataDto) {
    return this._accountsApiService
      .changeMovement(accountId, movementId, entryData, 'response')
      .pipe(processServerResponse(this.notificationsService));
  }
}
