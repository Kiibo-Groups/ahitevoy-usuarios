import { Component, OnInit,ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ServerService } from '../service/server.service';
import { Geolocation } from '@capacitor/geolocation';;
// import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { ToastController, NavController, LoadingController, ModalController, Platform, AlertController } from '@ionic/angular';
import { mapStyle } from '../service/mapStyle.js';
import { ViewTripPage } from './view-trip/view-trip.page';
import { RateTripPage } from './rate-trip/rate-trip.page';
import { interval } from 'rxjs';
import { registerLocaleData } from '@angular/common';
import localeES from "@angular/common/locales/es";
registerLocaleData(localeES, "es");

declare var google;

@Component({
  standalone: false,
  selector: 'app-done',
  templateUrl: './done.page.html',
  styleUrls: ['./done.page.scss'],
})
export class DonePage implements OnInit {
 
  data:any;
  text:any;
  currency:any;
 
  chkData:any;

  viewRate:boolean = false;

  constructor(
    public toastController: ToastController,
    private nav: NavController,
    public server : ServerService,
    public loadingController: LoadingController,
    public alertController: AlertController,
    public modalController: ModalController,
    public platform: Platform,
  private cdr: ChangeDetectorRef
    ) { }

  ngOnInit() 
  {
    this.text = JSON.parse(localStorage.getItem('app_text'));
  }

  ionViewWillEnter(){
    this.platform.ready().then( () => {
      this.getCart();
      // Inicializamos Timer
      this.chkData = interval(3000).subscribe(() => {
        this.getCart();
      });
    });
  }

  ionViewWillLeave(){
    // Detenemos el Timer
    clearInterval(this.chkData);
    this.chkData.unsubscribe();
  }

  getCart() {
    this.server.cartCount(localStorage.getItem('cart_no') + '?user_id=' + localStorage.getItem('user_id')).subscribe((response: any) => {
      if (response.order == 0) {
        this.presentToast('No tienes pedidos en ruta', 'danger');
        this.nav.navigateRoot('/home');
      } else {
        const incoming: any[] = response.list_orders;

        if (!this.data || this.data.length === 0) {
          // Primera carga: asignamos directamente
          this.data = incoming;
        } else {
          // Actualizaciones subsecuentes: mutamos en-place para evitar re-render del DOM
          incoming.forEach(newItem => {
            const existing = this.data.find((d: any) => d.order.id === newItem.order.id);
            if (existing) {
              // Solo actualizamos si el status cambió
              if (existing.order.status !== newItem.order.status) {
                existing.order.status = newItem.order.status;
              }
            } else {
              // Si es un pedido nuevo que no existía, lo agregamos
              this.data.push(newItem);
            }
          });
        }

        // Verificamos si algún pedido ha terminado
        let finished = false;
        this.data.forEach((element: any) => {
          if (element.order.status == 5 && !finished) {
            finished = true;
            this.chkData.unsubscribe();
            if (!this.viewRate) {
              this.viewRate = true;
              this.viewRateTrip(element);
            }
          }
        });

        // Un solo detectChanges al final, no por cada elemento
        this.cdr.detectChanges();
      }
    });
  }

  async viewRateTrip(item)
  {
    const modal = await this.modalController.create({
      component: RateTripPage,
      animated:true,
      mode:'ios',
      cssClass: 'my-custom-rate-css',
      backdropDismiss:false,
      showBackdrop: true,
      componentProps: {
        'data_post'  : JSON.stringify(item)
      }
    });

    modal.onDidDismiss().then( (data) => {
      if (data.data == 'echo_order') {
        this.nav.navigateRoot('/order');  
      }
    });
    
    return await modal.present();
  }

  async viewTrip(item)
  {
    // Detenemos el Timer
    clearInterval(this.chkData);
    this.chkData.unsubscribe();

    const modal = await this.modalController.create({
      component: ViewTripPage,
      animated:true,
      mode:'ios',
      cssClass: 'my-custom-class',
      backdropDismiss:true,
      showBackdrop: true,
      componentProps: {
        'data_post'  : JSON.stringify(item)
      }
    });

    modal.onDidDismiss().then( (data) => {
      if (data.data == 'finish_order') {
        this.viewRateTrip(item);
      }else {
        this.ionViewWillEnter();
      }
    });
    
    return await modal.present();
  }

  async cancelOrder(id) {
    const alert = await this.alertController.create({
      header: 'Cancelar orden!',
      message: '¿Estás seguro(a)? ¿Quieres cancelar este pedido?',
      mode:'ios',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {


          }
        }, {
          text: 'SI',
          handler: () => {
           
          	this.cnc(id);

          }
        }
      ]
    });

    await alert.present();
  }

  async cnc(id)
  {
  	const loading = await this.loadingController.create({
      message: 'Porfavor espere...',
    });
    await loading.present();

    this.server.cancelOrder(id,localStorage.getItem('user_id')+"?lid="+localStorage.getItem('lid')).subscribe((response:any) => {
      if (response.data != 'error') {
        this.presentToast("Pedido cancelado con éxito.","success");
        loading.dismiss();
      }else {
        this.presentToast("Ha ocurrido un problema, por favor intente más tarde.","danger")
      }
    });
  }

  trackByOrderId(_index: number, item: any): number {
    return item.order.id;
  }

  backPage() {
    this.nav.navigateRoot('/home');
  }

  async presentToast(txt,color) {
    const toast = await this.toastController.create({
      message: txt,
      duration: 3000,
      position : 'top',
      mode:'ios',
      color:color
    });
    toast.present();
  }
}
