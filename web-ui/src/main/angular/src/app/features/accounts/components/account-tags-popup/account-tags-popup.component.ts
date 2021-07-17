import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { FormControl } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { map, startWith } from 'rxjs/operators';
import { AccountsService } from '@famoney-features/accounts/services/accounts.service';

@Component({
  selector: 'fm-account-tags-popup',
  templateUrl: 'account-tags-popup.component.html',
  styleUrls: ['account-tags-popup.component.scss'],
})
export class AccountTagsPopupComponent {
  separatorKeysCodes: number[] = [ENTER, COMMA];
  public filtersAccountTags$: Observable<string[]>;
  @ViewChild('tagsInput', { static: true }) tagsInput!: ElementRef<HTMLInputElement>;
  tagsCtrl = new FormControl();
  @ViewChild('tagAutoComplete', { static: true }) matAutocomplete!: MatAutocomplete;

  constructor(public accountsService: AccountsService) {
    this.filtersAccountTags$ = combineLatest([
      this.accountsService.getTags(),
      this.tagsCtrl.valueChanges.pipe(
        startWith(''),
        map(filterValue => (filterValue instanceof String ? filterValue.toLowerCase() : '')),
      ),
    ]).pipe(map(([tagsList, filterValue]) => tagsList.filter(tag => tag.toLowerCase().includes(filterValue))));
  }

  selectTag(event: MatAutocompleteSelectedEvent) {
    this.accountsService.addTagToSelection(event.option.viewValue);
    this.tagsInput.nativeElement.value = '';
    this.tagsCtrl.setValue(null);
  }

  addTag(event: MatChipInputEvent) {
    if (this.matAutocomplete.isOpen) {
      return;
    }
    const input = event.input;
    const value = event.value;
    if (this.matAutocomplete.options.filter(option => option.value === value.trim()).length !== 1) {
      return;
    }
    this.accountsService.addTagToSelection(value.trim());
    if (input) {
      input.value = '';
    }
    this.tagsCtrl.setValue(null);
  }

  removeTag(tag: string) {
    this.accountsService.removeTagFromSelection(tag);
  }

  clearTags() {
    this.accountsService.clearSelectedTags();
  }
}
