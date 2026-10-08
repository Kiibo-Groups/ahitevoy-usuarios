import { Component, OnInit } from '@angular/core';
import { ServerService } from '../../service/server.service';
import { ToastController,Platform,LoadingController,NavController } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-city',
  templateUrl: './city.page.html',
  styleUrls: ['./city.page.scss'],
})

export class CityPage implements OnInit {

  text:any;
  data:any;
  cityID:any;
  cityName:any;
  heading:string = 'Porfavor selecciona tu ciudad para continuar.';
  constructor(public server : ServerService,public toastController: ToastController,public loadingController: LoadingController,private nav: NavController)
  {
    if(localStorage.getItem('city_id'))
    {
      this.cityID = localStorage.getItem('city_id');
      this.cityName = localStorage.getItem('city_name');
      this.heading = "Want to change your city? Select & continue.";
    }

    this.text = JSON.parse(localStorage.getItem('app_text'));
  }

  ngOnInit()
  {
  	this.loadData();
  }

  async loadData()
  {
  	const loading = await this.loadingController.create({
      message: 'Cargando Ciudades Disponibles...',
      mode: 'ios'
    });
    await loading.present();

    var lat = localStorage.getItem("current_lat") ? localStorage.getItem("current_lat") : 0;
    var lng = localStorage.getItem("current_lng") ? localStorage.getItem("current_lng") : 0;

  	this.server.city("&lat="+lat+"&lng="+lng).subscribe((response:any) => {
      this.data = response.data;
      this.text = response.text;
      this.OrderAz(this.data);
      loading.dismiss();
  	});
  }

  OrderAz(data) {
    data.sort(function(a, b){return a.name.toLowerCase().localeCompare(b.name.toLowerCase());})
  }
 
 async presentToast(txt) {
    const toast = await this.toastController.create({
      message: txt,
      duration: 2000,
      position : 'top'
    });
    toast.present();
  }

  search(ev) {
   
    // set val to the value of the ev target
    var val = ev.target.value;

    if(val && val.length > 0)
    {
        if (val && val.trim() != '') {
        this.data = this.data.filter((item) => {
        return (item.name.toLowerCase().indexOf(val.toLowerCase()) > -1);
        })
      }
    }
    else
    {
        return this.loadData();
    }
   
  
  }

  setCity(id,name)
  {
    this.cityID   = id;
  	this.cityName = name;
  }

  async city()
  {
    if(this.cityID)
  	{
  	  if(localStorage.getItem('user_id') && localStorage.getItem('user_id') != 'null')
      {
          localStorage.setItem('city_id',this.cityID);
          localStorage.setItem('city_name',this.cityName);
          const loading = await this.loadingController.create({
          message: 'Porfavor espere...',
          duration: 3000
          });
          await loading.present();

          this.presentToast('Ciudad actualizada exitosamente.');
          this.nav.navigateRoot('/home');
          loading.dismiss();
          // Lo dejamos pendiente
          this.server.updateCity("id="+localStorage.getItem('user_id')+"&city_id="+this.cityID).subscribe((response:any) => {});
      } 
      else
      {
          localStorage.setItem('city_id',this.cityID);
          localStorage.setItem('city_name',this.cityName);

          this.presentToast('City Updated Successfully.');
          
          this.nav.navigateRoot('/home');
      }
  	}
  	else
  	{
		this.presentToast('Por favor seleccione ciudad para continuar.');
  	}
  }
}
