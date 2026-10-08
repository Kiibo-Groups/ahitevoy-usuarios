import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SetaddressPage } from './setaddress.page';

const routes: Routes = [
  {
    path: '',
    component: SetaddressPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SetaddressPageRoutingModule {}
