import { NgModule } from '@angular/core';

import { Routes, RouterModule } from '@angular/router';

import { CommandedPage } from './commanded.page';

const routes: Routes = [
  {
    path: '',
    component: CommandedPage
  },
  {
    path: 'setaddress',
    loadChildren: () => import('./setaddress/setaddress.module').then( m => m.SetaddressPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CommandedPageRoutingModule {}
