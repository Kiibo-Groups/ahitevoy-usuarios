import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Keyboard } from '@capacitor/keyboard';;
import { ModalController, IonInput, ToastController } from '@ionic/angular';
@Component({
  standalone: false,
  selector: 'app-verify-code',
  templateUrl: './verify-code.page.html',
  styleUrls: ['./verify-code.page.scss'],
})
export class VerifyCodePage implements OnInit {

  @ViewChild("otp1", {static: false}) otp1 : IonInput;
  @Input() phone: string;

  Code: number;
  constructor(
    
    public modalController: ModalController,
    public toastController: ToastController
  ) { 

  }

  ngOnInit() {
  
  }

  valid()
  {
    if (this.Code && this.Code.toString().length == 6) {
      this.modalController.dismiss(this.Code,'code_input');
    }else {
      this.presentToast('Porfavor Ingresa un Codigo valido!','danger');
    }
  }

  resend()
  {
    this.modalController.dismiss('','resend');
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
