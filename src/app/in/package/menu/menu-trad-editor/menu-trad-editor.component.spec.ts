import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuTradEditorComponent } from './menu-trad-editor.component';

describe('MenuTradEditorComponent', () => {
  let component: MenuTradEditorComponent;
  let fixture: ComponentFixture<MenuTradEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuTradEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuTradEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
