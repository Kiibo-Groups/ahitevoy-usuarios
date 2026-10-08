import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DoneCommPage } from './done-comm.page';

describe('DoneCommPage', () => {
  let component: DoneCommPage;
  let fixture: ComponentFixture<DoneCommPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DoneCommPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DoneCommPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
