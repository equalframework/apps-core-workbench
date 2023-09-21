import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TogglingButtonComponent } from './toggling-button.component';

describe('TogglingButtonComponent', () => {
  let component: TogglingButtonComponent;
  let fixture: ComponentFixture<TogglingButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TogglingButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TogglingButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
