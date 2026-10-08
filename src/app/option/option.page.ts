import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastController, Platform, NavController, LoadingController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { ServerService } from '../service/server.service';


@Component({
  standalone: false,
  selector: 'app-option',
  templateUrl: './option.page.html',
  styleUrls: ['./option.page.scss'],
})
export class OptionPage implements OnInit {

  item:any;
  currency:any;
  itemID:any;
  itemPrice:any;
  itPrice: any;
  notes:any;
  addonData:any = [];
  addonPrice: any = 0;
  text:any;
  cart:any = [];
  showToolbar = false;
  cart_no: any;
  addonQtyData: any = {};
  count: any;
  data: any;
  qty: any;

  cart_total:any;

  radio_items = [];

  checkActive = false;
  max_required: any = 0;
  required_complet: any = 0;

  max_radio = 1;
  count_radio = 0;
  constructor(
    public modalController: ModalController,
    public server : ServerService,
    public toastController: ToastController,
    public route: ActivatedRoute,
    public nav: NavController,
    public loadingController: LoadingController,
    private cdr: ChangeDetectorRef
    ) {
      this.route.queryParams.subscribe( params => {
        this.item     = JSON.parse(params.item);
        this.currency = params.currency;
        this.cart     = params.cart;

        this.text = JSON.parse(localStorage.getItem('app_text'));
        this.itemPrice = parseFloat(this.item.s_price);
        this.itPrice   = parseFloat(this.item.s_price);
        this.itemID = 1;
        this.qty    = 1;
        this.cart_no = localStorage.getItem('cart_no');
        this.data = JSON.parse(params.item);

        // Order Sort_no
        this.item.addon.sort((a,b) => {
          return parseFloat(a.cate_sort_no) - parseFloat(b.cate_sort_no);
        });
       
        for (let r = 0; r < this.item.addon.length; r++) {
          const element = this.item.addon[r];

          if (element.required == 1) {
            if (element.max_options > 0) {
              this.max_required = this.max_required + element.max_options;
            }else {
              this.max_required = this.max_required + 1;
            }
          }

          if (element.single_opcion == 0) {
            this.radio_items = element.items;
          }
        }
      }); 
  }

  ngOnInit() {
    
  }

  ViewCart() 
  {
    var lid = localStorage.getItem('lid') ? localStorage.getItem('lid') : 0;
    var lat = localStorage.getItem('current_lat') ? localStorage.getItem('current_lat') : 0;
    var lng = localStorage.getItem('current_lng') ? localStorage.getItem('current_lng') : 0; 

  	this.server.getCart(localStorage.getItem('cart_no')+"?lid="+lid+"&lat="+lat+"&lng="+lng+"&user_id="+localStorage.getItem('user_id')).subscribe((response:any) => {
      this.cart_total = Number(response.data.total);
    });
  }

  async addToCart()
  {
    const loading = await this.loadingController.create({});
    await loading.present();

    var allData = {
      cart_no : this.cart_no,
      id : this.item.id,
      price : this.itPrice,
      qtype : this.itemID,
      type:0,
      qty: this.qty,
      addon : this.addonData,
      addon_qty: this.addonQtyData,
      price_comm: this.data.c_value
    };
    this.server.addToCart(allData).subscribe((response:any) => {
      loading.dismiss();
      this.count = response.data.count;
      this.cart  = response.data.cart;
      this.presentToast("Elemento Agregado.");
      this.nav.back();
    });
  }


  Qty(process) {

    if (process == 'sum') {
      this.qty += 1;
    }else {
      this.qty -= 1;
    }
    
    this.calculateTotal();
  }

  calculateTotal() {
    this.itemPrice = (Number(this.itPrice) + Number(this.addonPrice)) * Number(this.qty);
    this.cdr.detectChanges();
  }

  async updateCart()
  {
    await this.modalController.dismiss({proces: 'updateTocart',id:this.item.id,price:this.itemPrice,type:this.itemID,addonData : this.addonData, addonQtyData: this.addonQtyData});
  }

  async closeModal() {
    await this.modalController.dismiss({data:true});
  }

  selectItem(type,price)
  {
    this.itemID     = type;
    this.itPrice    = price;
    this.calculateTotal();
  }

