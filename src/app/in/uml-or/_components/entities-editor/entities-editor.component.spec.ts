import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntitiesEditorComponent } from './entities-editor.component';

describe('EntitiesSelectorComponent', () => {
  let component: EntitiesEditorComponent;
  let fixture: ComponentFixture<EntitiesEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntitiesEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EntitiesEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
