import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OverlayModule } from '@angular/cdk/overlay';
import { ModalExecutionPipelineComponent } from './modal-execution-pipeline.component';

describe('ModalExecutionPipelineComponent', () => {
  let component: ModalExecutionPipelineComponent;
  let fixture: ComponentFixture<ModalExecutionPipelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalExecutionPipelineComponent ],
      imports: [ TranslateModule.forRoot(), HttpClientTestingModule ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: { pipelineName: 'test', pipelineId: 1 } },
        { provide: MatSnackBar, useValue: {} },
        { provide: OverlayModule, useValue: {} }

      ]
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
