import { ComponentFixture, TestBed } from '@angular/core/testing';

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
