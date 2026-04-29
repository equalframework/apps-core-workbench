import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Node } from '../../_objects/Node';
import { PipelineNodeComponent } from './pipeline-node.component';

describe('PipelineNodeComponent', () => {
  let component: PipelineNodeComponent;
  let fixture: ComponentFixture<PipelineNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PipelineNodeComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PipelineNodeComponent);
    component = fixture.componentInstance;
    component.node = new Node({ x: 0, y: 0 });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
