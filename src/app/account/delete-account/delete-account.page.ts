import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController, NavController, ToastController } from '@ionic/angular';
import { ServerService } from '../../service/server.service';

@Component({
  standalone: false,
  selector: 'app-delete-account',
  templateUrl: './delete-account.page.html',
  styleUrls: ['./delete-account.page.scss'],
})
export class DeleteAccountPage implements OnInit {


  data: any;

  constructor(
    public nav: NavController,
    public server: ServerService,
    public toastController: ToastController,
    public loadingController: LoadingController,
    public modalController: ModalController
  ) { 
    if (!localStorage.getItem('user_id') || localStorage.getItem('user_id') == 'null') {
      this.nav.navigateRoot('/login');
      this.presentToast("Por favor, Ingresa a tu cuenta primero.",'danger');
    }
    else {
      this.loadData();
    }
  }

  ngOnInit() {
  }


  async loadData() {
    const loading = await this.loadingController.create({
      message: 'Obteniendo tus datos...',
    });
    await loading.present();

    this.server.userInfo(localStorage.getItem('user_id')).subscribe((response: any) => {
      this.data = response.data;
      console.log(this.data)
      loading.dismiss();
    });
  }

  async ConfirmDelete(form: FormData) {

    const loading = await this.loadingController.create({
      message: 'Enviando solictud...',
    });
    await loading.present();

    setTimeout(() => {
      loading.dismiss();
      this.presentToast("Tu solicitud ha sido enviada y sera revisada por un administrador. ", 'success');
      this.modalController.dismiss();
    },3000);

  }

  async presentToast(txt,color) {
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
