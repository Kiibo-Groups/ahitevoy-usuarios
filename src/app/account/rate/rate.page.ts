import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServerService } from '../../service/server.service';
import { ToastController,NavController,Platform,LoadingController } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-rate',
  templateUrl: './rate.page.html',
  styleUrls: ['./rate.page.scss'],
})

export class RatePage implements OnInit {

  oid:any;
  type: any;
  star 		= 0;
  star_staff1 = 0
  staf_staff2 = 0;
  text:any;

  constructor(private route: ActivatedRoute,public server : ServerService,public toastController: ToastController,private nav: NavController,public loadingController: LoadingController){

  	this.oid = this.route.snapshot.paramMap.get('id');
  	this.type = this.route.snapshot.paramMap.get('type');
    this.text = JSON.parse(localStorage.getItem('app_text'));

  }

  ngOnInit()
  {
  	
  }

  setStar(val)
  {
  	this.star = val;
  }

  setStarS1(val)
  {
    this.star_staff1 = val;
  }

  setStarS2(val)
  {
    this.staf_staff2 = val;
  }

  async giveRating(data)
  {
  	if(this.star == 0)
  	{
  		this.presentToast('Seleccione cualquier calificación para continuar.');
  	}
  	else
  	{
  		 const loading = await this.loadingController.create({
	      message: 'Enviando Calificación',
	      duration: 3000
	    });
	    await loading.present();

      var allData = {
        comment : data.comment,
        user_id : localStorage.getItem('user_id'),
        star : this.star,
        star_staff1 : this.star_staff1,
        star_staff2 : this.staf_staff2,
        oid : this.oid,
        type: this.type
      }

	  	this.server.rating(allData).subscribe((response:any) => {
		    this.presentToast('¡Gracias! Calificación enviada con éxito.');	
        this.nav.navigateBack('/order');
        loading.dismiss();
	  	});
  	}
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
