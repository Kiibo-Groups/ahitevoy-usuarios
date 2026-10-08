import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RateTripPage } from './rate-trip.page';

const routes: Routes = [
  {
    path: '',
    component: RateTripPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RateTripPageRoutingModule {}
