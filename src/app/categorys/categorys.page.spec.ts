import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CategorysPage } from './categorys.page';

describe('CategorysPage', () => {
  let component: CategorysPage;
  let fixture: ComponentFixture<CategorysPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CategorysPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CategorysPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
