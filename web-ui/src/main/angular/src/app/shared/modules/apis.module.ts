import { NgModule } from '@angular/core';
import { ApiModule as AccountsApiModule, Configuration as AccountsApiConfiguration } from '@famoney-apis/accounts';
import {
  ApiModule as MasterDataApiModule,
  Configuration as MasterDataApiConfiguration,
} from '@famoney-apis/master-data';
import { HttpClientModule } from '@angular/common/http';

const accountsApiConfigFactory = () => {
  return new AccountsApiConfiguration({
    basePath: '/famoney/apis/accounts-domain',
  });
};

const masterDataApiConfigFactory = () => {
  return new MasterDataApiConfiguration({
    basePath: '/famoney/apis/master-data-domain',
  });
};

@NgModule({
  imports: [
    AccountsApiModule.forRoot(accountsApiConfigFactory),
    MasterDataApiModule.forRoot(masterDataApiConfigFactory),
    HttpClientModule,
  ],
})
export class ApisModule {}
