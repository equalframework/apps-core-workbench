import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldEditorListComponent } from './field-editor-list.component';

describe('FieldEditorListComponent', () => {
  let component: FieldEditorListComponent;
  let fixture: ComponentFixture<FieldEditorListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FieldEditorListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldEditorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
