import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldEditorSpComponent } from './field-editor-sp.component';

describe('FieldEditorSpComponent', () => {
  let component: FieldEditorSpComponent;
  let fixture: ComponentFixture<FieldEditorSpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FieldEditorSpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldEditorSpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
