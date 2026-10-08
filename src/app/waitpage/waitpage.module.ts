import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WaitpagePageRoutingModule } from './waitpage-routing.module';

import { WaitpagePage } from './waitpage.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WaitpagePageRoutingModule
  ],
  declarations: [WaitpagePage]
})
export class WaitpagePageModule {}
