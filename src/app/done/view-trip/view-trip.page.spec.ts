import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ViewTripPage } from './view-trip.page';

describe('ViewTripPage', () => {
  let component: ViewTripPage;
  let fixture: ComponentFixture<ViewTripPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewTripPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewTripPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
