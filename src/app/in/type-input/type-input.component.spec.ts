import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeInputComponent } from './type-input.component';

describe('TypeInputComponent', () => {
  let component: TypeInputComponent;
  let fixture: ComponentFixture<TypeInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TypeInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TypeInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
