import { LocaleService } from '@famoney-shared/services/locale.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ParseNumberService {
  private _group: RegExp;
  private _decimal: RegExp;
  private _numeral: RegExp;
  private _index: (d: string) => string;

  constructor(localeService: LocaleService) {
    const parts = new Intl.NumberFormat(localeService.locale).formatToParts(12345.6);
    const numerals = [
      ...new Intl.NumberFormat(localeService.locale, { useGrouping: false }).format(9876543210),
    ].reverse();
    const index = new Map(numerals.map((d, i) => [d.toString(), i.toString()]));
    this._group = new RegExp(`[${parts.find(d => d.type === 'group')?.value}]`, 'g');
    this._decimal = new RegExp(`[${parts.find(d => d.type === 'decimal')?.value}]`);
    this._numeral = new RegExp(`[${numerals.join('')}]`, 'g');
    this._index = d => index.get(d) ?? '';
  }

  parse(value: string | undefined) {
    if (value) {
      return (value = value
        .trim()
        .replace(this._group, '')
        .replace(this._decimal, '.')
        .replace(this._numeral, this._index))
        ? +value
        : NaN;
    } else {
      return NaN;
    }
  }
}
