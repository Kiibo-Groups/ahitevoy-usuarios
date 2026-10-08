import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { LoadingController, NavController, ToastController } from '@ionic/angular';
import { ServerService } from '../../../service/server.service';
import { EventsService } from '../../../service/events.service';
import { Geolocation } from '@capacitor/geolocation';;
// import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { NavigationExtras } from '@angular/router';
declare var google;


@Component({
  standalone: false,
  selector: 'app-setaddress',
  templateUrl: './setaddress.page.html',
  styleUrls: ['./setaddress.page.scss'],
})
export class SetaddressPage implements OnInit {
  
  data:any;
  admin:any;
  searchQuery: any;
  hasSearch:any;
  address:any;
  LocationNow:any;
  MyLocation = [];
  GoogleAutocomplete: any;
  autocomplete: { input: string; };
  autocompleteItems: any[];
  lat:any;
  lng:any;
  constructor(
    public server: ServerService,
    public events: EventsService,
    public toastController: ToastController,
    public zone: NgZone,
    public nav: NavController,
    public loadingController: LoadingController,
    private cdr: ChangeDetectorRef
  ) { 
    
  }

  ngOnInit() {
  }

  ionViewWillEnter()
  {   
    this.admin = JSON.parse(localStorage.getItem('admin'));
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.autocomplete = { input: '' };
    this.searchQuery = null;
    this.hasSearch   = false;
    this.autocompleteItems = [];
    
    this.loadData(); 
  }

  loadData()
  {
    this.server.getAllAdress(localStorage.getItem('user_id')).subscribe((response:any) => {
      this.address = response.data;
    });

    // Obtenemos la ubicación actual
    Geolocation.getCurrentPosition().then((resp) => {
      this.lat = resp.coords.latitude;
      this.lng = resp.coords.longitude;
      this.getAddressFromCoords(resp.coords.latitude, resp.coords.longitude);
    }).catch((error) => {
      console.log('Error al obtener la ubicación', error);
      this.cdr.detectChanges();
    });
  }

  getAddressFromCoords(lattitude, longitude) {
    this.server.GeocodeFromCoords(lattitude, longitude,this.admin.ApiKey_google).subscribe((data:any) => {
      let formatted_address = data.results[0].formatted_address;
      this.LocationNow = formatted_address;
      this.MyLocation.push({
        "lat"          : data.results[0].geometry.location.lat,
        "lng"          : data.results[0].geometry.location.lng,
        "address"      : this.LocationNow
      });
      this.cdr.detectChanges();
    });
   
  }

  search(ev)
  {
    var val = ev.target.value;
    if(val && val.length > 0)
    {
      this.data      = null;
      this.hasSearch = val;
      if (this.autocomplete.input == '') {
        this.autocompleteItems = [];
        return;
      }
      this.GoogleAutocomplete.getPlacePredictions({ input: this.autocomplete.input },
      (predictions, status) => {
        this.autocompleteItems = [];
        this.zone.run(() => {
          predictions.forEach((prediction) => {
            this.autocompleteItems.push(prediction);
          });
        });
      });
    }
    else
    {
      this.ngOnInit();
      this.hasSearch = false;
    }
  }
  
  clearSearch() {
    this.searchQuery = null;
    this.hasSearch   = false;
    this.autocompleteItems = [];
  }

  SelectSearchResult(item)
  {
    var geocoder = new google.maps.Geocoder;
    let $this = this;
    // let options: NativeGeocoderOptions = {
    //   useLocale: true,
    //   maxResults: 2
    // };

    geocoder.geocode({'placeId': item.place_id}, function(results, status) {
      if (status !== 'OK') {
        window.alert('Geocoder failed due to: ' + status);
        return;
      }
      let navigationExtras: NavigationExtras = {
        queryParams: {
          location: JSON.stringify(results[0].geometry.location),
          address: item.description
        }
      };
      $this.nav.navigateForward(['/address'], navigationExtras);
    });
  }
  
  selectAltamira() {
    var geocoder = new google.maps.Geocoder();
    let $this = this;
    geocoder.geocode({ address: 'Altamira, Tamaulipas, México' }, function(results, status) {
      if (status === 'OK' && results[0]) {
        let navigationExtras: NavigationExtras = {
          queryParams: {
            location: JSON.stringify(results[0].geometry.location),
            address: 'Altamira, Tamaulipas, México'
          }
        };
        $this.nav.navigateForward(['/address'], navigationExtras);
      } else {
        $this.presentToast('No se pudo obtener la ubicación de Altamira', 'danger');
      }
    });
  }

  removeAddress(id) {
    this.server.trashAddress(id).subscribe(data => {
        if (data) {
          this.presentToast("La dirección se ha eliminado...",'success');
          this.ionViewWillEnter();
        }else {
          this.presentToast(data,'danger');
        }
    });
  }

  async saveAddress(item,type)
  {
    const loading = await this.loadingController.create({
      message: 'Guardando Dirección...',
    });
    await loading.present();
    // Cargamos la ciudad
    var lat = item.lat; //localStorage.getItem("current_lat") ? localStorage.getItem("current_lat") : 0;
    var lng = item.lng; //localStorage.getItem("current_lng") ? localStorage.getItem("current_lng") : 0;

    this.server.GetNearbyCity("&lat="+lat+"&lng="+lng).subscribe((response:any) => {
      if (response.data.nearby == true) {
        if(localStorage.getItem('user_id') && localStorage.getItem('user_id') != 'null')
        {
            localStorage.setItem('city_id',response.data.data[0].id);
            localStorage.setItem('city_name',response.data.data[0].name);

            this.events.publish('change_city',response.data.data[0].id);
            this.server.updateCity("id="+localStorage.getItem('user_id')+"&city_id="+response.data.data[0].id).subscribe(() => {});
        } 
        else
        {
          localStorage.setItem('city_id',response.data.data[0].id);
          localStorage.setItem('city_name',response.data.data[0].name);
          this.events.publish('change_city',response.data.data[0].id);
        }
        
        if (type == 'LocationNow') {
          var allData = {
            address : item.address,
            lat : this.lat,
            lng : this.lng,
            user_id : localStorage.getItem('user_id')
          }  
    
          this.server.saveAddress(allData).subscribe((response:any) => {
            if (response.msg == 'done') {
              localStorage.setItem("address",item.address);
              localStorage.setItem('address_id',response.id);
              localStorage.setItem("current_lat",this.lat);
              localStorage.setItem('current_lng',this.lng);
            }else {
              // this.presentToast(JSON.stringify(response.data),'danger');  
            }
            
            loading.dismiss();
            this.nav.navigateForward('home');
            this.presentToast("Dirección guardada con éxito.",'success');
            
          });
        }else{
          localStorage.setItem("address",item.address);
          localStorage.setItem('address_id',item.id);
          localStorage.setItem("current_lat",item.lat);
          localStorage.setItem('current_lng',item.lng);
          
          loading.dismiss();
          this.nav.navigateForward('home');
          this.presentToast("Dirección guardada con éxito.",'success');
        }

      }else {
        loading.dismiss();
        this.presentToast("Aún no tenemos servicio en esta ubicación",'danger');
      }
    }); 
    
  }

  
  async presentToast(txt,color) {
    const toast = await this.toastController.create({
      message: txt,
      duration: 2000,
      position : 'top',
      color:color
    });
    toast.present();
  }

  

}
