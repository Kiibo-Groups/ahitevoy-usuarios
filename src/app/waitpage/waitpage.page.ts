import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-waitpage',
  templateUrl: './waitpage.page.html',
  styleUrls: ['./waitpage.page.scss'],
})
export class WaitpagePage implements OnInit {

  constructor(
    public route: ActivatedRoute,
    public nav: NavController
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter(){
    this.route.queryParams.subscribe( params => {
        if (params.redirect) {
          this.RedirectPage(params.redirect);
        }
    });
  }


  RedirectPage(page)
  {
    setTimeout(() => {
      this.nav.navigateRoot(page);
    }, 1500);
  }

}
