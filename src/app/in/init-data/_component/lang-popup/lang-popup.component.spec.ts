import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { FormControl } from '@angular/forms';
import { of } from 'rxjs';
import { LangPopupComponent } from './lang-popup.component';
import { InitDataEntitySection } from '../../_models/init-data';

describe('LangPopupComponent', () => {
  let component: LangPopupComponent;
  let fixture: ComponentFixture<LangPopupComponent>;
  let mockWorkbenchService: jasmine.SpyObj<WorkbenchService>;

  beforeEach(async () => {
    mockWorkbenchService = jasmine.createSpyObj('WorkbenchService', ['getSchema']);
    
    mockWorkbenchService.getSchema.and.returnValue(of({
      fields: {
        field1: { type: 'string', multilang: false, required: false },
        field2: { type: 'number', multilang: false, required: false }
      }
    }));

    const testData = new InitDataEntitySection(mockWorkbenchService, {
      name: 'testEntity',
      lang: 'en',
      data: []
    });

    await TestBed.configureTestingModule({
      declarations: [ LangPopupComponent ],
      providers: [
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
        { provide: WorkbenchService, useValue: mockWorkbenchService },
        { provide: MAT_DIALOG_DATA, useValue: testData }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LangPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
