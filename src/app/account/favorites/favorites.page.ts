import { LoadingController, NavController, ToastController } from '@ionic/angular';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ServerService } from '../../service/server.service';
 
@Component({
  standalone: false,
  selector: 'app-favorites',
  templateUrl: './favorites.page.html',
  styleUrls: ['./favorites.page.scss'],
})
export class FavoritesPage implements OnInit {

  showLoading: Boolean = false;
  fakeData = [1,2,3,4,5,6,7];
  data = [];
  text: any;
  constructor(
    public server: ServerService,
    public nav: NavController,
    public toastController: ToastController,
    public loadingController: LoadingController,
    private cdr: ChangeDetectorRef
  ) { 

  }

  ngOnInit() {
  }

  ionViewWillEnter(){
    this.text = JSON.parse(localStorage.getItem('app_text'));

    this.loadData();
  }

  loadData()
  {
    var lat = localStorage.getItem("current_lat") ? localStorage.getItem("current_lat") : 0;
    var lng = localStorage.getItem("current_lng") ? localStorage.getItem("current_lng") : 0;

    this.data = [];
    this.server.GetFavorites(localStorage.getItem('user_id')+"?lid="+localStorage.getItem('lid')+"&lat="+lat+"&lng="+lng).subscribe((data:any) => {
      this.data = data.data; 
      this.data.reverse();
      this.showLoading = true;
      this.cdr.detectChanges();
    });
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

  async trashElement(element)
  {
    const loading = await this.loadingController.create({
      mode: 'ios'
    });
    await loading.present();

    this.server.TrashFavorite(element,localStorage.getItem('user_id')).subscribe((response:any) => {
      loading.dismiss();
      if (response.data != 'done') {
        this.presentToast("Ocurrio un problema al intentar eliminar este elemento","danger");
      }

      this.loadData();
    });
  }

  async presentToast(txt,color) {
    const toast = await this.toastController.create({
      message: txt,
      duration: 2000,
      position : 'top',
      color: color
    });
    toast.present();
  }

}
