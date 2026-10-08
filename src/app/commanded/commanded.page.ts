import { Component, OnInit, ViewChild, NgZone, ChangeDetectorRef } from '@angular/core';
import { AlertController, IonSearchbar, LoadingController, ModalController, NavController, ToastController, PopoverController } from '@ionic/angular';
import { ServerService } from '../service/server.service';
import { Geolocation } from '@capacitor/geolocation';;
// import { NativeGeocoder, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { SetaddressPage } from './setaddress/setaddress.page';
import { ActivatedRoute } from '@angular/router';
import { FormCardPage } from '../account/form-card/form-card.page';

declare var google;

@Component({
  standalone: false,
  selector: 'app-commanded',
  templateUrl: './commanded.page.html',
  styleUrls: ['./commanded.page.scss'],
})
export class CommandedPage implements OnInit {


  @ViewChild("searchad", { static: false }) searchad: IonSearchbar;

  title_text: string;
  resumen_text: string = "Resumen de tu Servicio";
  resumen_subtext: string = "Envia y recibe lo que necesites, Si cabe en nuestra maleta, te lo llevamos...";
  user: any;
  admin: any;
  max_cash: number = 0;
  data: any;
  searchQuery: any;
  hasSearch: any;
  address: any;
  set_type_address: any;
  address_origin: any;
  lat_orig: any;
  lng_orig: any;
  address_destin: any;
  lat_dest: any;
  lng_dest: any;
  LocationNow: any;
  GoogleAutocomplete: any;
  autocomplete: { input: string; };
  autocompleteItems: any[];
  lat: any;
  lng: any;
  MyLocation = [];

  step_comm: Number = 0;
  text_address: String = "Punto de recolección";

  first_instr: String = "";
  second_instr: String = "";

  ready: Boolean = false;
  cost_ship: any;


  payment_id: any;
  paypal_id: any;
  stripe_id: any;
  iva_stripe: any;
  comm_stripe: any;
  total_amount: any;
  otype: number;
  add_cash: any = 0;
  filter_prop: Number = 0;
  propina: number = 0;
  chargeInProcess: boolean = false;
  filter: any;
  order_store: any;
  store_id: any;

  shipping_insurance_comm: any;
  shipping_insurance: any;
  max_insurance: any;
  declared_value: number;
  constructor(
    public route: ActivatedRoute,
    public modalController: ModalController,
    public nav: NavController,
    public server: ServerService,
    public zone: NgZone,
    public toastController: ToastController,
    public loadingController: LoadingController,
    public alertController: AlertController,
    private cdr: ChangeDetectorRef
  ) {

  }


  ngOnInit() {
  }

  ionViewWillEnter() {
    this.admin = JSON.parse(localStorage.getItem('admin'));
    this.shipping_insurance_comm = this.admin.shipping_insurance;
    this.max_insurance = this.admin.max_insurance;
    this.max_cash = this.admin.max_cash;
    this.autocomplete = { input: '' };
    this.searchQuery = null;
    this.hasSearch = false;
    this.autocompleteItems = [];

    this.comm_stripe = this.admin.comm_stripe;
    if (this.admin.stripe_client_id) this.stripe_id = this.admin.stripe_client_id;

    // Si no cuenta con metodo de pago predeterminado Redireccionamos
    if (!localStorage.getItem('otype_user') && localStorage.getItem('otype_user') == null) {
      this.presentToast("Agrega un método de pago predeterminado.", 'warning');
      this.nav.navigateForward('/option-pay');
    } else {
      this.otype = JSON.parse(localStorage.getItem('otype_user'));
    }

    this.route.queryParams.subscribe(params => {
      if (params.filter) {
        this.title_text = "Realiza tu mandadito personalizado";
        this.filter = params.filter;
        if (this.filter == 0) { // Servicio desde un punto hasta su ubicacion
          this.address_destin = localStorage.getItem('address');
          this.chargeMap(this.address_destin, 'address_destin');
        } else if (this.filter == 1) { // Enviar algo desde mi ubicacion
          this.address_origin = localStorage.getItem('address');
          this.chargeMap(this.address_origin, 'address_origin');
        }
      }
    });

    this.loadData();
  }

  ngAfterViewInit() {
    if (!localStorage.getItem('user_id') || localStorage.getItem('user_id') == null) {
      this.presentToast("Por favor, inicia sesión para continuar", "danger");
      this.nav.navigateRoot('/welcome');
    }
  }

