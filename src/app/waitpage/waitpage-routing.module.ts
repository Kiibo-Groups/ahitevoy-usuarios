import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WaitpagePage } from './waitpage.page';

const routes: Routes = [
  {
    path: '',
    component: WaitpagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WaitpagePageRoutingModule {}
