import { getLocaleNumberSymbol, NumberSymbol } from '@angular/common';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { EntryCategoryDto } from '@famoney-apis/master-data/model/entry-category.dto';
import {
  EntryCategory,
  EntryCategoryService,
  FlatEntryCategory,
} from '@famoney-shared/services/entry-category.service';
import { LocaleService } from '@famoney-shared/services/locale.service';
import { TranslateService } from '@ngx-translate/core';
import { EMPTY, Observable } from 'rxjs';
import { debounceTime, map, startWith, switchMap } from 'rxjs/operators';

interface EntryCategoryWithFilterOption extends FlatEntryCategory {
  optionName: string;
}

interface EntryCategoriesForVisualisation {
  flatEntryCategories: Map<number, FlatEntryCategory>;
  expenses: EntryCategoryWithFilterOption[];
  incomes: EntryCategoryWithFilterOption[];
}

@Component({
  selector: 'fm-entry-item',
  templateUrl: 'entry-item.component.html',
  styleUrls: ['entry-item.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EntryItemComponent implements OnInit {
  @Input()
  formGroup?: FormGroup;

  entryCategories$: Observable<EntryCategoriesForVisualisation> = EMPTY;

  constructor(private entryCategoriesService: EntryCategoryService, private translateService: TranslateService) {}

  ngOnInit() {
    const entryCategoryValueChanges = this.formGroup?.get('categoryId')?.valueChanges ?? EMPTY;
    this.entryCategories$ = entryCategoryValueChanges.pipe(debounceTime(350)).pipe(
      startWith(''),
      map(value => (typeof value === 'string' ? value : '')),
      switchMap(filterValue =>
        this.entryCategoriesService.entryCategoriesForVisualisation$.pipe(
          map(entryCategories => {
            const filter = new RegExp(filterValue, 'i');
            return {
              flatEntryCategories: entryCategories.flatEntryCategories,
              expenses: this.filterCategories(filter, entryCategories.flatEntryCategories, entryCategories.expenses),
              incomes: this.filterCategories(filter, entryCategories.flatEntryCategories, entryCategories.incomes),
            };
          }),
        ),
      ),
    );
  }

  filterCategories(
    filter: RegExp,
    flatEntryCategories: Map<number, FlatEntryCategory>,
    entryCategories?: EntryCategoryDto[],
  ): EntryCategoryWithFilterOption[] {
    const filteredEntryCategories = entryCategories?.reduce((filteredCategories, entryCategory) => {
      const flattenEntryCategory = entryCategory.id ? flatEntryCategories.get(entryCategory.id) : undefined;
      const subCategories = this.filterCategories(filter, flatEntryCategories, entryCategory.children);
      if ((filter.test(entryCategory.name) || subCategories.length > 0) && flattenEntryCategory) {
        filteredCategories.push({
          ...flattenEntryCategory,
          optionName:
            entryCategory.name.match(filter)?.join().length ?? 0 > 0
              ? entryCategory.name.replace(filter, subString => `<mark>${subString}</mark>`)
              : entryCategory.name,
        });
        filteredCategories.push(...subCategories);
      }
      return filteredCategories;
    }, new Array<EntryCategoryWithFilterOption>());
    return filteredEntryCategories ?? [];
  }

  getCategoryName(categories: Map<number, EntryCategory>) {
    return (categoryId: number) => categories.get(categoryId)?.name;
  }

  getCategoryErrorMessage$() {
    const categoryControl = this.formGroup?.get('categoryId');
    if (categoryControl?.getError('required')) {
      return this.translateService.get('accounts.entryItem.fields.category.errors.required');
    }
  }

  getCategoryPath$() {
    const categoryId = this.formGroup?.get('categoryId')?.value as number;
    return this.entryCategories$.pipe(
      map(entryCategories => entryCategories.flatEntryCategories.get(categoryId)?.path),
    );
  }

  getAmountErrorMessage$() {
    const amountControl = this.formGroup?.get('amount');
    if (amountControl?.hasError('required')) {
      return this.translateService.get('accounts.entryItem.fields.amount.errors.required');
    } else if (amountControl?.hasError('wrongFormat')) {
      return this.translateService.get('accounts.entryItem.fields.amount.errors.wrongFormat');
    } else if (amountControl?.hasError('zeroValue')) {
      return this.translateService.get('accounts.entryItem.fields.amount.errors.zeroValue');
    }
  }

  getDecimalSeparator() {
    return getLocaleNumberSymbol(
      this.translateService.currentLang ?? this.translateService.defaultLang,
      NumberSymbol.Decimal,
    );
  }

  getEntryItemClass$() {
    const categoryId = this.formGroup?.get('categoryId')?.value as number;
    return this.entryCategories$.pipe(
      map(entryCategories => {
        const entryItemCategoryType = entryCategories.flatEntryCategories.get(categoryId)?.type;
        if (entryItemCategoryType === 'expense') {
          return 'fm-expense-category';
        } else if (entryItemCategoryType === 'income') {
          return 'fm-income-category';
        }
      }),
    );
  }
}
