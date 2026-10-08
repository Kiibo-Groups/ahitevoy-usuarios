import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InfoFeePageRoutingModule } from './info-fee-routing.module';

import { InfoFeePage } from './info-fee.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InfoFeePageRoutingModule
  ],
  declarations: [InfoFeePage]
})
export class InfoFeePageModule {}
