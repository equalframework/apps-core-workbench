import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionEditorComponent } from './action-editor.component';
import { ViewAction, ViewHeader } from '../../_objects/View';
import { MatDialogModule } from '@angular/material/dialog';
import { MatAutocomplete } from '@angular/material/autocomplete';

describe('ActionEditorComponent', () => {
  let component: ActionEditorComponent;
  let fixture: ComponentFixture<ActionEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionEditorComponent,MatAutocomplete ],
      imports:[MatDialogModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionEditorComponent);
    component = fixture.componentInstance;
    component.controllers = []
    component.obj = new ViewAction()
    fixture.detectChanges();
    component.obj = new ViewAction();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
