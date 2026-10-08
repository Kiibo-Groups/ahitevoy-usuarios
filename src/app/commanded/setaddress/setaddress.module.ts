import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SetaddressPageRoutingModule } from './setaddress-routing.module';

import { SetaddressPage } from './setaddress.page';

@NgModule({
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SetaddressPageRoutingModule
  ],
  declarations: [SetaddressPage]
})
export class SetaddressPageModule {}
