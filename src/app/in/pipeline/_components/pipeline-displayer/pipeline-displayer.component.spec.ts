import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelineDisplayerComponent } from './pipeline-displayer.component';

describe('PipelineDisplayerComponent', () => {
  let component: PipelineDisplayerComponent;
  let fixture: ComponentFixture<PipelineDisplayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PipelineDisplayerComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PipelineDisplayerComponent);
    component = fixture.componentInstance;
    component.nodes = [];
    component.links = [];
    component.view_offset = { x: 0, y: 0 };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
