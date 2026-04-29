import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { ParamListComponent } from './param-list.component';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';

describe('ParamListComponent', () => {
  let component: ParamListComponent;
  let fixture: ComponentFixture<ParamListComponent>;

  beforeEach(async () => {
    const mockWorkbenchService = {} as Partial<WorkbenchService>;

    await TestBed.configureTestingModule({
      declarations: [ ParamListComponent ],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: WorkbenchService, useValue: mockWorkbenchService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParamListComponent);
    component = fixture.componentInstance;
    component.list = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
