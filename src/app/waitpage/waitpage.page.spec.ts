import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { WaitpagePage } from './waitpage.page';

describe('WaitpagePage', () => {
  let component: WaitpagePage;
  let fixture: ComponentFixture<WaitpagePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WaitpagePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(WaitpagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
