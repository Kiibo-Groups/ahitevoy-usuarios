import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ChkphonePage } from './chkphone.page';

describe('ChkphonePage', () => {
  let component: ChkphonePage;
  let fixture: ComponentFixture<ChkphonePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChkphonePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ChkphonePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
