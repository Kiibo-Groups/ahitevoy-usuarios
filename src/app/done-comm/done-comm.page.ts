import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ServerService } from '../service/server.service';
import { Geolocation } from '@capacitor/geolocation';;
// import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { ToastController, NavController, LoadingController, ModalController, Platform } from '@ionic/angular';
import { RateTripPage } from './rate-trip/rate-trip.page';
import { mapStyle } from '../service/mapStyle.js';

import { interval } from 'rxjs';
declare var google;

@Component({
  standalone: false,
  selector: 'app-done-comm',
  templateUrl: './done-comm.page.html',
  styleUrls: ['./done-comm.page.scss'],
})
export class DoneCommPage implements OnInit {

  @ViewChild('map', { static: true }) mapElement: ElementRef;

  pet: any = 1;
  data: any;
  text: any;
  currency: any;

  chkData: any;

  viewRate: boolean = false;
  constructor(
    public toastController: ToastController,
    private nav: NavController,
    public server: ServerService,
    public loadingController: LoadingController,
    public modalController: ModalController,
    public platform: Platform,
    private cdr: ChangeDetectorRef
  ) { }

  trackByOrderId(index: number, order: any): number {
    return order.event.id;
  }

  ngOnInit() {
    this.text = JSON.parse(localStorage.getItem('app_text'));
  }

  ionViewWillEnter() {
    this.platform.ready().then(() => {
      this.getCart();
      // Inicializamos Timer
      this.chkData = interval(3000).subscribe(() => {
        this.getCart();
      });
    });
  }

  ionViewWillLeave() {
    // Detenemos el Timer
    clearInterval(this.chkData);
    this.chkData.unsubscribe();
  }

  getCart() {
    this.server.chkEvents_comm(localStorage.getItem('user_id')).subscribe((response: any) => {
      console.log(response);
      if (response.data == 0) {
        clearInterval(this.chkData);
        this.chkData.unsubscribe();
        this.presentToast("No tienes pedidos en ruta", 'danger');
        this.nav.navigateRoot('/home');
      } else {
        this.data = response.data;
        this.cdr.detectChanges();

        // Verificamos si algun servicio ha terminado
        this.data.forEach(element => {
          const dat = element.event;

          if (dat.status == 5) {
            clearInterval(this.chkData);
            this.chkData.unsubscribe();
            if (this.viewRate == false) {
              this.viewRate = true;
              this.viewRateTrip(element);
            }
          }
        });
      }
    });
  }

  async resendComm(item) {
    const loading = await this.loadingController.create({
      mode: 'ios'
    });
    await loading.present();

    let alldata = {
      id_order: item
    };

    this.server.chkEvents_staffs(alldata).subscribe((data) => {
      loading.dismiss();
      this.presentToast("Se ha vuelto a enviar la solicitud de servicio...", 'secondary');
    });
  }

  async cancelComm(item) {
    const loading = await this.loadingController.create({
      mode: 'ios'
    });
    await loading.present();
    this.server.cancelComm_event(item).subscribe((data) => {
      loading.dismiss();
      this.presentToast("El Pedido #" + item + " ha sido cancelado...", 'success');
      this.nav.navigateRoot('/home');
    });
  }

  async viewRateTrip(item) {
    const modal = await this.modalController.create({
      component: RateTripPage,
      animated: true,
      mode: 'ios',
      cssClass: 'my-custom-rate-css',
      backdropDismiss: false,
      showBackdrop: true,
      componentProps: {
        'data_post': JSON.stringify(item)
      }
    });

    modal.onDidDismiss().then((data) => {
      clearInterval(this.chkData);
      this.chkData.unsubscribe();
      this.nav.navigateRoot('/home');
    });

    return await modal.present();
  }

  getChat(data) {

    clearInterval(this.chkData);
    this.chkData.unsubscribe();
    localStorage.setItem('dboy', JSON.stringify(data.dboy));
    // Redireccionamos
    this.nav.navigateForward(['/chat/' + data.event.external_id]);
  }

  backPage() {
    this.nav.navigateRoot('/home');
  }

  async presentToast(txt, color) {
    const toast = await this.toastController.create({
      message: txt,
      duration: 3000,
      position: 'top',
      mode: 'ios',
      color: color
    });
    toast.present();
  }

}
