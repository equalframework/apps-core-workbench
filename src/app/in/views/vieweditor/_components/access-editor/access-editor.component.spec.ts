import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessEditorComponent } from './access-editor.component';
import { MatAutocomplete } from '@angular/material/autocomplete';

describe('AccessEditorComponent', () => {
  let component: AccessEditorComponent;
  let fixture: ComponentFixture<AccessEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccessEditorComponent,MatAutocomplete ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessEditorComponent);
    component = fixture.componentInstance;
    component.groups = []
    component.obj = {"groups":[]}
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
