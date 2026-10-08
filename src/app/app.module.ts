
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';
import { CommonModule, SlicePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { register } from 'swiper/element/bundle';
register();

// Material Design
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon'; 
import { MatRadioModule } from '@angular/material/radio'; 

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
// Firebase (Native)
import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';

// ModalBox
import { OptionPageModule } from './option/option.module';
import { OfferPageModule } from './offer/offer.module';
import { FormCardPageModule } from './account/form-card/form-card.module'; 
import { InfoFeePageModule } from './cart/info-fee/info-fee.module';
import { FiltersPageModule } from './filters/filters.module';
import { RateTripPageModule } from './done/rate-trip/rate-trip.module';
import { RateTripPageModule as RateTripComm } from './done-comm/rate-trip/rate-trip.module';
import { VerifyCodePageModule } from './account/login/verify-code/verify-code.module';
import { ViewTripPageModule } from './done/view-trip/view-trip.module';
import { DeleteAccountPageModule } from './account/delete-account/delete-account.module';
import { SetaddressPageModule } from './commanded/setaddress/setaddress.module';
 
@NgModule({ schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [AppComponent],
  bootstrap: [AppComponent], 
  imports: [
    CommonModule, 
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(), 
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
 
    // ModalBox
    OptionPageModule,
    OfferPageModule,
    FormCardPageModule,
    InfoFeePageModule,
    FiltersPageModule,
    RateTripPageModule,
    RateTripComm,
    VerifyCodePageModule,
    ViewTripPageModule,
    DeleteAccountPageModule,
    SetaddressPageModule,
    
    MatExpansionModule,
    MatButtonToggleModule,
    MatIconModule,
    MatRadioModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },

  ],
  
})
export class AppModule {}
