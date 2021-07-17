import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ApiErrorDto } from '@famoney-apis/accounts';
import { NotificationsService } from 'angular2-notifications';
import * as moment from 'moment';
import { Moment } from 'moment';
import { EMPTY, OperatorFunction } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export function processServerResponse<T>(
  notificationsService?: NotificationsService,
): OperatorFunction<HttpResponse<T>, [Moment, T]> {
  return input$ =>
    input$.pipe(
      map(response => {
        if (response.ok && response.body) {
          const operationTimestamp = moment(response.headers.get('fm-operation-timestamp'));
          const result: [Moment, T] = [operationTimestamp, response.body];
          return result;
        } else {
          throw new HttpErrorResponse({
            ...response,
            error: response.body,
            url: response.url || undefined,
          });
        }
      }),
      catchError(err => {
        const appError: ApiErrorDto = err.error;
        notificationsService?.error('Error', appError.description);
        return EMPTY;
      }),
    );
}
