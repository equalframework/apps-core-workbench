import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnTypeEditorComponent } from './return-type-editor.component';

describe('ReturnTypeEditorComponent', () => {
  let component: ReturnTypeEditorComponent;
  let fixture: ComponentFixture<ReturnTypeEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReturnTypeEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReturnTypeEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
