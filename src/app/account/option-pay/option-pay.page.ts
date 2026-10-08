import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController, ToastController, AlertController, ActionSheetController } from '@ionic/angular';
import { ServerService } from '../../service/server.service';
import { FormCardPage } from '../form-card/form-card.page'; 
 

@Component({
  standalone: false,
  selector: 'app-option-pay',
  templateUrl: './option-pay.page.html',
  styleUrls: ['./option-pay.page.scss'],
})
export class OptionPayPage implements OnInit {

  
  otype:number = (localStorage.getItem('otype_user')) ? JSON.parse(localStorage.getItem('otype_user')) : 1;
  admin: any;
  paypal_id: any;
  stripe_id:any;
  user:any;
  cards = [];
  cardPredID = (localStorage.getItem('cardPredClient')) ? localStorage.getItem('cardPredClient') : null;
  cardPredClient: any;
  viewCardPred: boolean = false;
  maxCards: boolean = true;
  text: any;
  count: any;
  send_terminal: any;
  constructor(
    public server: ServerService,
    public modalController: ModalController,
    public loadingController: LoadingController,
    public toastController: ToastController,
    public alertController: AlertController,
    public actionSheetController: ActionSheetController
  ) { 
    this.text = JSON.parse(localStorage.getItem('app_text'));
  }

  ngOnInit() {
  }

  ionViewWillEnter(){
    if (!localStorage.getItem('otype_user') && localStorage.getItem('otype_user') == null) {
      localStorage.setItem('otype_user',"1");
      this.setType(1);
    }else {
      this.setType(localStorage.getItem('otype_user'));
    }

    this.admin = JSON.parse(localStorage.getItem('admin'));
    if(this.admin.paypal_client_id){
        this.paypal_id    = this.admin.paypal_client_id;
    }
    
    this.send_terminal = this.admin.send_terminal;
    console.log("Use Terminal? ",this.send_terminal);

    this.server.userInfo(localStorage.getItem('user_id')).subscribe((response:any) => {
      this.user = response.data;
      // Obtenemos las tarjetas del cliente
      // this.GetCards();
    }); 
  }

  async GetCards()
  {
    const loading = await this.loadingController.create({
      mode:'ios'
    });
    await loading.present();

    let allData = {
      'customer' : this.user.customer_id
    }

    // Limpiamos
    this.cardPredClient = [];
    this.cards = [];
    this.viewCardPred = false;
    this.maxCards = true;
    
    this.server.GetCards(allData).subscribe((data:any) => {
      console.log(data);
      if (data.data != null) {
        
        if (data.data.status == true) {
          this.cards = data.data.data;
        }else {
          this.presentToast(data.data.data.description,'danger');
        }
        
        // Obtenemos la tarjeta predeterminada
        if (this.cards.length > 0) {
          // Limitamos el agregado de tarjetas
          if (this.cards.length >= 3) this.maxCards = false;

          for (let c = 0; c < this.cards.length; c++) {
            const element = this.cards[c];
            
            if (element.id == this.cardPredID) {
              this.cardPredClient = element;
              this.viewCardPred = true;
              break;
            }
          }
        }else {
          if (this.otype == 3) this.otype = 1;
          localStorage.setItem('otype_user',"1");
        }
      }else {
        if (this.otype == 3) this.otype = 1;
        localStorage.setItem('otype_user',"1");
      }

      loading.dismiss();
    });
  }

  async DeleteCard(cardId)
  {
    const alert = await this.alertController.create({
      header: 'Advertencia!!',
      message: "Estas a punto de eliminar esta tarjeta ¿Deseas hacerlo?",
      mode:'ios',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            this.presentToast("La tarjeta no sera eliminada.",'success');
          }
        }, {
          text: 'Aceptar',
          handler: () => {
            let allData = {
              'customer' : this.user.customer_id,
              'cardId'   : cardId
            };

            this.server.DeleteCard(allData).subscribe((data:any) => {
              if (data.data.status == true) {
                if(this.otype == 3) this.otype = 1;
                localStorage.setItem('otype_user',"1");
                this.presentToast("La tarjeta se ha eliminado.",'success');
              }else {
                this.presentToast(data.data.data.description,'danger');
              }

              // Recargamos
              this.GetCards();
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async markPred(cardId,brand,card_n)
  {

    const actionSheet = await this.actionSheetController.create({
      header: brand+" • "+card_n.substr(-4),
      cssClass: 'my-custom-class',
      mode:'md',
      buttons: [
        {
          text: 'Marcar como Principal',
          icon: 'refresh-circle',
          handler: () => {
            console.log("Marcamos como principal");
            this.cardPredID = cardId;
            localStorage.setItem("cardPredClient",cardId);
            this.otype = 3;
            localStorage.setItem('otype_user',"3");
            this.GetCards();
          }
        },
        {
          text: 'Eliminar',
          icon: 'trash',
          handler: () => {
            console.log('Eliminamos...');
            this.DeleteCard(cardId);
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    await actionSheet.present();

    const { role } = await actionSheet.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  async addNewCard()
  {
    const modal = await this.modalController.create({
      component: FormCardPage
    });

    modal.onDidDismiss().then(data=>{
      this.GetCards();
    });
    return await modal.present();
  }

  async setType(id)
  {
    const loading = await this.loadingController.create({
      mode:'ios'
    });
    await loading.present();
    this.otype = id;
    localStorage.setItem('otype_user',id);
    loading.dismiss();
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
