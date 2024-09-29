import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LangPopupComponent } from './lang-popup.component';

describe('LangPopupComponent', () => {
  let component: LangPopupComponent;
  let fixture: ComponentFixture<LangPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LangPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LangPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
