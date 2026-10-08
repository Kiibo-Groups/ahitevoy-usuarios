import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LockedPage } from './locked.page';

describe('LockedPage', () => {
  let component: LockedPage;
  let fixture: ComponentFixture<LockedPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LockedPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LockedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