  loadData() {
    this.server.getAllAdress(localStorage.getItem('user_id')).subscribe((response: any) => {
      this.address = response.data;
      this.cdr.detectChanges();
    });

    // Obtenemos la ubicación actual
    Geolocation.getCurrentPosition().then((resp) => {
      this.lat = resp.coords.latitude;
      this.lng = resp.coords.longitude;
      this.getAddressFromCoords(resp.coords.latitude, resp.coords.longitude);
    }).catch((error) => {
      this.cdr.detectChanges();
    });
  }

  async getAddressFromCoords(lattitude, longitude) {
    this.server.GeocodeFromCoords(lattitude, longitude, this.admin.ApiKey_google).subscribe(async (data: any) => {

      if (data.status == "OK") {
        await data.results.forEach(req => {
          req.types.forEach(type => {
            if (type == 'street_address') {
              this.zone.run(() => {
                let formatted_address = req.formatted_address;
                this.LocationNow = formatted_address;
                this.MyLocation.push({
                  "lat": req.geometry.location.lat,
                  "lng": req.geometry.location.lng,
                  "address": req.formatted_address
                });
              });
            }
          });
        });

        this.cdr.detectChanges();
      }
    });

  }

  search(ev) {

    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();

    var val = ev.target.value;
    
    if (val && val.length > 0) {
      this.data = null;
      this.hasSearch = val;
      if (this.autocomplete.input == '') {
        this.autocompleteItems = [];
        return;
      }
      // this.server.GeocodeFromAddress(encodeURIComponent(this.autocomplete.input), this.admin.ApiKey_google).subscribe((predictions:any) => {
      //   this.autocompleteItems = [];
      //   this.zone.run(() => {
      //     console.log(predictions);
      //     predictions.results.forEach((prediction) => { 
      //       this.autocompleteItems.push(prediction);
      //     });
      //   });
      // });

      this.GoogleAutocomplete.getPlacePredictions({
        input: this.autocomplete.input,
        country: "MX",
        region: "MX"
      },
        (predictions, status) => {
          this.autocompleteItems = [];
          this.zone.run(() => {
            predictions.forEach((prediction) => {
              this.autocompleteItems.push(prediction);
            });
          });
        });
    }
    else {
      this.ngOnInit();
      this.hasSearch = false;
    }
  }

  clearSearch() {
    this.searchQuery = null;
    this.hasSearch = false;
    this.autocompleteItems = [];
    this.autocomplete = { input: '' };
  }

  chkTypeAdd(type) {

    if (type == 0) {
      return 'Hogar';
    }

    if (type == 1) {
      return 'Oficina';
    }

    if (type == 2) {
      return 'Pareja';
    }
  }

  SelectSearchResult(item) {
    if (this.set_type_address == 'origin') {
      this.address_origin = item.description;
      this.step_comm = 2;
      this.chargeMap(this.address_origin, 'address_origin');
    } else {
      this.address_destin = item.description;
      this.step_comm = 3;
      this.chargeMap(this.address_destin, 'address_destin');
    }
  }

  chargeMap(address, type) {
    // Obtenemos las coordenadas de la direccion de recoleccion
    this.server.GeocodeFromAddress(encodeURIComponent(address), this.admin.ApiKey_google).subscribe((results: any) => {
      if (type == 'address_origin') {
        this.lat_orig = results.results[0].geometry.location.lat;
        this.lng_orig = results.results[0].geometry.location.lng;
      } else {
        this.lat_dest = results.results[0].geometry.location.lat;
        this.lng_dest = results.results[0].geometry.location.lng;
      }
    });

  }

  async saveAddress(item) {
    if (this.set_type_address == 'origin') {
      this.address_origin = item.address;
      this.step_comm = 2;
      this.chargeMap(this.address_origin, 'address_origin');
    } else {
      this.address_destin = item.address;
      this.step_comm = 3;
      this.chargeMap(this.address_destin, 'address_destin');
    }
  }

  async removeAddress(id) {
    const loading = await this.loadingController.create({
      mode: 'ios'
    });
    await loading.present();

    this.server.trashAddress(id).subscribe(data => {
      loading.dismiss();
      if (data) {
        this.presentToast("La dirección se ha eliminado...", 'success');
        this.clearSearch();
      } else {
        this.presentToast(data, 'danger');
      }
    });
  }

