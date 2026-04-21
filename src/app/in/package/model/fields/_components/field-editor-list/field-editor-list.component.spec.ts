import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Field } from '../../_object/Field';
import { FieldEditorListComponent } from './field-editor-list.component';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('FieldEditorListComponent', () => {
  let component: FieldEditorListComponent;
  let fixture: ComponentFixture<FieldEditorListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FieldEditorListComponent ],
      imports: [ HttpClientTestingModule ],
      providers: [
        { provide: WorkbenchService, useValue: jasmine.createSpyObj('WorkbenchService', ['someMethod']) },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldEditorListComponent);
    component = fixture.componentInstance;
    
    component.list = [];
    component.parentList = [];

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
