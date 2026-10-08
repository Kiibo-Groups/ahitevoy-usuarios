import { Component,Input, OnInit } from '@angular/core';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { ServerService } from '../../service/server.service';
// import { Stripe } from '@ionic-native/stripe/ngx';
 
declare var OpenPay;
@Component({
  standalone: false,
  selector: 'app-form-card',
  templateUrl: './form-card.page.html',
  styleUrls: ['./form-card.page.scss'],
})
export class FormCardPage implements OnInit {
  @Input() total_amount: any;

  admin:any;
  user:any;
  loadingCard: any;
  deviceSessionId: any;
  stripe_id: any;
  payment_id : any;
  constructor(
    public server: ServerService,
    public toastController: ToastController,
    public loadingController: LoadingController,
    
    public modalController: ModalController
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter(){
    
    this.admin = JSON.parse(localStorage.getItem('admin'));
    if(this.admin.stripe_client_id)
    {
      this.stripe_id    = this.admin.stripe_client_id;
    }
    // OpenPay.setId(this.admin.openpay_client_id);
    // OpenPay.setApiKey(this.admin.openpay_public_key);
    // OpenPay.setSandboxMode(true);
   
    // this.deviceSessionId = OpenPay.deviceData.setup();

    this.server.userInfo(localStorage.getItem('user_id')).subscribe((response:any) => {
      this.user = response.data;
    });

    
    console.log("Credenciales",this.stripe_id, this.total_amount);
  }

  
  async payWithStripe(data)
  {
    const loading = await this.loadingController.create({
      mode: 'ios'
    });
    await loading.present();

    if(data.card_number.length > 10 && data.expiration_month && data.expiration_year && data.cvv2)
    {
        loading.dismiss();
        // this.stripe.setPublishableKey(this.stripe_id);

        let card = {
          number: data.card_number,
          expMonth: data.expiration_month,
          expYear: data.expiration_year,
          cvc: data.cvv2
        }

        // this.stripe.createCardToken(card)
        //   .then(token => {
        //     this.makePayment(token.id);
        //   })
        //   .catch(error => {
        //     this.presentToast("Por favor ingrese detalles de pago válidos",'danger');
        //   });
    }
    else
    {
      loading.dismiss();
      this.presentToast("Por favor ingrese detalles de pago válidos",'danger');
    }
  }

  async makePayment(token)
  {
    const loading = await this.loadingController.create({
      message: 'Enviando Informacion...',
      mode: 'ios'
    });
    await loading.present();

    this.server.makeStripePayment("?token="+token+"&amount="+this.total_amount).subscribe((response:any) => {
      loading.dismiss();
      if(response.data == "done")
      {
        this.payment_id = response.id;

        if(this.payment_id)
        {
          // Cerramos el Modal
          this.modalController.dismiss(this.payment_id,'transaction_success');
        }else {
          this.modalController.dismiss();
        }
      }
      else
      {
        this.presentToast("Algo salió mal. Por favor, vuelva a intentarlo.",'danger');
        this.modalController.dismiss();
      }

    });
  }

  async createToken(data)
  {
    const loading = await this.loadingController.create({
      mode:'ios'
    });
    await loading.present();

    // Generamos el token de la tarjeta
    let ParamsToken = {
      "card_number": data.card_number, //"5555555555554444",
      "holder_name": data.holder_name, //"Juan Perez Ramirez",
      "expiration_year":data.expiration_year, //"21",
      "expiration_month": data.expiration_month, //"06",
      "cvv2":data.cvv2, //"110",
    }
    
    OpenPay.token.create(ParamsToken,(suc,err) => {
      loading.dismiss();
      
      if (err) {
        this.presentToast(err.message,'danger');
      }else {
        console.log("Token creado con exito...");
        this.addCard(suc.data.id);
      }
    });

    setTimeout(() => {
      loading.dismiss();
    }, 800);
  }

  async addCard(id)
  {
    const loading = await this.loadingController.create({
      message: 'Guardando datos...'
    });
    await loading.present();

    var cardRequest = {
      'user_id'  : this.user.id,
      "customer" : this.user.customer_id,
      'token_id' : id,
      'deviceSessionId' : this.deviceSessionId
    }

    // Generamos el Token de la tarjeta
    this.server.setCardClient(cardRequest).subscribe((data:any) => {
      
      loading.dismiss();
      if (data.data != 'error') {
        // this.loadingCard.dismiss();
        if (data.data.status == true) {
          this.presentToast("Tarjeta agregada con exito.",'success');
          this.modalController.dismiss();
        }else {
          this.presentToast(this.ControlFails(data.data.data.error_code),'danger');
        }
      }else {
        this.presentToast("Algo ha ocurrido mal, por favor vuelve a intentar mas tarde",'danger');
      }
    });
  }
 
  ControlFails(code_error)
  {
    switch (code_error) {
      case 3001:
          return 'La tarjeta fue rechazada.'
        break;
      case 3002:
        return 'La tarjeta ha expirado.'
        break;
      case 3003:
        return 'La tarjeta no tiene fondos suficientes.'
        break;
      case 3004:
        return 'La tarjeta ha sido identificada como una tarjeta robada.'
        break;
      case 3005:
        return 'La tarjeta ha sido rechazada por el sistema antifraudes.'
        break;
      case 1003:
        return 'La tarjeta ha sido rechazada por el sistema antifraudes.'
        break;
      default:
        return 'La tarjeta fue rechazada.';
        break;
    }
  }

  closeForm()
  {
    this.modalController.dismiss();
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
}
