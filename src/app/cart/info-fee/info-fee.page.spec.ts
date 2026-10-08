import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InfoFeePage } from './info-fee.page';

describe('InfoFeePage', () => {
  let component: InfoFeePage;
  let fixture: ComponentFixture<InfoFeePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoFeePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InfoFeePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
