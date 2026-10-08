import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OptionPayPage } from './option-pay.page';

describe('OptionPayPage', () => {
  let component: OptionPayPage;
  let fixture: ComponentFixture<OptionPayPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OptionPayPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OptionPayPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
