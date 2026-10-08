import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { ServerService } from '../service/server.service'; 
 
@Component({
  standalone: false,
  selector: 'app-info',
  templateUrl: './info.page.html',
  styleUrls: ['./info.page.scss'],
})
export class InfoPage implements OnInit {

  data:any;
  text:any;
  ViewPic: boolean = false;
  Pic: any;
  constructor(
    public server: ServerService,
    private route: ActivatedRoute,
    public nav: NavController,
    private cdr: ChangeDetectorRef
  ) {

   this.text = JSON.parse(localStorage.getItem('app_text'));
   this.route.queryParams.subscribe( params => {
    if (params.id) {
      var lid = localStorage.getItem('lid') ? localStorage.getItem('lid') : 0;
      var lat = localStorage.getItem("current_lat") ? localStorage.getItem("current_lat") : 0;
      var lng = localStorage.getItem("current_lng") ? localStorage.getItem("current_lng") : 0;

      this.server.getStore(params.id+"?lid="+lid+"&lat="+lat+"&lng="+lng).subscribe((data:any) => {
          console.log(data)
          if (data.data) {
            this.data = data.data[0];
            this.cdr.detectChanges();
          }else {
            this.nav.navigateRoot('home');
          }
      });
    }else {
      this.nav.navigateRoot('home');
    }
  }); 
   

  }

  ngOnInit() 
  {
  	
  }

  Viewpic(Pic) {
    this.Pic = Pic;
    this.ViewPic = true;
  }

  closevp() {
    this.ViewPic = false;
  }

}
