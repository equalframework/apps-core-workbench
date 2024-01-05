import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UMLORNodeComponent } from './uml-or-node.component';

describe('UMLORNodeComponent', () => {
  let component: UMLORNodeComponent;
  let fixture: ComponentFixture<UMLORNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UMLORNodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UMLORNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
