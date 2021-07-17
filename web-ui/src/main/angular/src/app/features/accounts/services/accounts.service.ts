import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AccountsApiService } from '@famoney-apis/accounts';
import { NotificationsService } from 'angular2-notifications';
import * as moment from 'moment';
import { BehaviorSubject, combineLatest, EMPTY, Observable, throwError } from 'rxjs';
import { catchError, map, shareReplay, takeWhile } from 'rxjs/operators';

const ACCOUNT_TAGS_STORAGE = 'ACCOUNT_TAGS_STORAGE';
const ACCOUNT_ID_STORAGE = 'ACCOUNT_ID_STORAGE';

export interface Account {
  id?: number;
  name: string;
  tags?: Array<string>;
  openDate: string;
  movementCount?: number;
  sum?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AccountsService {
  readonly selectedAccountTags$: BehaviorSubject<Set<string>>;

  readonly accounts$: Observable<Account[]>;

  private _selectedAccountId?: number;

  get selectedAccountId() {
    return this._selectedAccountId;
  }

  set selectedAccountId(newAccountId: number | undefined) {
    this._selectedAccountId = newAccountId;
    window.localStorage.setItem(ACCOUNT_ID_STORAGE, newAccountId?.toString(10) ?? '');
  }

  constructor(private _accountsApiService: AccountsApiService, private _notificationsService: NotificationsService) {
    let tags: string[] = [];
    if (window.localStorage) {
      tags = JSON.parse(window.localStorage.getItem(ACCOUNT_TAGS_STORAGE) ?? '[]');
      this.selectedAccountId = parseInt(window.localStorage.getItem(ACCOUNT_ID_STORAGE) ?? '', 10);
    }
    this.selectedAccountTags$ = new BehaviorSubject(new Set<string>(tags));
    this.accounts$ = this._accountsApiService.getAllAccounts().pipe(
      shareReplay(1),
      catchError(() => {
        this._notificationsService.error('Error', "Couldn't load list of accounts.");
        return EMPTY;
      }),
    );
  }

  getTags() {
    return combineLatest([this._accountsApiService.getAllAccountTags(), this.selectedAccountTags$]).pipe(
      map(([original, selected]) => Array.from(new Set(original.filter(tag => !selected.has(tag))))),
    );
  }

  addTagToSelection(tag: string) {
    this.transformStringSet(this.selectedAccountTags$, tagsSet => tagsSet.add(tag));
  }

  removeTagFromSelection(tag: string) {
    this.transformStringSet(this.selectedAccountTags$, tagsSet => {
      tagsSet.delete(tag);
      return tagsSet;
    });
  }

  clearSelectedTags() {
    this.transformStringSet(this.selectedAccountTags$, tagsSet => {
      tagsSet.clear();
      return tagsSet;
    });
  }

  private transformStringSet = (
    input: BehaviorSubject<Set<string>>,
    transformation: (input: Set<string>) => Set<string>,
  ) => {
    const newValue = transformation(input.value);
    if (window.localStorage) {
      window.localStorage.setItem(ACCOUNT_TAGS_STORAGE, JSON.stringify(Array.from(newValue)));
    }
    input.next(newValue);
  };

  getAccount(accountId: number) {
    return this._accountsApiService.getAccount(accountId, 'response').pipe(
      map(response => {
        if (response.ok && response.body) {
          const operationTimestamp = moment(response.headers.get('fm-operation-timestamp'));
          return [operationTimestamp, response.body] as const;
        } else {
          throw new HttpErrorResponse({
            ...response,
            error: response.body,
            url: response.url || undefined,
          });
        }
      }),
    );
  }
}
