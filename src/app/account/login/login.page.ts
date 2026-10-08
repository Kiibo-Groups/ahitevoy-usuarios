import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { ServerService } from '../../service/server.service';
import { EventsService } from '../../service/events.service';
import { ToastController, NavController, Platform, LoadingController, IonInput, MenuController, ModalController, ActionSheetController } from '@ionic/angular';
import { Keyboard } from '@capacitor/keyboard';;
import { VerifyCodePage } from './verify-code/verify-code.page';
  
@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit {
  @ViewChild("phone", {static: false}) phone : IonInput;
  @ViewChild("email", {static: false}) email : IonInput;
  @ViewChild("password", {static: false}) password : IonInput;
  
  text:any;
  user_id: any = null;
  verifyCode: Boolean = false;
  isKeyboardHide=true;
  Code: String;

  
  isCheckedPC: boolean = true;
  timer_code: any;
  time_verify: boolean = false;
  resend_stat: boolean = false;

  // public recaptchaVerifier: firebase.auth.RecaptchaVerifier;
  stateVerify;
  windowsRef:any;
  confirmationResult: any;
  prefjix: any = "+521";
  flag_prefix: any = "mex.svg";
  constructor(
    private route: ActivatedRoute,
    public server : ServerService,
    public toastController: ToastController,
    
    private nav: NavController,
    public loadingController: LoadingController,
    public platform: Platform,
    public menu: MenuController,
    public events: EventsService,
    public modalController: ModalController,
    public actionSheetController: ActionSheetController
  ){
    this.text = JSON.parse(localStorage.getItem('app_text'));
    
  }

  ngOnInit()
  { 
    this.windowsRef = this.server.windowRef;
    
    // Solo inicializamos el listener si estamos en un dispositivo nativo (iOS/Android)
    if (this.platform.is('hybrid')) {
      try {
        Keyboard.addListener('keyboardWillShow', ()=>{
          this.isKeyboardHide=false;
        }).catch(e => console.warn("Keyboard plugin not implemented"));

        Keyboard.addListener('keyboardWillHide', ()=>{
          this.isKeyboardHide=true;
        }).catch(e => console.warn("Keyboard plugin not implemented"));
      } catch (e) {
        console.warn(e);
      }
    }
  }

  ionViewWillEnter(){
    this.email.setFocus();
    this.menu.enable(false);
    this.Code = '';
    this.verifyCode = false;

    if (localStorage.getItem('user_id') && localStorage.getItem('user_id') != null) {
      this.user_id = localStorage.getItem('user_id');
    }

    // this.windowsRef.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container',{
    //   size: "invisible",
    //   callback: function(response) {
    //     this.login();
    //   }
    // });
    
  }

  async newLogin()
  {
    const loading = await this.loadingController.create({
      mode:'md'
    });
    await loading.present();
 
    if (this.isCheckedPC) {
      if (this.email.value.toString().length > 0 && this.password.value.toString().length > 0) {
        var allData = {
          email : this.email.value, 
          password: this.password.value
        }  

        this.server.login(allData).subscribe((response:any) => {
          loading.dismiss();
          console.log(response);
          if (response.msg == "done") {
            this.presentToast('Bienvenido(a) de nuevo...','success');
            localStorage.setItem('user_id',response.user_id);
            this.events.publish('user_login', response.user_id);
            let navigationExtras: NavigationExtras = {
              queryParams: {
                redirect: 'home'
              }
            };
            this.nav.navigateForward(['/waitpage'], navigationExtras);
          }else {
            this.presentToast(response.msg, "danger");
          }
        });
      }else {
        loading.dismiss();
        this.presentToast("Por favor, Ingresa correo y contraseña.",'danger');
      }
    }else {
      loading.dismiss();
      this.presentToast("Por favor, aceptar nuestros terminos y condiciones.",'danger');
    }
  }


  async login()
  {
    const loading = await this.loadingController.create({
      mode:'md'
    });
    await loading.present();

    if (this.isCheckedPC) {
      if (this.phone.value.toString().length > 0) {
          let phone = this.prefjix+this.phone.value.toString();
          this.resend_stat = false;
          
          // firebase.auth().signInWithPhoneNumber(phone,this.windowsRef.recaptchaVerifier).then(confirmationResult => {
          //   this.windowsRef.confirmationResult = confirmationResult;
          //   localStorage.setItem('confirmationResult',JSON.stringify(this.windowsRef.confirmationResult));
          //   localStorage.setItem('phone',this.phone.value.toString());
          //   loading.dismiss();
          //   this.InputCodeView();
          // }).catch(fail => {
          //   console.log('fail: '+fail);
          //   this.presentToast(fail,"danger");
          //   loading.dismiss();
          // });
      } 
    }else {
      loading.dismiss();
      this.presentToast("Por favor, aceptar nuestros terminos y condiciones.",'danger');
    }
  }

  async InputCodeView()
  {
    const modal = await this.modalController.create({
      component:  VerifyCodePage,
      cssClass: 'my-custom-filters-class',
      backdropDismiss: true,
      componentProps: {
        phone : this.prefjix+this.phone.value.toString()
      }
    });

    modal.onWillDismiss().then(data => {
    
      if (data.role == 'code_input') {
        this.Code = data.data;
        this.valid();
      }else if (data.role == 'resend') {
        this.nav.navigateRoot('welcome');
      }else {
        this.presentToast("se ha cancelado la solicitud...","danger");
        this.nav.navigateRoot('welcome');
      }
    });

    return await modal.present();
  } 

  async valid() {

    const loading = await this.loadingController.create({
      message: 'Validando...',
    });
    await loading.present();

    let verificationCode: String = this.Code.toString();
    this.windowsRef.confirmationResult.confirm(verificationCode).then(result => {
      var allData = {
          user_id : this.user_id, 
          phone : localStorage.getItem('phone')
      }  
      this.server.chkUser(allData).subscribe((res:any) => {
          loading.dismiss();
          if (res.msg == 'phone_exist') {
            this.presentToast("El número telefonico que intentas registrar ya se encuentra en uso, por favor intenta con otro.","danger");
            this.ionViewWillEnter();
          }
          else if(res.msg == "not_exist")
          {
            this.presentToast("Termina tu registro ingresando tus datos de contacto. ","warning");
            this.nav.navigateRoot('/signup');
          }
          else {
            this.presentToast('Bienvenido(a) de nuevo...','success');
            localStorage.setItem('user_id',res.user_id);
            this.events.publish('user_login', res.user_id);
            this.server.SignPhone({phone : localStorage.getItem('phone'), user_id: res.user_id}).subscribe((req:any) => {
              if (req.msg == 'done') {
                let navigationExtras: NavigationExtras = {
                  queryParams: {
                    redirect: 'home'
                  }
                };
                this.nav.navigateForward(['/waitpage'], navigationExtras);
              }else {
                this.presentToast(req.msg,'danger');
              }
            });
          }
      });
    }).catch(fail => {
      console.log(fail);
      // Fail
      loading.dismiss();
      this.presentToast('Algo ha ocurrido.'+fail, 'danger');
    });
    
  }
  
  TimerCode()
  {
    let i = 15;
    this.timer_code = setInterval(() => {
      i = i-1
      
      if (i == 0) {
        this.resend_stat = true;
        this.time_verify = false;
        clearInterval(this.timer_code);
        this.TimerCode();
      }
    }, 1000);
  }

  async changeLang(){
    const actionSheet = await this.actionSheetController.create({
      header: 'Selecciona tu país',
      cssClass: 'my-custom-class',
      mode:'md',
      buttons: [{
        text: 'Mexico',
        icon: 'assets/prefix/mex.svg',  
        handler: () => {
          this.prefjix = "+521";
          this.flag_prefix = "mex.svg";
        }
      }, {
        text: 'Colombia',
        icon: 'assets/prefix/colombia.svg',  
        handler: () => {
          this.prefjix = "+57";
          this.flag_prefix = "colombia.svg";
        }
      },{
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          
        }
      }]
    });
    await actionSheet.present();

    const { role, data } = await actionSheet.onDidDismiss();
    console.log('onDidDismiss resolved with role and data', role, data);
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

  guestUser() {
    localStorage.removeItem('user_id');
    localStorage.removeItem('user');
    localStorage.removeItem('address');
    
    let navigationExtras: NavigationExtras = {
      queryParams: {
        redirect: 'home'
      }
    };
    this.nav.navigateForward(['/waitpage'], navigationExtras);
  }

  forgotPass()
  {
    this.nav.navigateForward('forgot')
  }

  goBck()
  {
    this.nav.navigateRoot('welcome');  
  }
}
