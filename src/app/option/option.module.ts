import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion'; 
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import {MatIconModule} from '@angular/material/icon'; 
import {MatRadioModule} from '@angular/material/radio'; 

import { IonicModule } from '@ionic/angular';

import { OptionPage } from './option.page';

const routes: Routes = [
  {
    path: '',
    component: OptionPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatExpansionModule,
    MatButtonToggleModule,
    MatIconModule,
    MatRadioModule,
    RouterModule.forChild(routes)
  ],
  declarations: [OptionPage]
})
export class OptionPageModule {}
