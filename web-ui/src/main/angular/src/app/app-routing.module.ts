import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/accounts/',
    pathMatch: 'full',
  },
  {
    path: 'accounts',
    loadChildren: () => import('./features/accounts/accounts.module').then(m => m.AccountsModule),
  },
  {
    path: 'budget',
    loadChildren: () => import('./features/budget/budget.module').then(m => m.BudgetModule),
  },
  {
    path: 'calendar',
    loadChildren: () => import('./features/calendar/calendar.module').then(m => m.CalendarModule),
  },
  {
    path: 'reports',
    loadChildren: () => import('./features/reports/reports.module').then(m => m.ReportsModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, enableTracing: false, relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
