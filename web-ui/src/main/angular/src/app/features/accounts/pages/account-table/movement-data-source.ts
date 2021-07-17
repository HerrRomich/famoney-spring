import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { MovementEventDto } from '@famoney-apis/account-events';
import { AccountDto, MovementDto } from '@famoney-apis/accounts';
import { MovementsService } from '@famoney-features/accounts/services/movements.service';
import * as moment from 'moment';
import { MultiRange, multirange } from 'multi-integer-range';
import { EMPTY, Observable, of } from 'rxjs';
import { map, mergeMap, startWith, switchMap, tap } from 'rxjs/operators';

const PAGE_SIZE = 150;
const PAGE_BUFFER = 50;

export interface Movement {}

export class MovementDataSource extends DataSource<MovementDto | undefined> {
  private _data: (MovementDto | undefined)[] = [];
  private _loadedData: MultiRange = new MultiRange();

  constructor(private _movementsService: MovementsService, private _account$: Observable<AccountDto>) {
    super();
  }

  connect(collectionViewer: CollectionViewer): Observable<(MovementDto | undefined)[]> {
    return this._account$.pipe(
      tap(accountDTO => {
        this._data = new Array<MovementDto>(accountDTO.movementCount);
        this._loadedData = multirange();
      }),
      switchMap(account =>
        collectionViewer.viewChange.pipe(
          startWith({
            start: 0,
            end: PAGE_SIZE + PAGE_BUFFER,
          }),
          map(range => {
            const rangeStart = range.start - PAGE_BUFFER;
            const rangeEnd = range.end + PAGE_BUFFER;
            return multirange([[rangeStart, rangeEnd]])
              .intersect([[0, this._data.length - 1]])
              .subtract(this._loadedData);
          }),
          mergeMap(requieredRange => {
            if (requieredRange.length() > 0) {
              const rangeStart = requieredRange.min() ?? 0;
              const rangeEnd = requieredRange.max() ?? this._data.length - 1;
              return account?.id
                ? this._movementsService.getMovements(account?.id, rangeStart, rangeEnd - rangeStart + 1).pipe(
                    map(([, movements]) => {
                      this._data.splice(rangeStart, movements.length, ...movements);
                      this._loadedData = this._loadedData.append([[rangeStart, rangeEnd]]);
                      return this._data;
                    }),
                  )
                : EMPTY;
            } else {
              return of(this._data);
            }
          }, 3),
          startWith(this._data),
        ),
      ),
    );
  }

  disconnect(collectionViewer: CollectionViewer): void {}

}
