import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UMLORDisplayerComponent } from './uml-or-displayer.component';

describe('WorkflowDisplayerComponent', () => {
  let component: UMLORDisplayerComponent;
  let fixture: ComponentFixture<UMLORDisplayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UMLORDisplayerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UMLORDisplayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
