import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InfoFeePage } from './info-fee.page';

const routes: Routes = [
  {
    path: '',
    component: InfoFeePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InfoFeePageRoutingModule {}
