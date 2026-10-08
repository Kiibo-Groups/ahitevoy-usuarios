import { ServerService } from './../../service/server.service';
import { Component, Input, OnInit } from '@angular/core';
import { LoadingController, ModalController, NavController, ToastController } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-rate-trip',
  templateUrl: './rate-trip.page.html',
  styleUrls: ['./rate-trip.page.scss'],
})
export class RateTripPage implements OnInit {

  @Input() data_post: string;

  data: any;
  text: any;


  star = 0;

  good_attention: any;
  ffficient_delivery: any;
  covid_prevention: any;
  covid_prevention_product: any;

  star_staff1 = 0
  staf_staff2 = 0;
  constructor(
    public loadingController: LoadingController,
    public toastController: ToastController,
    public modalController: ModalController,
    public server: ServerService,
    public nav: NavController
  ) {
    this.text = JSON.parse(localStorage.getItem('app_text'));
  }

  ngOnInit() {
    this.data = JSON.parse(this.data_post);
    console.log(this.data);
  }

  setStar(val) {
    this.star = val;
  }

  async giveRating(data) {
    if (this.star == 0) {
      this.presentToast('Seleccione cualquier calificación para continuar.', 'warning');
    }
    else {
      const loading = await this.loadingController.create({
        message: 'Enviando Calificación',
      });
      await loading.present();

      var allData = {
        comment: data.comment,
        user_id: localStorage.getItem('user_id'),
        star: this.star,
        star_staff1: this.star_staff1,
        star_staff2: this.staf_staff2,
        oid: this.data.event.id,
        d_boy: this.data.dboy.id
      }

      this.server.rateComm_event(allData).subscribe((response: any) => {
        if (response.data == 'error') {
          console.log(response.error);
          loading.dismiss();
          this.presentToast("Ha ocurrido un problema, por favor intente mas tarde.", "danger");
        } else {
          loading.dismiss();
          this.presentToast('¡Gracias! Calificación enviada con éxito.', 'success');
          this.modalController.dismiss();
        }
      });
    }
  }


  async presentToast(txt, color) {
    const toast = await this.toastController.create({
      message: txt,
      duration: 2000,
      position: 'top',
      color: color
    });
    toast.present();
  }

}