  next_step(step) {

    if (step == 'back') {
      this.step_comm = 0;
    }

    if (step == "add_origin") {
      this.step_comm = 1;
      this.set_type_address = "origin";
      this.text_address = "Punto de recolección";
      this.clearSearch();

      setTimeout(() => {
        this.searchad.setFocus();
      }, 400);

    } else if (step == "add_destin") {
      if (!this.filter) {
        this.set_type_address = "destination";
        this.text_address = "Punto de entrega";
        this.step_comm = 1;
        this.clearSearch();
        setTimeout(() => {
          this.searchad.setFocus();
        }, 400);
      } else {
        if (this.filter == 0) { // Servicio desde un punto hasta su ubicacion
          this.next_step('add_cash');
        } else { // Enviar algo desde mi ubicacion
          this.set_type_address = "destination";
          this.text_address = "Punto de entrega";
          this.step_comm = 1;
          this.clearSearch();
          setTimeout(() => {
            this.searchad.setFocus();
          }, 400);
        }
        this.cdr.detectChanges();
      }

    } else if (step == 'add_cash') {
      this.step_comm = 4;
      this.set_type_address = "add_cash";
      this.text_address = "Monto de pago";
      this.clearSearch();
      this.cdr.detectChanges();
    } else if (step == 'ready') {
      // Verificamos que existan ambas direcciones
      if (!this.address_destin) {
        // this.presentToast("Agrega un destino para tu servicio","warning");
        this.next_step("add_destin");
      } else if (!this.address_origin) {
        // this.presentToast("Agrega un punto de partida para tu servicio","warning");
        this.next_step("add_origin")
      } else {

        // validamos si existe un monto sobre el valor declarado del producto
        if (this.declared_value > 0) {
          // if (this.declared_value < this.max_insurance) {

          // }
          // Realizamos el calculo
          let comm_sgip = (this.declared_value * this.shipping_insurance_comm) / 100;
          this.shipping_insurance = comm_sgip.toFixed(2);
          console.log(this.shipping_insurance);
        } else {
          this.shipping_insurance = 0;
        }

        this.step_comm = 0;
        setTimeout(() => {
          // Cargamos costos de envio
          this.ViewCostShipCommanded();
        }, 500);
      }
    }
  }

  next_step_btn(step) {
    if (step == "add_origin") {
      this.step_comm = 1;
      this.set_type_address = "origin";
      this.text_address = "Punto de recolección";
      this.clearSearch();

      setTimeout(() => {
        this.searchad.setFocus();
      }, 400);
    } else if (step == "add_destin") {
      this.set_type_address = "destination";
      this.text_address = "Punto de entrega";
      this.step_comm = 1;
      this.clearSearch();
      setTimeout(() => {
        this.searchad.setFocus();
      }, 400);
    }
  }

  Qty(process) {

    if (process == 'sum') {
      this.add_cash += 1000;
    } else {
      this.add_cash -= 1000;
    }
  }

  changeQty(evt) {
    this.add_cash = evt.detail.value;
  }

  select_filters_prop(badge) {
    this.filter_prop = badge;
    this.total_amount = Number(this.total_amount) - this.propina; // Descontamos lo que tenga anteriormente
    switch (badge) {
      case 0:
        this.propina = 0;
        break;
      case 1:
        this.propina = 10;
        break;
      case 2:
        this.propina = 25;
        break;
      case 3:
        this.propina = 50;
        break;
      case 4:
        this.propina = 100;
        break;
      default:
        this.propina = 0;
        break;
    }

    this.total_amount = Number(this.total_amount) + this.propina; // Agregamos el nuevo valor
  }

  setOtype(id) {
    this.otype = id;
  }

  async ViewCostShipCommanded() {
    const loading = await this.loadingController.create({
      mode: 'ios'
    });
    await loading.present();

    let allData = {
      lat_orig: this.lat_orig,
      lng_orig: this.lng_orig,
      lat_dest: this.lat_dest,
      lng_dest: this.lng_dest,
      order_store: this.order_store,
      store_id: this.store_id,
      city_id: localStorage.getItem('city_id')
    }

    this.server.ViewCostShipCommanded(allData).subscribe((data: any) => {
      loading.dismiss();
      if (data.data.service == 1) {
        this.ready = true;
        this.cost_ship = data.data;
        this.total_amount = (data.data.costs_ship + data.data.service_fee + Number(this.shipping_insurance));
      } else {
        this.presentToast("No se ha podido calcular los cargos de envio", 'danger');
      }

      this.cdr.detectChanges();
    });
  }

  async selectAddressMap() {
    const modal = await this.modalController.create({
      component: SetaddressPage,
      animated: true,
      mode: 'ios', 
      backdropDismiss: false,
      showBackdrop: true,
    });

    modal.onDidDismiss().then((data) => {
      if (data.role == 'setAdd') {
        if (this.set_type_address == 'origin') {
          this.address_origin = data.data;
          this.step_comm = 2;
          this.chargeMap(this.address_origin, 'address_origin');
        } else {
          this.address_destin = data.data;
          this.step_comm = 3;
          this.chargeMap(this.address_destin, 'address_destin');
        }
      } else {
        this.step_comm = 1;
      }
    });

    return await modal.present();
  }

