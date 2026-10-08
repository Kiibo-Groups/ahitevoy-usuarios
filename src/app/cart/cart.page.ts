import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ServerService } from '../service/server.service';
import { ToastController, Platform, LoadingController, NavController, ModalController, AlertController } from '@ionic/angular';
import { OfferPage } from '../offer/offer.page';
import { FormCardPage } from '../account/form-card/form-card.page';
import { InfoFeePage } from './info-fee/info-fee.page'; 
import { Geolocation } from '@capacitor/geolocation';;
 

declare var OpenPay;

@Component({
  standalone: false,
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})

export class CartPage implements OnInit {

  data:any;
  dataAddress:any;
  address_id:any;
  address:any;
  payment:any;
  payment_id : any;
  total_amount:any;
  paypal_id:any;
  fakeData: [1,2,3,4,5,6];
  discount:any;
  text:any;
  cart_total: Number = 0;
  Subtotal: Number = 0;
  otype:number;
  delivery_type:any;
  admin:any;
  notes: any;
  count: any = 0;

  store_id:any;
  real_lat: any;
  real_lng: any;
 
  user: any;
  cardData:any;

  chargeInProcess:boolean = false;
  store_status: boolean = false;
  order_status: boolean = true;

  max_cash:Number = 0;
  
  comm_stripe: any;
  iva_stripe:any;
  stripe_pay: boolean = false;
  stripe_id:any;
  constructor(
    public modalController: ModalController,
    public server : ServerService,
    public toastController: ToastController,
    public loadingController: LoadingController,
    public alertController: AlertController, 
    private nav: NavController,
    private cdr: ChangeDetectorRef
     
  )
  {
    this.text = JSON.parse(localStorage.getItem('app_text'));
    this.address = localStorage.getItem('address_id');
    this.admin = JSON.parse(localStorage.getItem('admin'));
    
    // Obtenemos el maximo en efectivo
    this.max_cash = this.admin.max_cash;
    if(this.admin.stripe_client_id)
    {
      this.stripe_id    = this.admin.stripe_client_id;
    }

    this.comm_stripe   = this.admin.comm_stripe;
  }

  ngOnInit()
  {
    this.admin = JSON.parse(localStorage.getItem('admin'));
    // OpenPay.setId(this.admin.openpay_client_id);
    // OpenPay.setApiKey(this.admin.openpay_public_key);
    // OpenPay.setSandboxMode(true);
  }

  ionViewWillEnter()
  { 
    let flag: boolean = true; 
    // Obtenemos las coordenadas reales
    this.RealCoords();
    // Si no esta logeado Redireccionamos
    if(!localStorage.getItem('user_id') || localStorage.getItem('user_id') == 'null')
    {
      this.presentToast("Por favor inicia sesión para continuar.",'danger');
      this.nav.navigateRoot('/login');
      return;
    }

    // Si no cuenta con direccion agregada Redireccionamos
    if (!localStorage.getItem("address") || localStorage.getItem("address") == 'null') {
      this.presentToast("Agrega una dirección para la entrega.",'warning');
      this.nav.navigateForward('/setaddress');
      return;
    }else {
      this.address_id = localStorage.getItem('address_id');
      this.address    = localStorage.getItem("address");
    }

    // Si no cuenta con metodo de pago predeterminado Redireccionamos
    if (!localStorage.getItem('otype_user') || localStorage.getItem('otype_user') == 'null') {
      this.presentToast("Agrega un método de pago predeterminado.",'warning');
      this.nav.navigateForward('/option-pay');
      return;
    }else {
      this.otype = JSON.parse(localStorage.getItem('otype_user'));
      if (this.otype == 3) {
        // Si el metodo de pago es tarjeta D/B la obtenemos
        // if (localStorage.getItem('cardPredClient') && localStorage.getItem('cardPredClient') != null) {
        //   this.getCard(localStorage.getItem('cardPredClient'));
        // }else {
        //   this.presentToast("Agrega un método de pago predeterminado.",'warning');
        //   this.nav.navigateForward('/option-pay');
        // }
      }
    }
    
    // Si llegamos hasta aquí, todo está configurado correctamente
    this.loadData();
    
  }

