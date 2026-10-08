import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SetaddressPage } from './setaddress.page';

describe('SetaddressPage', () => {
  let component: SetaddressPage;
  let fixture: ComponentFixture<SetaddressPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetaddressPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SetaddressPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
