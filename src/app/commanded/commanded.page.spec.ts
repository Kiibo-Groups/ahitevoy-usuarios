import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CommandedPage } from './commanded.page';

describe('CommandedPage', () => {
  let component: CommandedPage;
  let fixture: ComponentFixture<CommandedPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommandedPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CommandedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
