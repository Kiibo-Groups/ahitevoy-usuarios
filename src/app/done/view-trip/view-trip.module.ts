import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewTripPageRoutingModule } from './view-trip-routing.module';

import { ViewTripPage } from './view-trip.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewTripPageRoutingModule
  ],
  declarations: [ViewTripPage]
})
export class ViewTripPageModule {}
