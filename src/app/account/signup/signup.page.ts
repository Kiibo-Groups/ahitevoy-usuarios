import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { ServerService } from '../../service/server.service';
import { EventsService } from '../../service/events.service';
import { ToastController,NavController,Platform,LoadingController } from '@ionic/angular';
import { Keyboard } from '@capacitor/keyboard';;

@Component({
  standalone: false,
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})

export class SignupPage implements OnInit {
  logedd: any;
  text:any;
  dating = [];
  phone: any;
  login_view: boolean = false;
  isKeyboardHide=true;
  constructor(
    public server : ServerService,
    public toastController: ToastController,
    private nav: NavController,
    public events: EventsService,
    public loadingController: LoadingController, 
    public platform: Platform
    ){
    this.text = JSON.parse(localStorage.getItem('app_text'));
  }

  ngOnInit()
  {
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
    
  }

  async signup(data)
  {
    const loading = await this.loadingController.create({
      mode: 'md'
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
        this.events.publish('user_login', response.user_id);
        this.presentToast("Cuenta Creada con exito, Bienvenido(a)", 'success');
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
 
  async presentToast(txt, color) {
    const toast = await this.toastController.create({
      message: txt,
      duration: 3000,
      position : 'top',
      mode:'ios',
      color:color
    });
    toast.present();
  }

  goBck()
  {
    this.nav.navigateRoot('welcome');  
  }
}