  closeComm() {
    this.nav.navigateRoot('/home');
  }

  getComm(total, comm) {
    let com = (total * comm) / 100;
    this.iva_stripe = com.toFixed(2);
    return this.iva_stripe;
  }

  makeOrder() {
    if (this.otype == 3) {
      this.chargeInProcess = true;
      this.ConfirmPayStripe();
    }else {
      // Verificamos el monto maximo para cobro en efectivo
      if (this.total_amount > this.max_cash) {
        this.amountCashMax();
      } else {
        this.order();
      }
    }
  }

  async order() {
    // Comenzamos la carga
    this.chargeInProcess = true;

    let allData = {
      address_origin: this.address_origin,
      lat_orig: this.lat_orig,
      lng_orig: this.lng_orig,
      address_destin: this.address_destin,
      lat_dest: this.lat_dest,
      lng_dest: this.lng_dest,
      first_instr: this.first_instr,
      second_instr: this.second_instr,
      user_id: localStorage.getItem('user_id'),
      price_comm: this.iva_stripe,
      payment_id: this.payment_id,
      d_charges: this.cost_ship['costs_ship'],
      payment_method: this.otype,
      propina: this.propina,
      add_cash: this.add_cash,
      total: this.total_amount,
      declared_value: this.declared_value,
      shipping_insurance: this.shipping_insurance,
      order_store: this.order_store,
      store_id: this.store_id
    }

    this.server.OrderComm(allData).subscribe((data: any) => {
      if (data.data == 'done') {
        setTimeout(() => {
          this.presentToast("Tu solicitud ha sido enviada", 'success');
          this.nav.navigateRoot('/home');
        }, 400);

      } else {
        console.log("Error => ", data.error);
        this.presentToast("Ha ocurrido un problema con el servidor, por favor intente mas tarde.", 'danger');
        this.nav.navigateRoot('/home');
      }
    });

  }

  async amountCashMax() {
    const alert = await this.alertController.create({
      header: 'Advertencia!',
      subHeader: "El monto máximo para pagos en efectivo es de $" + this.max_cash,
      message: "¿Deseas cambiar el metodo de pago?",
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            this.presentToast("Puedes Seleccionar otro método de pago en tu sección 'Métodos De Pago' ", "warning");
          }
        }, {
          text: 'Cambiar',
          handler: () => {
            this.nav.navigateForward('/option-pay');
          }
        }
      ]
    });
    await alert.present();
  }

  async ConfirmPayStripe() {
    const alert = await this.alertController.create({
      header: 'Advertencia!!',
      message: 'El pago via tarjeta de Crédito/Débito genera una comisión de ' + this.comm_stripe + " %",
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            this.presentToast("Por favor, selecciona otro método de pago", 'warning');
            this.chargeInProcess = false;
          }
        }, {
          text: 'Aceptar',
          handler: () => {
            this.chargeInProcess = true;
            this.total_amount = Number(this.total_amount) + Number(this.getComm(this.total_amount, this.comm_stripe));

            console.log(this.total_amount);
            this.payWithStripe(this.total_amount);
          }
        }
      ]
    });
    await alert.present();
  }

  async payWithStripe(total) {
    const modal = await this.modalController.create({
      component: FormCardPage,
      animated: true,
      mode: 'ios',
      cssClass: 'my-custom-addcard-class',
      backdropDismiss: false,
      showBackdrop: true,
      componentProps: {
        'total_amount' : total
      }
    });

    modal.onDidDismiss().then((data) => { 
      if (data.role == 'transaction_success') {
        this.payment_id = data.data;
        this.order();
      }else {
        this.chargeInProcess = false;
      }
    });

    return await modal.present();
  }

  async infoDeclaredValue() {
    const alert = await this.alertController.create({
      header: 'Nuevos terminos y condiciones',
      message: 'El pago via tarjeta de Crédito/Débito genera una comisión de ' + this.comm_stripe + " %",
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            this.presentToast("Puedes Seleccionar otro método de pago.", "warning");
          }
        }, {
          text: 'Aceptar',
          handler: () => {
            let amount_tot = Number(this.total_amount) + Number(this.getComm(this.total_amount, this.comm_stripe));
            this.payWithStripe(amount_tot);
          }
        }
      ]
    });
    await alert.present();
  }

  async presentToast(txt, color) {
    const toast = await this.toastController.create({
      message: txt,
      duration: 2000,
      position: 'top',
      color: color
    });
    toast.present();
  }

}