  async loadData()
  {
    this.data = [];
    var lid = localStorage.getItem('lid') ? localStorage.getItem('lid') : 0;
    var lat = localStorage.getItem('current_lat') ? localStorage.getItem('current_lat') : 0;
    var lng = localStorage.getItem('current_lng') ? localStorage.getItem('current_lng') : 0; 

  	this.server.getCart(localStorage.getItem('cart_no')+"?lid="+lid+"&lat="+lat+"&lng="+lng+"&user_id="+localStorage.getItem('user_id')).subscribe((response:any) => {
     
      this.data       = response.data;
      this.cart_total = (response.data.total + Number(response.data.c_charges));
      this.store_id   = response.data.store_id;
      this.store_status= response.data.store_status;
      
      this.server.cartCount(localStorage.getItem('cart_no')+"?user_id="+localStorage.getItem('user_id')).subscribe((response:any) => {
        this.count = response.data;
        if (response.order == 0) {
          this.order_status = false;
          this.cdr.detectChanges();
        }
      });

      this.cdr.detectChanges();
    });
  }

  async getCard(cardId)
  {
    // Obtenemos la info del usuario
    this.server.userInfo(localStorage.getItem('user_id')).subscribe((response:any) => {
      this.user = response.data;
      let allData = {
        'customer' : response.data.customer_id,
        'cardId'   : cardId
      };
      
      this.server.getCard(allData).subscribe((data:any) => {
        console.log("Card => ",data);
        if (data.data.status == true) {
          this.cardData = data.data.data;
        }else {
          this.presentToast(data.data.description,'danger');
        }
      });
    });
  }

  async updateCart(id,type)
  {
    const loading = await this.loadingController.create({
      mode:'ios'
    });
    await loading.present();

    var lat = localStorage.getItem("current_lat") ? localStorage.getItem("current_lat") : 0;
    var lng = localStorage.getItem("current_lng") ? localStorage.getItem("current_lng") : 0;

    this.server.updateCart(id,type+"?lid="+localStorage.getItem('lid')+"&lat="+lat+"&lng="+lng).subscribe((response:any) => {
      this.data = response.data;
      this.cart_total = (response.data.total + Number(response.data.c_charges));
      
      this.server.cartCount(localStorage.getItem('cart_no')+"?user_id="+localStorage.getItem('user_id')).subscribe((response:any) => {
        this.count = response.data;
      });
      loading.dismiss();
      this.cdr.detectChanges();
    });
  }

  async deleteAll(){
    const loading = await this.loadingController.create({
      mode:'ios'
    });
    await loading.present();


    this.server.deleteAll(localStorage.getItem('cart_no')).subscribe((response:any) => {
      loading.dismiss();
      if (response.data == 'done') {
        this.ionViewWillEnter();
      }else {
        this.presentToast(response.data,'danger');
      }
      this.cdr.detectChanges();
    });
  }
 
  async coupen() {
    const modal = await this.modalController.create({
      component: OfferPage,
      animated:true,
      mode:'ios',
      cssClass: 'my-custom-modal-css',
      backdropDismiss:false, 
    });

    modal.onDidDismiss().then(data=>{
      if(data.data.id)
      {
        this.applyCoupen(data.data.id);
        this.cdr.detectChanges();
      }
    });

    return await modal.present();
  }

  async applyCoupen(id)
  {
    const loading = await this.loadingController.create({
        message: 'Please wait...',
        mode:'ios'
      });
      await loading.present();

      var lid = localStorage.getItem('lid') ? localStorage.getItem('lid') : 0;
      var lat = localStorage.getItem('current_lat') ? localStorage.getItem('current_lat') : 0;
      var lng = localStorage.getItem('current_lng') ? localStorage.getItem('current_lng') : 0; 

      this.server.applyCoupen(id,localStorage.getItem('cart_no')+"?lid="+lid+"&lat="+lat+"&lng="+lng).subscribe((response:any) => {
      
      if(response.msg == "done")
      {
        this.data = response.data;
      }
      else
      {
        this.presentToast(response.msg,'danger');
      }
      
      loading.dismiss();
      this.cdr.detectChanges();
      });
  }

  async infoPage()
  {
    const modal = await this.modalController.create({
      component: InfoFeePage,
      animated:true,
      mode:'ios',
      cssClass: 'my-custom-info-modal-css',
      backdropDismiss:true,
      
    });
    return await modal.present();
  }

  makeOrder()
  {
    if(!localStorage.getItem('user_id') || localStorage.getItem('user_id') == 'null')
    {
      this.nav.navigateRoot('/login');
      this.presentToast("Por favor inicia sesión para continuar.",'danger');
    }else {
      if(this.otype == 2) // Pago via Paypal
      {
        this.payPaypal();
      }
      else if(this.otype == 3) // Pago via Stripe
      {
        this.chargeInProcess = true;
        this.ConfirmPayStripe();
      }
      else // Pago en efectivo
      {
        // Verificamos la cantidad maxima para pago en efectivo
        if (this.data.total > this.max_cash) {
          this.presentToast("El monto máximo para pago en efectivo es de: $"+this.max_cash,"danger");
        }else {
          this.order();
        }

        this.cdr.detectChanges();
      }
    }
  }

