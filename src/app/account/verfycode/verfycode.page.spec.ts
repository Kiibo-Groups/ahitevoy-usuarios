import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { VerfycodePage } from './verfycode.page';

describe('VerfycodePage', () => {
  let component: VerfycodePage;
  let fixture: ComponentFixture<VerfycodePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerfycodePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(VerfycodePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
