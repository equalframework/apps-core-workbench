import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditItemFormComponent } from './edit-item-form.component';

describe('EditItemFormComponent', () => {
  let component: EditItemFormComponent;
  let fixture: ComponentFixture<EditItemFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditItemFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditItemFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
