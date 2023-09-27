import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupParamsComponent } from './popup-params.component';

describe('PopupParamsComponent', () => {
  let component: PopupParamsComponent;
  let fixture: ComponentFixture<PopupParamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupParamsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupParamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
