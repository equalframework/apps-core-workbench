import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitPopupEditorComponent } from './init-popup-editor.component';

describe('InitPopupEditorComponent', () => {
  let component: InitPopupEditorComponent;
  let fixture: ComponentFixture<InitPopupEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InitPopupEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InitPopupEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
