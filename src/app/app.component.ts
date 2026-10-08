import { Component, Renderer2,Inject, ChangeDetectorRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Platform,NavController } from '@ionic/angular';
// import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ServerService } from './service/server.service';
import { EventsService } from './service/events.service';
import OneSignal from 'onesignal-cordova-plugin';



@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  
  appType:number = 0;
  dir:string = "ltr";
  text:any;
  apiKey: any;
  public appPages:any = [];

  
  admin:any;
  user:any;
  constructor(
    public server : ServerService,
    public events: EventsService,
    private platform: Platform,
    
    public nav : NavController, 
    public renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    @Inject(DOCUMENT) private _document
  ) {

    
    this.loadData();
    this.events.subscribe('admin', (type) => {  
      this.admin = type;
    });

    if(localStorage.getItem('admin'))
    {
      this.admin = JSON.parse(localStorage.getItem('admin'));
    }
    
    // Cargamos el menu lateral
    this.loadMenu();
    // Obtenemos actualizacion del menu
    this.events.subscribe('text', (text) => {
      this.text = text;
      this.appPages = [
        {
          title: text.home,
          url: '/home',
          icon: 'home'
        },
        {
          title: "Métodos de pago",
          url: '/option-pay',
          icon: 'wallet'
        },
        {
          title: text.account,
          url: '/profile',
          icon: 'person'
        },
        {
          title: text.order,
          url: '/order',
          icon: 'cart'
        }
      ];
      this.cdr.detectChanges();
    });


    this.initializeApp();

    this.events.subscribe('user_login', (id) => {
      this.subPush(id);
      this.cdr.detectChanges();
    });

    this.events.subscribe('user', (data) => {
      this.user = data;
      this.cdr.detectChanges();
    });
  }

  loadMenu()
  {
    this.appPages = [
      {
        title: "Inicio",
        url: '/home',
        icon: 'home'
      },
      {
        title: "Cuenta",
        url: '/profile',
        icon: 'person'
      },
      {
        title: "Métodos de pago",
        url: '/option-pay',
        icon: 'wallet'
      },
      {
        title: "Pedidos",
        url: '/order',
        icon: 'cart'
      }
    ];
    
  }

  assginAppType(ty)
  {
    this.dir = ty == 0 ? "ltr" : "rtl";
  }

  initializeApp() {

    this.platform.ready().then(() => { 
      // StatusBar logic removed for Capacitor
    });

  }

  subPush(id: any = 0) {
    try {
      // 1. Inicializar OneSignal con tu AppId
      OneSignal.initialize('9ed29aa5-c364-430e-8ab3-729c5c6ce496');

      // 2. Solicitar permisos de notificación (para iOS / Android 13+)
      OneSignal.Notifications.requestPermission(true).then((success: boolean) => {
        console.log("Notificaciones permitidas: " + success);
      });

      // 3. Evento al tocar la notificación
      OneSignal.Notifications.addEventListener('click', (event) => {
        console.log('Notificación abierta: ', event);
      });

      // 4. Identificar al usuario (Login)
      const userId = localStorage.getItem('user_id');
      if (userId && userId !== 'null') {
        OneSignal.login(userId);
        OneSignal.User.addTag('user_id', userId);
      } else if (id && id > 0) {
        OneSignal.login(String(id));
        OneSignal.User.addTag('user_id', String(id));
      }
    } catch (e) {
      console.warn("OneSignal no está disponible en este entorno", e);
    }
  }


  logout()
  {
    localStorage.setItem('user_id',null);

    this.nav.navigateForward('/welcome');
  }
    
  async loadData()
  {
    this.server.getDataInit().subscribe((response:any) => {
      
      this.text = response.data.text;

      this.events.publish('text', this.text);
      this.events.publish('admin', response.data.admin);
      this.apiKey = response.data.admin.ApiKey_google;
      this.injectSDK().then((res) => {
        // Obtenemos la Geolocalicacion
        if (!localStorage.getItem("address") || localStorage.getItem("address") == 'null') {
          this.server.getGeolocation();
        }
      });

      localStorage.setItem('app_text', JSON.stringify(response.data.text));
      localStorage.setItem('admin', JSON.stringify(response.data.admin));
      
      // Registramos en oneSignal
      this.platform.ready().then(() => {
        this.subPush();
      });
    }, error => {
      console.log('Error al cargar datos iniciales', error);
      // Intentamos registrar notificaciones incluso si la petición falla
      this.platform.ready().then(() => {
        this.subPush();
      });
    });
  }

  private injectSDK(): Promise<any> {

    return new Promise((resolve, reject) => {

        window['mapInit'] = () => {
            resolve(true);
        }

        let script = this.renderer.createElement('script');
        script.id = 'googleMaps';

        if(this.apiKey){
            script.src = 'https://maps.googleapis.com/maps/api/js?callback=mapInit&libraries=places&key=' + this.apiKey;
        } else {
            script.src = 'https://maps.googleapis.com/maps/api/js?callback=mapInit&libraries=places';       
        }

        this.renderer.appendChild(this._document.body, script);

    });
  }
}
