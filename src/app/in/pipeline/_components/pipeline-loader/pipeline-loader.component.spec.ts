import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelineLoaderComponent } from './pipeline-loader.component';

describe('PipelineLoaderComponent', () => {
  let component: PipelineLoaderComponent;
  let fixture: ComponentFixture<PipelineLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PipelineLoaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PipelineLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
