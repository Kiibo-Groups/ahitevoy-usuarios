import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServerService } from '../../service/server.service';
import { ToastController,NavController,Platform,LoadingController, ActionSheetController } from '@ionic/angular';
import { Keyboard } from '@capacitor/keyboard';; 

@Component({
  standalone: false,
  selector: 'app-chkphone',
  templateUrl: './chkphone.page.html',
  styleUrls: ['./chkphone.page.scss'],
})
export class ChkphonePage implements OnInit {

  user_id:any;
  Code: String;
  phone: any = '';
  stateVerify;
  windowsRef:any;
  confirmationResult: any;
  txtbnt: any;
  btnDisabled = true;
  // public recaptchaVerifier: firebase.auth.RecaptchaVerifier;
  
  pic_prefix: any = "assets/prefix/mexico.svg";
  text_prefix:any = "+52";
  prefjix: any = "+521";
  constructor(
    private route: ActivatedRoute,
    public server : ServerService,
    public toastController: ToastController,
    
    private nav: NavController,
    public loadingController: LoadingController, 
    public actionSheetController: ActionSheetController
  ) { }

  ngOnInit() {
    this.windowsRef = this.server.windowRef;
    this.stateVerify = 'inputPhone';
    this.txtbnt = 'Siguiente';
    this.user_id = localStorage.getItem('user_id');
  }

  ionViewWillEnter(){
    this.btnDisabled = true;
    // this.windowsRef.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');
  }

  async verify() {

    this.btnDisabled = false;

    const loading = await this.loadingController.create({
      message: 'Validando...',
    });
    await loading.present();

    if (this.stateVerify == 'inputPhone') {
      let phone = this.prefjix+this.phone;
      // firebase.auth().signInWithPhoneNumber(phone,this.windowsRef.recaptchaVerifier).then(confirmationResult => {
      //   this.windowsRef.confirmationResult = confirmationResult;
      //   localStorage.setItem('confirmationResult',JSON.stringify(this.windowsRef.confirmationResult));
      //   localStorage.setItem('phone',this.phone);
      //   setTimeout(() => {
      //     this.nav.navigateForward('/verfycode');
      //   }, 700);
      // }).catch(fail => {
      //   console.log('fail: '+fail);
      //   this.presentToast(fail,"danger");
      //   this.btnDisabled = true;
      //   loading.dismiss();
      // });
      loading.dismiss();
    }
    
  }

  async resend() {
    const loading = await this.loadingController.create({
      message: 'Volviendo a intentar...',
    });
    await loading.present();
    this.stateVerify = 'inputPhone';
    this.txtbnt = 'Siguiente';

    setTimeout(() => {
      this.windowsRef = this.server.windowRef;
      // this.windowsRef.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');
      loading.dismiss();      
    }, 800);

  }

  async presentToast(txt, color) {
    const toast = await this.toastController.create({
      message: txt,
      duration: 3000,
      position : 'bottom',
      mode:'ios',
      color:color
    });
    toast.present();
  }

  async changePrefix() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Selecciona Tu Prefijo',
      cssClass: 'my-custom-class',
      buttons: [
        {
          text: 'México',
          icon: 'assets/prefix/mexico.svg',
          handler: () => {
            this.pic_prefix = "assets/prefix/mexico.svg";
            this.text_prefix = "+52";
            this.prefjix = "+521";
          }
        },
        // {
        //   text: 'Argentina',
        //   icon: 'assets/prefix/argentina.svg',
        //   handler: () => {
        //     this.pic_prefix = "assets/prefix/argentina.svg";
        //     this.text_prefix = "+54";
        //     this.prefjix = "+54";
        //   }
        // },
        // {
        //   text: 'Peru',
        //   icon: 'assets/prefix/peru.svg',
        //   handler: () => {
        //     this.pic_prefix = "assets/prefix/peru.svg";
        //     this.text_prefix = "+51";
        //     this.prefjix = "+51";
        //   }
        // },
        // {
        //   text: 'Chile',
        //   icon: 'assets/prefix/chile.svg',
        //   handler: () => {
        //     this.pic_prefix = "assets/prefix/chile.svg";
        //     this.text_prefix = "+56";
        //     this.prefjix = "+56";
        //   }
        // },
        // {
        //   text: 'Panamá',
        //   icon: 'assets/prefix/panama.svg',
        //   handler: () => {
        //     this.pic_prefix = "assets/prefix/panama.svg";
        //     this.text_prefix = "+507";
        //     this.prefjix = "+507";
        //   }
        // },
        // {
        //   text: 'Ecuador',
        //   icon: 'assets/prefix/ecuador.svg',
        //   handler: () => {
        //     this.pic_prefix = "assets/prefix/ecuador.svg";
        //     this.text_prefix = "+593";
        //     this.prefjix = "+593";
        //   }
        // },
        // {
        //   text: 'Uruguay',
        //   icon: 'assets/prefix/uruguay.svg',
        //   handler: () => {
        //     this.pic_prefix = "assets/prefix/uruguay.svg";
        //     this.text_prefix = "+598";
        //     this.prefjix = "+598";
        //   }
        // },
        // {
        //   text: 'Bolivia',
        //   icon: 'assets/prefix/bolivia.svg',
        //   handler: () => {
        //     this.pic_prefix = "assets/prefix/bolivia.svg";
        //     this.text_prefix = "+591";
        //     this.prefjix = "+591";
        //   }
        // },
        // {
        //   text: 'Colombia',
        //   icon: 'assets/prefix/colombia.svg',
        //   handler: () => {
        //     this.pic_prefix = "assets/prefix/colombia.svg";
        //     this.text_prefix = "+57";
        //     this.prefjix = "+57";
        //   }
        // },
        // {
        //   text: 'Venezuela',
        //   icon: 'assets/prefix/venezuela.svg',
        //   handler: () => {
        //     this.pic_prefix = "assets/prefix/venezuela.svg";
        //     this.text_prefix = "+58";
        //     this.prefjix = "+58";
        //   }
        // },
        // {
        //   text: 'Usa',
        //   icon: 'assets/prefix/usa.svg',
        //   handler: () => {
        //     this.pic_prefix = "assets/prefix/usa.svg";
        //     this.text_prefix = "+1";
        //     this.prefjix = "+1";
        //   }
        // }
      ]
    });
    await actionSheet.present();
 
  }

}
