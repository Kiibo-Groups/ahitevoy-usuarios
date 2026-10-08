import { Component, OnInit } from '@angular/core';
import { ServerService } from '../service/server.service';
import { ToastController,Platform,LoadingController,NavController } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-lang',
  templateUrl: './lang.page.html',
  styleUrls: ['./lang.page.scss'],
})

export class LangPage implements OnInit {

  data:any;
  lid = "none";
  type:any;
  text:any;
  constructor(public server : ServerService,public toastController: ToastController,public loadingController: LoadingController,private nav: NavController)
  {
    if(localStorage.getItem('lid'))
    {
      this.lid =  localStorage.getItem('lid');
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
      message: 'Please wait...',
      mode: 'ios'
    });
    await loading.present();

  	 
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

  setLang(id,type)
  {
    this.lid = id;
    this.type = type;
  }

  update()
  {
    if (this.type == undefined) {
      this.type = 0;
    } 
    
    localStorage.setItem('lid',this.lid);
    localStorage.setItem('app_type',this.type);

    this.presentToast("El idioma se ah actualizado con exito.");

    if (localStorage.getItem('city_id')) {
      this.nav.navigateRoot('/home');
    }else {
      this.nav.navigateRoot('/city');
    }

    
  }
}