  async order()
  {
    const loading = await this.loadingController.create({
      message: 'Porfavor espere...',
      mode: 'ios'
    });
    await loading.present();
    
    var lat = localStorage.getItem("current_lat") ? localStorage.getItem("current_lat") : 0;
    var lng = localStorage.getItem("current_lng") ? localStorage.getItem("current_lng") : 0;

    var allData = {
        user_id : localStorage.getItem('user_id'),
        payment : this.otype,
        address : this.address_id,
        cart_no : localStorage.getItem('cart_no'),
        payment_id : this.payment_id,
        otype : 1,
        notes:this.notes,
        lat: lat,
        lng: lng,
        real_lat : this.real_lat,
        real_lng : this.real_lng
    }

    this.server.order(allData).subscribe((response:any) => {
    
      if (response.data == 'Not_service') {
        loading.dismiss();
        this.chargeInProcess = false;
        this.presentToast('Sin servicio en tu ubicación','danger');
      }else {
        /** Agregamos a ulitmos visitados */
          let dataLS =  [];
          if (localStorage.getItem('LastStore')) {
            dataLS = JSON.parse(localStorage.getItem('LastStore'));
            let has  = dataLS.find(id => id = this.store_id);
            if (has.store_id != this.store_id) {
              dataLS.push({
                store_id: this.store_id
              });
            }
          }else {
            dataLS.push({
              store_id: this.store_id
            });
          }

          localStorage.setItem('LastStore', JSON.stringify(dataLS));
        // localStorage.setItem('order_data', JSON.stringify(response.data));
        /** Agregamos a ulitmos visitados */
       
        /** Redireccionamos al seguimiento del pedido */ 
        this.nav.navigateRoot('/done');
        this.chargeInProcess = false;
        loading.dismiss();
        this.cdr.detectChanges();
      }
    });
  }

  payPaypal()
  { 
     
  }

  payWithOpenPay()
  {
    if (this.cardData) {

      // Obtenemos el Customer
      let dat = {
        'customer' : this.user.customer_id
      };
      
      this.server.getClient(dat).subscribe((customer:any) => {
      
        if (customer.data.status == true) {
          var deviceSessionId = OpenPay.deviceData.setup();
          let order_id        = (deviceSessionId + Math.floor(Math.random()*2000000000)+1).toString().substring(1);
          let allData = {
            'source_id' : this.cardData['id'],
            'amount'    : this.data.total,
            'order_id'    : order_id,
            'device_session_id' : deviceSessionId,
            'customer_id' :  this.user.customer_id
          }

          this.server.chargeClient(allData).subscribe((data:any) => {
            this.chargeInProcess = false;
            if (data.data.status == true) {
              this.presentToast("Pago aprobado con éxito.",'success');
              this.payment_id = data.data.data.id;
              this.order();
            }else {
              this.presentToast(data.data.data.description,'danger');
            }
          });
        }else {
          this.presentToast(customer.data.data.description,'danger');
        }
      });
      
    }
  }

  /**
   * Stripe Pay
   */
  async ConfirmPayStripe() {
    const alert = await this.alertController.create({
      header: 'Advertencia!!',
      message: 'El pago via tarjeta de Crédito/Débito genera una comisión de '+this.comm_stripe+" %",
      mode:'ios',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            this.presentToast("Por favor, selecciona otro método de pago",'warning');
            this.chargeInProcess = false;
          }
        }, {
          text: 'Aceptar',
          handler: () => {
            this.chargeInProcess = true;
            this.total_amount = Number(this.data.total) + Number(this.getComm(this.data.total,this.comm_stripe));
            this.PayWithStripe();
          }
        }
      ]
    });
    await alert.present();
  }

  async PayWithStripe()
  {
    const modal = await this.modalController.create({
      component: FormCardPage,
      animated:true,
      mode:'ios',
      cssClass: 'my-custom-modal-css',
      backdropDismiss:false, 
      componentProps: {
        'total_amount' : this.total_amount
      }
    });

    modal.onDidDismiss().then(data=>{
     
      if (data.role == 'transaction_success') {
        this.payment_id = data.data;
        this.order();
      }else {
        this.chargeInProcess = false;
      }
    });

    return await modal.present();
  }
  
  getComm(total,comm) {
    this.iva_stripe = Math.round((total * comm) / 100);
    return Math.round(this.iva_stripe);
  }

  RealCoords()
  {
    Geolocation.getCurrentPosition().then((resp) => {
      this.real_lat = resp.coords.latitude;
      this.real_lng = resp.coords.longitude; 
    }).catch((error) => {
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
