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
    Field.type_directives = {
      string: { type: true, description: true, usage: true, default: true, selection: true, dependencies: true, visible: true, domain: true },
      integer: { type: true, description: true, usage: true, default: true, selection: true, dependencies: true, visible: true, domain: true }
    };

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

  describe('Filtering Logic', () => {
    it('should filter the list based on search input', () => {
      component.list = [
        new Field({ type: 'string' }, 'field1'),
        new Field({ type: 'integer' }, 'field2'),
        new Field({ type: 'string' }, 'another')
      ];
      component.ngOnInit();
      component.filterControl.setValue('field');

      expect(component.filteredList.length).toBe(2);
      expect(component.filteredList[0].name).toBe('field1');
      expect(component.filteredList[1].name).toBe('field2');
    });

    it('should return all items when search input is empty', () => {
      component.list = [
        new Field({ type: 'string' }, 'field1'),
        new Field({ type: 'integer' }, 'field2')
      ];
      component.ngOnInit();
      component.filterControl.setValue('');
      expect(component.filteredList.length).toBe(2);
    });

    it('should handle uneditable, inherited and overridden fields correctly in sorting', () => {
      component.list = [
        new Field({ type: 'string' }, 'id'),
        new Field({ type: 'integer', description: 'child override' }, 'field2'),
        new Field({ type: 'string' }, 'field3'),
      ];
      component.parentList = [
        new Field({ type: 'integer' }, 'field2'),
      ];
      component.ngOnInit();
      component.filterControl.setValue('');
      expect(component.filteredList.length).toBe(3);
    });
  });

  describe('nGOnChanges', () => {
    it('should update filteredList when list input changes', () => {
      component.list = [
        new Field({ type: 'string' }, 'field1'),
        new Field({ type: 'integer' }, 'field2')
      ];
      component.ngOnChanges();
      expect(component.filteredList.length).toBe(2);
    });
  });

  describe('trackByFieldName', () => {
    it('should return the name of the field for tracking', () => {
      const field = new Field({ type: 'string' }, 'field1');
      const index = 0;
      expect(component.trackByFieldName(index, field)).toBe('field1');
    });
  });

  describe('onClickItem', () => {
    it('should emit the index of the clicked item', () => {
      spyOn(component.select, 'emit');
      component.onClickItem(1);
      expect(component.select.emit).toHaveBeenCalledWith(1);
    });
  });

  describe('createItem', () => {
    it('should create a new item and emit CRUD event', () => {
      spyOn(component.CRUD, 'emit');
      component.createControl.setValue('new_field');
      component.createItem();
      expect(component.list.length).toBe(1);
      expect(component.list[0].name).toBe('new_field');
      expect(component.CRUD.emit).toHaveBeenCalledWith('Creation of a new param');
    });

    it('should not create a duplicate item', () => {
      component.list = [new Field({ type: 'string' }, 'existing_field')];
      component.createControl.setValue('existing_field');
      component.createItem();
      expect(component.list.length).toBe(1);
    });
  });

  describe('deleteItem', () => {
    it('should delete the specified item and emit CRUD event', () => {
      spyOn(component.CRUD, 'emit');
      component.list = [new Field({ type: 'string' }, 'field1')];
      component.deleteItem(0);
      expect(component.list.length).toBe(0);
      expect(component.CRUD.emit).toHaveBeenCalledWith('deletion of field1');
    });
  });

  describe('resetFieldToParent', () => {
    it('should reset the field to its parent state and emit CRUD event', () => {
      spyOn(component.CRUD, 'emit');
      component.parentList = [new Field({ type: 'string' }, 'field1')];
      component.list = [new Field({ type: 'string', description: 'child override' }, 'field1')];
      component.resetFieldToParent(0);
      expect(component.list[0].description).toBe('');
      expect(component.CRUD.emit).toHaveBeenCalledWith('Reset of field1 to its inherited state');
    });
  });

  describe('cloneParent', () => {
    it('should clone the parent field if it exists', () => {
      component.parentList = [new Field({ type: 'string' }, 'field1')];
      const clonedField = component.cloneParent('field1');
      expect(clonedField.name).toBe('field1');
      expect(clonedField).not.toBe(component.parentList[0]);
    });
    it('should return a new Field if the parent does not exist', () => {
      const clonedField = component.cloneParent('nonexistent');
      expect(clonedField.name).toBe('');
    });
  });
});
