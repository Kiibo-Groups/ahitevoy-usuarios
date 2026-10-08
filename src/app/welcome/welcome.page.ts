import { Component, OnInit,ViewChild } from '@angular/core';
import { ServerService } from '../service/server.service';
import { NavController,Platform,LoadingController, MenuController, ToastController } from '@ionic/angular';
import { NavigationExtras } from '@angular/router';
// Facebook
// import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';
@Component({
  standalone: false,
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements OnInit {



text:any;
slideOptsTwo = {
    slidesPerView: 1,
    loop: true,
    autoplay:false,
    pagination: {
      el: '.swiper-pagination',
    }

}

data:any;
getStart = false;

chargePage: String;
loadpage: String;
IniSes: boolean;
// Datos del usuario
Email: any;
Name: String;
Aps: String;
Phone: any;
Key: String;

// Control de errores
Error: String;  
  constructor(
    public server : ServerService,
    public loadingController: LoadingController, 
    public toastController: ToastController,
    public nav: NavController,
    public menu : MenuController,
    public platform: Platform,
    
  ) { 
    
    this.menu.enable(false);
    
  }


  ngOnInit()
  {
    this.platform.ready().then( () => {
      this.loadingData(); 
    });
  }

  async loadingData()
  {
    const loading = await this.loadingController.create({
      mode: 'md'
    });
    
    await loading.present();
    
    this.server.welcome().subscribe((response:any) => {
      this.data = response.data;
      this.chargePage = 'sliderIni';
      this.loadpage   = 'EmailIn';
      this.IniSes     = false;
      console.log(this.data);
      loading.dismiss();
    });
  }

  LoginSignup()
  {
    this.nav.navigateForward('/login');
  }
  
  Signup()
  {
    this.nav.navigateForward('/signup');
  }

  /**
   * Solicitamos la autorizacion en Facebook para obtener los datos
  */

  fbLogin() {
    this.presentToast("El inicio con Facebook requiere configuración adicional en Capacitor. Ver documentación.", 'warning');
    /*
    this.fb.login(['public_profile', 'email'])
    .then((res: FacebookLoginResponse) => {
      if (res.status == 'connected') {
        // Usuarios Logeado...
        let url = "https://graph.facebook.com/me?fields=id,name,email&access_token="+res.authResponse.accessToken;
        this.server.signupWithfb(url).subscribe(data => {
         this.loginfb({
            name : data['name'],
            email: data['email'],
            phone: 'null',
            password: data['id'],
            pswfb: data['id']
          });
        });
        }
    }).catch(e => {
      this.presentToast("Ha ocurrido un problema. vuelva a intentar más tarde.",'danger');
    });

    this.fb.logEvent(this.fb.EVENTS.EVENT_NAME_ADDED_TO_CART);
    */
  }

  /**
   * Login With Facebook
  */

  async loginfb(data)
  {
    const loading = await this.loadingController.create({
      mode:'ios'
    });

    await loading.present();
  
    this.server.loginfb(data).subscribe((response:any) => { 
    
      if(response.msg != "done")
      {
        /**
         * Si no existe la cuenta se va a crear
        */
        this.signup(data);
      }
      else
      {
        localStorage.setItem('user_id',response.user_id);
        // this.events.publish('user_login', response.user_id);
        let navigationExtras: NavigationExtras = {
          queryParams: {
            redirect: 'home'
          }
        };
        this.nav.navigateForward(['/waitpage'], navigationExtras);
      }
      loading.dismiss();
    });
  }

  /**
   * SignUp With Facebook
  */

  async signup(data)
  {
    const loading = await this.loadingController.create({
      mode: 'ios'
    });
    await loading.present();

    this.server.signup(data).subscribe((response:any) => {      
      if(response.msg != "done")
      {
        this.presentToast(response.msg,'danger');
      }
      else
      {
        localStorage.setItem('user_id',response.user_id);
        // this.events.publish('user_login', response.user_id);
        this.presentToast("Cuenta Creada con exito, Bienvenido(a)", 'success');
        this.nav.navigateForward('/login');
      }

      loading.dismiss();
    });
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
