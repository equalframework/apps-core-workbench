import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UMLORComponent } from './uml-or.component';

describe('UMLORComponent', () => {
  let component: UMLORComponent;
  let fixture: ComponentFixture<UMLORComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UMLORComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UMLORComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
