import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RateTripPage } from './rate-trip.page';

describe('RateTripPage', () => {
  let component: RateTripPage;
  let fixture: ComponentFixture<RateTripPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RateTripPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RateTripPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
