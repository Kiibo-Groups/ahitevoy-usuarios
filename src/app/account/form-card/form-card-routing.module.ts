import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FormCardPage } from './form-card.page';

const routes: Routes = [
  {
    path: '',
    component: FormCardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FormCardPageRoutingModule {}
