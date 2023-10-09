import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitValidatorComponent } from './init-validator.component';

describe('InitValidatorComponent', () => {
  let component: InitValidatorComponent;
  let fixture: ComponentFixture<InitValidatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InitValidatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InitValidatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
