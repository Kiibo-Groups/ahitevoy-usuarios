import { Component, Renderer2, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ServerService } from '../service/server.service';
import { EventsService } from '../service/events.service';
import {
  NavController,
  LoadingController,
  MenuController,
  ToastController,
  IonContent,
  IonToolbar,
  DomController,
  ActionSheetController,
  ModalController
} from '@ionic/angular';
import { NavigationExtras } from '@angular/router';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';
import { FiltersPage } from '../filters/filters.page';

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  @ViewChild(IonContent, { static: false }) Content: IonContent;
  @ViewChild(IonToolbar, { static: false }) toolbar: IonToolbar;

  BannerOption = {
    slidesPerView: 1.3,
    loop: false,
    centeredSlides: false,
    autoplay: true,
    speed: 700,
    spaceBetween: 10,
  }

  CategorysOption = {
    slidesPerView: 'auto',
    loop: false,
    centeredSlides: false,
    autoplay: true,
    speed: 700,
    spaceBetween: 6,
  }

  TrendOption = {
    initialSlide: 0,
    slidesPerView: 1.2,
    loop: false,
    centeredSlides: false,
    autoplay: true,
    speed: 800,
    spaceBetween: -9,
  }

  city_name: any;
  city_id: any;
  data: any;
  fakeData = [1, 2, 3, 4, 5, 6, 7];
  showLoading = false;
  filterPress: any;
  count: any;
  text: any;
  order: any;
  LastVisitStore = [];
  fk_items = [];
  isKeyboardHide = true;
  ComerceRest = [];
  ComerceFilters = [];
  ViewComerceFilters: boolean = false;
  address: any;
  headr: any;
  InTrendingStore = [];
  ComerceRestClose = [];
  Tot_stores = 0;
  let_init = 0;
  let_end: boolean = false;
  arr_filters = [];
  serviceComm = [];
  viewPageServices: string = 'delivery';
  constructor(
    public server: ServerService,
    public events: EventsService,
    public nav: NavController,
    
    public loadingController: LoadingController,
    public menu: MenuController,
    public toastController: ToastController,
    private renderer: Renderer2,
    private domCtrl: DomController,
    public actionSheetController: ActionSheetController,
    public modalController: ModalController,
    private cdr: ChangeDetectorRef
  ) { }

  ionViewWillEnter() {
    let appTextStr = localStorage.getItem('app_text');
    try {
      this.text = (appTextStr && appTextStr !== 'null' && appTextStr !== 'undefined') ? (JSON.parse(appTextStr) || {}) : {};
    } catch (e) {
      this.text = {};
    }
    this.headr = document.getElementsByClassName('header')[0];
    this.address = localStorage.getItem("address");
    this.menu.enable(true);
    this.viewPageServices = 'delivery';
    if (Capacitor.isNativePlatform()) {
      Keyboard.addListener('keyboardWillShow', () => { this.isKeyboardHide = false; });
      Keyboard.addListener('keyboardWillHide', () => { this.isKeyboardHide = true; });
    }

    if (this.city_id != localStorage.getItem('city_id')) {
      this.city_name = localStorage.getItem('city_name');
      this.city_id = localStorage.getItem('city_id') && localStorage.getItem('city_id') != 'null' ? localStorage.getItem('city_id') : 0;
      // this.loadData(localStorage.getItem('city_id')+"?ss=ss");
    }
    
    let current_city = localStorage.getItem('city_id') && localStorage.getItem('city_id') != 'null' ? localStorage.getItem('city_id') : 0;
    this.loadData(current_city + "?ss=ss");

    this.events.subscribe('change_city', (city_id) => {
      this.loadData(city_id + "?ss=ss");
    });

    this.server.cartCount(localStorage.getItem('cart_no') + "?user_id=" + localStorage.getItem('user_id')).subscribe((response: any) => {
      this.count = response.data;
      this.order = response.order;
    });
    this.verifyUser();
  }

  ngOnInit() {
  }

  async loadData(city_id) {
    this.let_init = 0;
    this.data = null;
    this.ViewComerceFilters = false;

    // Obtenemos las coordenadas
    if (this.address == '') {
      this.server.getGeolocation();
      this.cdr.detectChanges();
    }

    var lid = localStorage.getItem('lid') ? localStorage.getItem('lid') : 0;
    var lat = localStorage.getItem("current_lat") ? localStorage.getItem("current_lat") : 0;
    var lng = localStorage.getItem("current_lng") ? localStorage.getItem("current_lng") : 0;

    this.server.homepage(city_id + "&lid=" + lid + "&lat=" + lat + "&lng=" + lng + "&user_id=" + localStorage.getItem('user_id')).subscribe((response: any) => {
      this.data = response.data;
      this.Tot_stores = response.data.Tot_stores;
      // Obtenemos los comercios de donde se ha pedido comida
      this.getLastCommPed();
      // Obtenemos todas la categorias
      this.getTypeStore(response.data.Categorys);
      // Obtenemos los comercios en tendencia
      this.GetTrendingStore(response.data.trending);

      this.ComerceRest = [];
      this.ComerceRestClose = [];
      for (let r = 0; r < response.data.store.length; r++) {
        const element = response.data.store[r];
        this.ComerceRest.push(element);
      }

      if (this.Content) {
        this.Content.scrollToPoint(0, 0, 300);
      }
      if (this.headr) {
        this.domCtrl.write(() => {
          this.renderer.setStyle(this.headr, 'transition', 'margin-top 300ms');
        });
      }

      setTimeout(() => {
        this.showLoading = true;
        this.cdr.detectChanges();
      }, 1000);

    });
  }

  loadMoreData(event) {
    setTimeout(() => {
      this.let_init += 5;
      var lid = localStorage.getItem('lid') ? localStorage.getItem('lid') : 0;
      var lat = localStorage.getItem("current_lat") ? localStorage.getItem("current_lat") : 0;
      var lng = localStorage.getItem("current_lng") ? localStorage.getItem("current_lng") : 0;
      var current_city = localStorage.getItem('city_id') && localStorage.getItem('city_id') != 'null' ? localStorage.getItem('city_id') : 0;
      var city_id = current_city + "?ss=ss";

      this.server.getMoreStores(city_id + "&lid=" + lid + "&lat=" + lat + "&lng=" + lng + "&init=" + this.let_init + "&user_id=" + localStorage.getItem('user_id')).subscribe((response: any) => {

        for (let r = 0; r < response.data.store.length; r++) {
          const element = response.data.store[r];
          this.ComerceRest.push(element);
        }

        this.data.store = this.ComerceRest;
        this.cdr.detectChanges();
        event.target.complete();
      });

      if (this.ComerceRest.length >= this.Tot_stores) {
        event.target.disabled = true;
        this.let_end = true;
      }
    }, 500);
  }

  verifyUser() {
    this.server.userInfo(localStorage.getItem('user_id')).subscribe((response: any) => {
      if (response.data) {
        // Verificamos si el telefono es null
        if (response.data.phone == 'null') {
          this.presentToast("Por favor, Ingresa un número telefonico", "danger");
          this.nav.navigateBack('/profile');
          // Verificamos si esta bloqueado
        } else if (response.data.status == 1) {
          this.nav.navigateBack('/locked');
          // Verificamos si no cuenta con un customer id para OpenPay
        } else if (response.data.customer_id == '') {
          this.signupOP(response.data);
        }

        // Si no ha cambiado la pass de Facebook
        if (response.data.password == response.data.pswfacebook) {
          this.presentToast("Te recomendamos cambiar tu contraseña", "danger");
        }

        // Verificamos si ya tiene una direccion de entrega (Eliminado para permitir navegación sin ciudad)

        // Verificamos Mandaditos
        this.chkEvents_comm();
      } else {
        localStorage.removeItem('user_id');
      }

      this.events.publish('user', response.data);
    });
  }

  signupOP(data) {
    let allData = {
      'id': data.id,
      'name': data.name,
      'email': data.email,
      'phone': data.phone
    }
    
    this.server.signupOP(allData).subscribe((data: any) => {/** */});
  }

  getLastCommPed() {
    this.LastVisitStore = [];
    if (localStorage.getItem('LastStore')) {

      let LastComm = JSON.parse(localStorage.getItem('LastStore'));

      for (let i = 0; i < LastComm.length; i++) {
        const element = LastComm[i];
        var lid = localStorage.getItem('lid') ? localStorage.getItem('lid') : 0;
        var lat = localStorage.getItem("current_lat") ? localStorage.getItem("current_lat") : 0;
        var lng = localStorage.getItem("current_lng") ? localStorage.getItem("current_lng") : 0;
        this.server.getStore(element.store_id + "?lid=" + lid + "&lat=" + lat + "&lng=" + lng + "&user_id=" + localStorage.getItem('user_id')).subscribe((data: any) => {
          if (data.data) {
            if (i <= 3) {
              this.LastVisitStore.push(data.data[0]);
            }
          }
        });

      }

      this.LastVisitStore.sort((a, b) => {
        return parseFloat(a.id) - parseFloat(b.id);
      });

    }
  }

  GetTrendingStore(data) {
    this.InTrendingStore = [];
    for (let t = 0; t < data.length; t++) {
      const element = data[t];
      if (element.open == true) {
        this.InTrendingStore.push(element);
      }
    }
    this.InTrendingStore.reverse();
  }

  getTypeStore(List_type: any) {
    this.fk_items = []; // Limpiamos
    List_type.forEach(element => {
      if (element.status == 0) {
        this.fk_items.push({
          'id': element.id,
          'name': element.name,
          'img': element.img,
          'sort_no': element.sort_no
        });
      }
    });

    // Ordenamos por sort id
    this.fk_items.sort((a, b) => {
      this.filterPress = 0;
      return parseFloat(b.sort_no) - parseFloat(a.sort_no);
    });

    this.fk_items.reverse();

  }

  // Add this method to your HomePage component class
  getAddressPreview(address: string): string {
    return address ? address.substring(0, 17) : '';
  }

  async trashLasComm() {
    localStorage.removeItem('LastStore');
    this.loadData(localStorage.getItem('city_id') + "?ss=ss");
  }

  async delay(ms: number) {

    return new Promise(resolve => setTimeout(resolve, ms));
  }

  bannerLink(offer) {

    if (offer.link) {
      let city_id = localStorage.getItem('city_id') + "?banner=" + offer.id;
      var lid = localStorage.getItem('lid') ? localStorage.getItem('lid') : 0;
      var lat = localStorage.getItem("current_lat") ? localStorage.getItem("current_lat") : 0;
      var lng = localStorage.getItem("current_lng") ? localStorage.getItem("current_lng") : 0;
      this.server.homepage(city_id + "&lid=" + lid + "&lat=" + lat + "&lng=" + lng).subscribe((response: any) => {
        this.itemPage(response.data.store[0]);
      });
    }
  }

  doRefresh(event) {
    setTimeout(() => {
      this.loadData(localStorage.getItem('city_id') + "?ss=ss");
      event.target.complete();
    }, 2000);
  }

  itemPage(storeData) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        store: storeData.title,
        id: storeData.id
      }
    };

    this.nav.navigateForward(['/item'], navigationExtras);

  }

  ViewCat(Name) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        Cat: Name
      }
    };
    this.nav.navigateForward(['/categorys'], navigationExtras);
  }

  ViewCats() {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        Cat: 'Search'
      }
    };
    this.nav.navigateForward(['/categorys'], navigationExtras);
  }

  async ViewFilters() {
    const modal = await this.modalController.create({
      component: FiltersPage,
      cssClass: 'my-custom-filters-class',
      backdropDismiss: true,
    });

    modal.onWillDismiss().then(data => {
      if (data.role == 'change_filter') {
        this.showLoading = false;
        this.arr_filters = []; // Limpiamos
        this.ComerceFilters = []; // Limpiamos

        // Agregamos las categorias
        this.FiltersTags(data);
        // Agregamos los filtros
        this.server.SearchFilters(localStorage.getItem('city_id') + "?distance_max=" + data.data.distance_max + "&status=" + data.data.status + "&filter=" + data.data.filter + "&lat=" + localStorage.getItem('current_lat') + "&lng=" + localStorage.getItem('current_lng') + "&lid=" + localStorage.getItem('lid') + "&user_id=" + localStorage.getItem('user_id')).subscribe((data: any) => {
          this.ViewComerceFilters = true;
          this.ComerceFilters = data.data;
          this.showLoading = true;
          this.cdr.detectChanges();
        });
      }
    });

    return await modal.present();
  }

  FiltersTags(data) {
    if (data.data.status == true) { // Solo comercios abiertos
      this.arr_filters.push({
        name: "Comercios abiertos"
      });
    } else {
      this.arr_filters.push({
        name: "Estatus General"
      });
    }

    if (data.data.distance_status == true) {
      this.arr_filters.push({
        name: "Distancia - " + data.data.distance_max + "km"
      });
    } else {
      this.arr_filters.push({
        name: "Sin Rango de distancia"
      });
    }

    if (data.data.filter == 0) {
      this.arr_filters.push({
        name: "Más Recientes"
      });
    }

    if (data.data.filter == 1) {
      this.arr_filters.push({
        name: "Cercanos"
      });
    }

    if (data.data.filter == 2) {
      this.arr_filters.push({
        name: "Entrega Rápida"
      });
    }

    if (data.data.filter == 3) {
      this.arr_filters.push({
        name: "Costos de envio más bajos"
      });
    }

    if (data.data.filter == 4) {
      this.arr_filters.push({
        name: "Con Ofertas"
      });
    }

    if (data.data.filter == 5) {
      this.arr_filters.push({
        name: "En Tendencia"
      });
    }

    if (data.data.filter == 6) {
      this.arr_filters.push({
        name: "Mejor Calificados"
      });
    }
  }

  /**
   * Favorites Functions
   * @param $element 
   */

  Favorites(element) {

    let wrap: HTMLDivElement = document.querySelector('.element_fav_' + element);
    wrap.className = "heart element_fav_" + element + " is_animating";

    let allData = {
      store_id: element,
      user_id: localStorage.getItem('user_id')
    }

    this.server.SetFavorite(allData).subscribe((data: any) => {
      if (data.data != 'done') {
        wrap.className = "heart element_fav_" + element;
        this.presentToast("Ha ocurrido un problema", 'danger');
      }
    });
  }

  ViewPageChanged(ev) {
    switch (ev.detail.value) {
      case 'services':
        this.NewComm(1);
        break;
    }
  }

  /**
   * Funcion de servicios
   * 
   */
  NewComm(filter) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        filter: filter
      }
    };
    this.nav.navigateForward(['/commanded'], navigationExtras);
  }

  chkEvents_comm() {
    this.server.chkEvents_comm(localStorage.getItem('user_id')).subscribe((data: any) => {
      this.serviceComm = data.data;
    });
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