  addonSelect(addon,max_options,formu,required,type,event)
  {
    
    if (type == 'check') {
      let form = document.getElementsByClassName('cate_'+formu);
    
      let count = 0;

      for (let i = 0; i < form.length; i++) {
        const element: any = form[i];
        if (element.checked) {
          count = count+1;
        }
      }

      if (count == max_options) {
        if (max_options > 0) {
          for (let i = 0; i < form.length; i++) {
            const element: any = form[i];
            if (element.checked === false) {
              element.setAttribute('disabled','true');
            }
          }
        }
      }else {
        for (let i = 0; i < form.length; i++) {
          const element: any = form[i];
          if (element.checked === false) {
            element.setAttribute('disabled','false');
          }
        }      
      }
     
      if(this.addonData.includes(addon.id))
      {
        if (required == true) {
          if (this.required_complet > 0) {
            this.required_complet = this.required_complet - 1;
          }
        }
        
        var ind = this.addonData.indexOf(addon.id);
        this.addonPrice = Number(this.addonPrice) - Number(addon.price);
        this.calculateTotal();
        this.addonData.splice(ind,1);
      }
      else
      {
        if (required == true) {
          this.required_complet = this.required_complet + 1;
          console.log('requiredmax: '+this.required_complet);
        }else {
          console.log('requiremin: '+this.required_complet);
        }
        
        this.addonData.push(addon.id);
        this.addonPrice = Number(this.addonPrice) + Number(addon.price);
        this.calculateTotal();
      }    

    }else {
      
      var ind;
      let includes = false;
      let priceRest:any = 0;
    
      for (let r = 0; r < this.item.addon.length; r++) {
        const element = this.item.addon[r];
        if (element.cate_id == formu) {
          this.radio_items = element.items;
        }
      }

      if (this.radio_items.length > 0) {
        for (let rad = 0; rad < this.radio_items.length; rad++) {
          const element = this.radio_items[rad];
          if (this.addonData.includes(element.id)) {
            includes = true;
            ind = this.addonData.indexOf(element.id);
            priceRest = element.price || 0;
            break;
          }
        }
      }

      if(includes)
      {
        this.addonPrice = Number(this.addonPrice) - Number(priceRest);
        this.addonData.splice(ind,1);
        if (required == true) {
          this.required_complet = this.required_complet - 1;
        }
      }

      this.addonPrice = Number(this.addonPrice) + Number(addon.price || 0);
      this.calculateTotal();
     
      if (required == true) {
        this.required_complet = this.required_complet + 1;
      }
      
      this.addonData.push(addon.id);
    }
  }

  addonQtySelect(addon, category, operation) {
    let currentQty = this.addonQtyData[addon.id] || 0;
    
    // Calcular suma actual de esta categoría
    let sumCategory = 0;
    for (let item of category.items) {
      sumCategory += (this.addonQtyData[item.id] || 0);
    }

    if (operation === 'sum') {
      if (category.max_options > 0 && sumCategory >= category.max_options) {
        this.presentToast(`Máximo ${category.max_options} opciones permitidas.`);
        return;
      }
      this.addonQtyData[addon.id] = currentQty + 1;
      this.addonPrice = Number(this.addonPrice) + Number(addon.price);
      this.calculateTotal();
      
      // Añadir al arreglo addonData si es el primero
      if (currentQty === 0) {
         this.addonData.push(addon.id);
      }
      
      if (category.required == 1) {
          this.required_complet = this.required_complet + 1;
      }
    } else {
      if (currentQty > 0) {
        this.addonQtyData[addon.id] = currentQty - 1;
        this.addonPrice = Number(this.addonPrice) - Number(addon.price);
        this.calculateTotal();
        
        if (this.addonQtyData[addon.id] === 0) {
          let ind = this.addonData.indexOf(addon.id);
          if(ind > -1) this.addonData.splice(ind, 1);
        }
        
        if (category.required == 1 && this.required_complet > 0) {
            this.required_complet = this.required_complet - 1;
        }
      }
    }
    
    this.cdr.detectChanges();
  }

  formVal() {
    if (this.required_complet >= this.max_required) {
      return true;
    }
    return false;
  }

  hasCart(id)
  {
    for(var i =0;i<this.cart.length;i++)
    {
      if(this.cart[i].item_id == id)
      {
        return this.cart[i].qty;
      }
    }

    return 1;
  }

  async presentToast(txt) {
    const toast = await this.toastController.create({
      message: txt,
      duration: 2000,
      position : 'top'
    });
    toast.present();
  }
}