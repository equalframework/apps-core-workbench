import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowDisplayerComponent } from './pipeline-displayer.component';

describe('WorkflowDisplayerComponent', () => {
  let component: WorkflowDisplayerComponent;
  let fixture: ComponentFixture<WorkflowDisplayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkflowDisplayerComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowDisplayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
