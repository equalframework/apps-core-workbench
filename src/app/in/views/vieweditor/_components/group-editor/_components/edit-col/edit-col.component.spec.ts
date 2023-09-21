import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditColComponent } from './edit-col.component';

describe('EditColComponent', () => {
  let component: EditColComponent;
  let fixture: ComponentFixture<EditColComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditColComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditColComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
