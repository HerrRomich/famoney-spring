
export class LocaleService {
  private _locale: string;

  constructor() {
    this._locale = 'ru';
  }

  set locale(value: string) {
    this._locale = value;
  }
  get locale(): string {
    return this._locale;
  }

}
