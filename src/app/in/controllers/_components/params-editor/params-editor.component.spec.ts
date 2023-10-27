import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParamsEditorComponent } from './params-editor.component';

describe('ParamsEditorComponent', () => {
  let component: ParamsEditorComponent;
  let fixture: ComponentFixture<ParamsEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParamsEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParamsEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
