import { Component, Input, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NavController, IonContent, ModalController, LoadingController, ToastController, IonSearchbar } from '@ionic/angular';
import { NavigationExtras, ActivatedRoute } from '@angular/router';

import { ServerService } from '../service/server.service';
import { EventsService } from '../service/events.service';
@Component({
  standalone: false,
  selector: 'app-categorys',
  templateUrl: './categorys.page.html',
  styleUrls: ['./categorys.page.scss'],
})
export class CategorysPage implements OnInit {
  @ViewChild('searchbar',{static:false}) searchbar: IonSearchbar;

  BannerOption = {
    loop: false,
    centeredSlides: true,
    autoplay:true,
    speed: 500,
    spaceBetween:7,
  }

  text: any;
  SearchTitle: any = "Categorías";
  SearchData = [];
  loadBody: boolean = false;
  loadItems: String = "cats";
  fk_items = [];
  fakeData = [1,2,3,4,5,6,7];
  count: any;
  searchQuery:any;
  hasSearch = false;
  data: any;
  constructor(
    private route: ActivatedRoute,
    private nav: NavController,
    public server : ServerService,
    public events: EventsService,
    public loadingController: LoadingController,
    public toastController: ToastController,
    private cdr: ChangeDetectorRef
  ) { 
    this.loadData();
    
    this.route.queryParams.subscribe(params => {
      let cat = params["Cat"];
      if (cat && cat > 0) {
        this.hasSearch = false;
        this.SearchColCategory(cat);
      }else if(cat == 'Search'){
        this.hasSearch = true;
        setTimeout(() => {
          this.searchbar.setFocus();
        },500);
      }else {
        this.hasSearch = false;
      }
    });
  }

  ngOnInit() {
    
  }
  
  ionViewWillEnter()
  {   
  

    if(localStorage.getItem('app_text'))
    {
      this.text = JSON.parse(localStorage.getItem('app_text'));
    }
  }

  viewAll() {
    this.SearchData = [];
    this.searchQuery = '';
    this.loadData();
  }

  async loadData() {
    this.SearchData = [];
    this.fk_items = []; // Vaciamos
    this.loadBody = false;
    this.loadItems = 'cats';
    this.data = [];
    this.hasSearch = false;
    
    this.server.ViewAllCats().subscribe((response: any) => {
      if (response?.data?.Categorys) {
        this.fk_items = response.data.Categorys
          .filter((element: any) => element.status == 0)
          .map((element: any) => ({
            id: element.id,
            Name: element.name,
            Img: element.img
          }));
      }
      
      this.loadBody = true;
      this.cdr.detectChanges();
    });
  }

  SearchColCategory(Cat) {
    this.loadBody  = false;
    this.loadItems = 'items';
    var lid = localStorage.getItem('lid') ? localStorage.getItem('lid') : 0;
    var lat = localStorage.getItem("current_lat") ? localStorage.getItem("current_lat") : 0;
    var lng = localStorage.getItem("current_lng") ? localStorage.getItem("current_lng") : 0;

    this.server.SearchCat(localStorage.getItem('city_id')+"?lid="+lid+"&lat="+lat+"&lng="+lng+"&cat="+Cat+"&user_id="+localStorage.getItem('user_id')).subscribe((response:any) => {
      if (response.data.length == 0) {
        this.searchQuery = '';
      }else {
        this.searchQuery = response.cat;
        this.SearchData = response.data;
      }
      
      this.loadBody = true;
      this.cdr.detectChanges();
    });
  }

  clearSearch() {
    this.data = [];
    this.searchQuery = '';
    this.hasSearch   = false;
    this.loadData();
  }

  search(ev)
  {
    var val = ev.target.value;

    if(val && val.length > 0)
    {
      this.data      = null;
      this.hasSearch = val;

      var lid = localStorage.getItem('lid') ? localStorage.getItem('lid') : 0;
      var lat = localStorage.getItem("current_lat") ? localStorage.getItem("current_lat") : 0;
      var lng = localStorage.getItem("current_lng") ? localStorage.getItem("current_lng") : 0;

      this.server.search(val,0,localStorage.getItem('city_id')+"?lid="+lid+"&lat="+lat+"&lng="+lng+"&user_id="+localStorage.getItem('user_id')).subscribe((response:any) => {
        this.data = response.data;
        this.cdr.detectChanges();
      });
    }
    else
    {
      this.ngOnInit();
      this.hasSearch = false;
    }
  }

  itemPage(storeData)
  {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        store: storeData.title,
        id: storeData.id
      }
    };

    this.nav.navigateForward(['/item'], navigationExtras);

  }

  /**
   * Favorites Functions
   * @param $element 
   */
  
   Favorites(element)
   {
 
     let wrap: HTMLDivElement = document.querySelector('.element_fav_'+element);
     wrap.className = "heart element_fav_"+element+" is_animating";
     
     let allData = {
       store_id  : element,
       user_id   : localStorage.getItem('user_id')
     }
 
     this.server.SetFavorite(allData).subscribe((data:any) => {
       if (data.data != 'done') {
         wrap.className = "heart element_fav_"+element;
         this.presentToast("Ha ocurrido un problema",'danger');
       }
     });
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

  bannerLink(offer)
  {

    if(offer.link)
    {
      let city_id = localStorage.getItem('city_id')+"?banner="+offer.id;
      var lid = localStorage.getItem('lid') ? localStorage.getItem('lid') : 0;
      var lat = localStorage.getItem("current_lat") ? localStorage.getItem("current_lat") : 0;
      var lng = localStorage.getItem("current_lng") ? localStorage.getItem("current_lng") : 0;
      this.server.homepage(city_id+"&lid="+lid+"&lat="+lat+"&lng="+lng).subscribe((response:any) => {
        this.itemPage(response.data.store[0]);
      });
    }
  }
}
