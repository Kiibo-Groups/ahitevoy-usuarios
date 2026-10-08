import { Component, ViewChild, ElementRef,OnInit, Input } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ServerService } from '../../service/server.service';
import { ToastController, NavController, Platform, LoadingController, ModalController } from '@ionic/angular';
import { mapStyle } from '../../service/mapStyle.js';
import { onValue } from 'firebase/database';

declare var google:any;

@Component({
  standalone: false,
  selector: 'app-view-trip',
  templateUrl: './view-trip.page.html',
  styleUrls: ['./view-trip.page.scss'],
})
export class ViewTripPage implements OnInit {

  @ViewChild('map',{static:false}) mapElement: ElementRef;
  @Input() data_post: any;

  data:any;
  map: any;
  lat: any;
  lng: any;
  admin:any;
  dboy: any;

  first_charge_dboy:boolean = false;
  lat_dboy:any = 0;
  lng_dboy:any = 0;
  marker_staff: any;
  infoWindow_staff:any;
  private unsubscribeOrder: any;

  constructor(
    public server : ServerService,
    public toastController: ToastController,
    public nav: NavController,
    public loadingController: LoadingController,
    public modalController: ModalController
  ) { 
    this.lat = localStorage.getItem('current_lat');
    this.lng = localStorage.getItem('current_lng');
  }

  ngOnInit() {
    this.data = JSON.parse(this.data_post);

    setTimeout(() => {
      this.injectMap().then(() => {
        console.log(this.data);
        this.loadData();
      });
    }, 800);
  }

  loadData()
  {
    const orderRef = this.server.Orderfs(this.data.order.external_id);
    this.unsubscribeOrder = onValue(orderRef, (snap) => {
      const obj = snap.val();
      console.log(obj);
      if (obj && obj.dboy) {
        this.dboy = obj.dboy;
        this.ViewdBoy(obj.dboy.lat, obj.dboy.lng);
      }

      if (obj && obj.status == 5) { // Pedido Terminado
        // Detenmos la escucha del server
        if (this.unsubscribeOrder) this.unsubscribeOrder();
        this.presentToast("Pedido Terminado","success");    
        setTimeout(() => {
          this.finish_order();
        }, 500);  
      }
    });     
  }

  async finish_order()
  {
    this.modalController.dismiss("finish_order",'finish');
  }
  
  async ViewdBoy(lat_dboy, lng_dboy) {
    var latlng = new google.maps.LatLng(lat_dboy, lng_dboy);
    if (this.first_charge_dboy == false) {
      this.first_charge_dboy = true;  
      const icon = {
        url: 'assets/d.png', // image url
        scaledSize: new google.maps.Size(50, 50), // scaled size
      };

      this.marker_staff = new google.maps.Marker({
        position: latlng,
        map: this.map,
        icon: icon
      }); 
    }else {
      this.marker_staff.setPosition(latlng);
    }  

    // Movemos el mapa
    this.map.setCenter(latlng);
  }

  getChat(data)
  {
    // Detenmos la escucha del server
    if (this.unsubscribeOrder) this.unsubscribeOrder();
    // Cerramos el Modal 
    this.modalController.dismiss('getChat','chat');
    // Redireccionamos
    this.nav.navigateForward(['/chat/'+data.order.external_id]);
  }

  private injectMap(): Promise<any> {
    return new Promise((resolve, reject) => {
      let latLng = new google.maps.LatLng(this.lat, this.lng);
      let mapOptions = {
        center: latLng,
        zoom: 15,
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: mapStyle
      }
      
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
      
      resolve(true);
    });
  }
  
  backPage()
  {
    if (this.unsubscribeOrder) this.unsubscribeOrder();
    this.modalController.dismiss(); 
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
