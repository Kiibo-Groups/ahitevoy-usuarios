import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DoneCommPage } from './done-comm.page';

const routes: Routes = [
  {
    path: '',
    component: DoneCommPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DoneCommPageRoutingModule {}
