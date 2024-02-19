import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupLayoutComponent } from './popup-layout.component';

describe('PopupLayoutComponent', () => {
  let component: PopupLayoutComponent;
  let fixture: ComponentFixture<PopupLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupLayoutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
