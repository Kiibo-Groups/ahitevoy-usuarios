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

  // Usar static: false para esperar a que el DOM esté listo
  @ViewChild('map', { static: false }) mapElement: ElementRef;

  admin:any;
  apiKey:string;
  map: any;
  lat: number = 0;
  lng: number = 0;
  location: any;
  address: string = '';
  type_add: any;
  text: any;
  marker: any;
  loading: any;
  mapLoaded = false;

  constructor(
    public route: ActivatedRoute,
    public server: ServerService,
    public toastController: ToastController,
    public nav: NavController,
    public loadingController: LoadingController,
    
    
    public modalController: ModalController,
    public platform: Platform
  ) {
    try {
      this.text = JSON.parse(localStorage.getItem('app_text') || '{}');
      this.admin = JSON.parse(localStorage.getItem('admin') || '{}');
      this.apiKey = this.admin.ApiKey_google;
    } catch (e) {
      this.text = {};
    }
  }

  ngOnInit() {
    // No inicializamos el mapa aquí porque la vista puede no estar renderizada aún.
  }

  // Ionic lifecycle: la vista ya está lista aquí
  ionViewDidEnter() {
    this.platform.ready().then(() => {
      this.init();
    });
  }

  async init() {
    // Spinner mientras cargamos scripts / ubicación / mapa
    this.loading = await this.loadingController.create({
      message: 'Cargando mapa...'
    });
    await this.loading.present();

    try {
      // 1) Asegurarnos de que la librería de Google Maps esté cargada
      await this.loadGoogleMaps();

      // 2) Obtener ubicación (con timeouts y fallback)
      await this.getDeviceLocation();

      // 3) Crear el mapa
      this.createMap(this.lat, this.lng);

    } catch (err) {
      console.error('Error init map:', err);
      // await this.presentToast('No se pudo cargar el mapa: ' + (err?.message || err), 'danger');
      if (this.loading) { try { await this.loading.dismiss(); } catch(e){ } }
    }
  }

  /**
   * Carga la librería de Google Maps si no está presente.
   * Reemplaza YOUR_GOOGLE_MAPS_API_KEY por tu API key en index.html o aquí.
   */
  loadGoogleMaps(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.maps) {
        return resolve();
      }

      const win = (window as any);
      if (win._googleMapsLoading) {
        console.log("Script de Google ya cargado....")
        // Si ya se está cargando, esperar
        const intv = setInterval(() => {
          if (typeof google !== 'undefined' && google.maps) {
            clearInterval(intv);
            resolve();
          }
        }, 150);
        return;
      }

      win._googleMapsLoading = true;
      const script = document.createElement('script');
      // IMPORTANTE: reemplaza YOUR_GOOGLE_MAPS_API_KEY con tu API KEY y habilita Geocoding API y Maps JS API
      script.src = 'https://maps.googleapis.com/maps/api/js?key='+this.apiKey+'&libraries=places';
      script.defer = true;
      script.async = true;
      script.onerror = (err) => reject(new Error('No se pudo cargar Google Maps JS'));
      script.onload = () => {
        resolve();
      };
      document.body.appendChild(script);
    });
  }

  /**
   * Obtiene la ubicación del dispositivo con opciones razonables y fallback.
   */
  async getDeviceLocation() {
    try {
      const resp = await Geolocation.getCurrentPosition({
        timeout: 10000,
        enableHighAccuracy: true,
        maximumAge: 30000
      });
      this.lat = resp.coords.latitude;
      this.lng = resp.coords.longitude;
      // Guardar último conocido para fallback
      localStorage.setItem('last_known_location', JSON.stringify({ lat: this.lat, lng: this.lng }));
    } catch (err) {
      console.warn('getCurrentPosition failed:', err);
      // Intentar usar el último conocido
      const last = localStorage.getItem('last_known_location');
      if (last) {
        const obj = JSON.parse(last);
        this.lat = parseFloat(obj.lat);
        this.lng = parseFloat(obj.lng);
      } else {
        // Coordenadas por defecto (Altamira, Tamps., México)
        this.lat = 22.4077462;
        this.lng = -97.92115550000001;
      }
    }
  }

  /**
   * Crea el mapa, marcador y listeners.
   */
  createMap(lat, lng) {
    const latNum = parseFloat(lat as any);
    const lngNum = parseFloat(lng as any);
    const latLng = new google.maps.LatLng(latNum, lngNum);

    const mapOptions = {
      center: latLng,
      zoom: 17,
      disableDefaultUI: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: mapStyle
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    this.marker = new google.maps.Marker({
      map: this.map,
      draggable: true,
      position: latLng
    });
    this.marker.setVisible(true);

    // Click en mapa: mover marker y obtener dirección
    this.map.addListener('click', (e) => {
      const point = e.latLng;
      this.marker.setPosition(point);
      this.getAddressFromCoords(point.lat(), point.lng());
    });

    // Drag end: actualizar coords y reverse geocode
    this.marker.addListener('dragend', (evt) => {
      const pos = this.marker.getPosition();
      const newLat = pos.lat();
      const newLng = pos.lng();
      this.lat = newLat;
      this.lng = newLng;
      this.getAddressFromCoords(newLat, newLng);
    });

    // Esperar a que los tiles se hayan cargado para cerrar el spinner
    google.maps.event.addListenerOnce(this.map, 'idle', async () => {
      this.mapLoaded = true;
      try { await this.loading.dismiss(); } catch (e) { }
    });

    // Obtener dirección inicial
    this.getAddressFromCoords(latNum, lngNum);
  }

  /**
   * Obtener dirección desde lat/lng — intenta nativeGeocoder y si falla usa Google Geocoder.
   */
  async getAddressFromCoords(lattitude: number, longitude: number) {
    // normalizar
    this.lat = parseFloat(lattitude as any);
    this.lng = parseFloat(longitude as any);

    // Intento con NativeGeocoder (cuando está disponible en dispositivo)
    // const options: any = {
    //   useLocale: true,
    //   maxResults: 1
    // };

    try {
      const result: any[] = []; // nativeGeocoder removed
      if (result && result.length > 0) {
        const r = result[0];
        // Construir dirección con las partes más útiles
        const parts = [
          r.thoroughfare,
          r.subThoroughfare,
          r.subLocality,
          r.locality,
          r.subAdministrativeArea,
          r.administrativeArea,
          r.postalCode,
          r.countryName
        ].filter(p => p && p.toString().trim().length > 0);
        this.address = parts.join(', ');
        return;
      }
      throw new Error('No native geocoder result');
    } catch (err) {
      // Fallback a Google Geocoder (funciona en Web y cuando no hay plugin)
      const geocoder = new google.maps.Geocoder();
      const latlng = { lat: parseFloat(this.lat as any), lng: parseFloat(this.lng as any) };
      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          // Usar formatted_address para una dirección limpia
          this.address = results[0].formatted_address;
        } else {
          console.warn('Google geocoder failed:', status);
          this.address = 'Dirección no encontrada...';
        }
      });
    }
  }

  // Guardar dirección: devolver objeto completo (address + lat + lng)
  async saveAddress() {
    await this.modalController.dismiss(this.address, 'setAdd'); 
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
