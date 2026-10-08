import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FormCardPage } from './form-card.page';

describe('FormCardPage', () => {
  let component: FormCardPage;
  let fixture: ComponentFixture<FormCardPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormCardPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FormCardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
