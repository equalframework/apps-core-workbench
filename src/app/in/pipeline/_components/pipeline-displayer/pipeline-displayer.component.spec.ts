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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
