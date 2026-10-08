import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OptionPayPage } from './option-pay.page';

const routes: Routes = [
  {
    path: '',
    component: OptionPayPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OptionPayPageRoutingModule {}
