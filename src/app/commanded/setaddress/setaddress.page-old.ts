import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServerService } from '../../service/server.service';
import { ToastController, NavController, Platform, LoadingController, ModalController } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';;
// import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { mapStyle } from '../../service/mapStyle.js';

declare var google: any;

@Component({
  standalone: false,
  selector: 'app-setaddress',
  templateUrl: './setaddress.page.html',
  styleUrls: ['./setaddress.page.scss'],
})
export class SetaddressPage implements OnInit {

  @ViewChild('map', { static: true }) mapElement: ElementRef;

  map: any;
  lat: any;
  lng: any;
  location: any;
  address: string;
  type_add: any;
  text: any;
  marker: any;

  constructor(
    public route: ActivatedRoute,
    public server: ServerService,
    public toastController: ToastController,
    public nav: NavController,
    public loadingController: LoadingController,
    
    
    public modalController: ModalController
  ) {
    this.text = JSON.parse(localStorage.getItem('app_text'));
  }


  ngOnInit() {
    Geolocation.getCurrentPosition().then((resp) => {
      this.lat = resp.coords.latitude;
      this.lng = resp.coords.longitude;
      this.loadMap();
    }).catch((error) => {
      this.presentToast("Ha ocurrido un problema.", "danger");
      console.log(error);
    });
  }

  async loadMap() {
    const loading = await this.loadingController.create({});
    await loading.present();

    let latLng = new google.maps.LatLng(this.lat, this.lng);

    let mapOptions = {
      center: latLng,
      zoom: 17,
      disableDefaultUI: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: mapStyle
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    this.marker = new google.maps.Marker({
      map: this.map,
      draggable: true,
      position: latLng
    });
    this.marker.setVisible(true);

    this.getAddressFromCoords(this.lat, this.lng);

    let $this = this;
    google.maps.event.addListener(this.marker, 'dragend', (evt) => {
      this.getAddressFromCoords(evt.latLng.lat(), evt.latLng.lng());
    });
    loading.dismiss();
  }

  async getAddressFromCoords(lattitude, longitude) {
    var geocoder = new google.maps.Geocoder;
    let $this = this;
    let options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 5
    };

    this.nativeGeocoder.reverseGeocode(lattitude, longitude, options)
      .then((result: NativeGeocoderResult[]) => {
        this.address = "";

        let responseAddress = [];
        for (let [key, value] of Object.entries(result[0])) {

          if (value.length > 0)
            responseAddress.push(value);

        }

        responseAddress.reverse();
        for (let value of responseAddress) {
          this.address += value + ", ";
        }
        this.address = this.address.slice(0, -2);
      })
      .catch((error: any) => {
        var latlng = { lat: parseFloat(lattitude), lng: parseFloat(longitude) };
        let responseAddress = [];
        geocoder.geocode({ 'location': latlng }, function (result, status) {
          if (status === 'OK') {

            $this.address = "";

            for (let [key, value] of Object.entries(result[0])) {
              responseAddress.push(value);
            }

            responseAddress.reverse();

            for (let value of responseAddress) {
              $this.address += value + ", ";
            }

            $this.address = responseAddress[4];
          } else {
            console.log('Geocoder failed due to: ' + status);
            if (status == 'ZERO_RESULTS') {
              $this.address = "Dirección no encontrada...";
            }
          }
        });
      });

  }

  async saveAddress(data) {
    this.modalController.dismiss(data.address, 'setAdd');
  }

  cancelAdd() {
    this.modalController.dismiss();
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
