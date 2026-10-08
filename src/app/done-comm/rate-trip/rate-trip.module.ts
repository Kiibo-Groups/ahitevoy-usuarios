import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RateTripPageRoutingModule } from './rate-trip-routing.module';

import { RateTripPage } from './rate-trip.page';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RateTripPageRoutingModule
  ],
  declarations: [RateTripPage]
})
export class RateTripPageModule {}
