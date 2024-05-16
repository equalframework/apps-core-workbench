import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalExecutionPipelineComponent } from './modal-execution-pipeline.component';

describe('ModalExecutionPipelineComponent', () => {
  let component: ModalExecutionPipelineComponent;
  let fixture: ComponentFixture<ModalExecutionPipelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalExecutionPipelineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalExecutionPipelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
