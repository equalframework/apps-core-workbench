import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowNodeComponent } from './workflow-node.component';
import { WorkflowNode } from '../workflow-displayer/_objects/WorkflowNode';

describe('WorkflowNodeComponent', () => {
  let component: WorkflowNodeComponent;
  let fixture: ComponentFixture<WorkflowNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkflowNodeComponent ],
      providers: [
        { provide: WorkflowNode, useValue: new WorkflowNode('test') }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowNodeComponent);
    component = fixture.componentInstance;
    component.node = new WorkflowNode('test');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
