import { IonBadge, IonInput, ModalController } from '@ionic/angular';
import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-filters',
  templateUrl: './filters.page.html',
  styleUrls: ['./filters.page.scss'],
})
export class FiltersPage implements OnInit {
  
  filter: Number = 0;
  distance_max: Number = 1;
  store_status: Boolean = false;
  distance_status: Boolean = false;
  constructor(
    public modalController: ModalController
  ) { }

  ngOnInit() {
  }

  IonViewWillEnter() 
  {
    
  }

  select_filters(badge)
  {
   this.filter = badge;
  }

  applyFilters()
  {

    if (this.distance_status == false) {
      this.distance_max = 6;
    }

    this.modalController.dismiss({
      filter: this.filter,
      distance_max: this.distance_max,
      status: this.store_status,
      distance_status : this.distance_status
    },'change_filter');
  }

  closeFilters()
  {
    this.modalController.dismiss({},'not_change');
  }
}
