import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { ParamSidePaneComponent } from './param-side-pane.component';
import { Param } from '../../../../../_models/Params';

describe('ParamSidePaneComponent', () => {
  let component: ParamSidePaneComponent;
  let fixture: ComponentFixture<ParamSidePaneComponent>;

  const makeParam = (name: string): Param => new Param(name);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParamSidePaneComponent ],
      imports: [ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParamSidePaneComponent);
    component = fixture.componentInstance;
    component.modelList = [];

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update nameControl value when param name changes', () => {
    const testName = 'test_param';
    component.param = makeParam(testName);
    component.ngOnChanges();
    expect(component.nameControl.value).toBe(testName);
  });

  it('should emit CRUD event on changeName', () => {
    spyOn(component.CRUD, 'emit');
    component.param = makeParam('old_name');
    component.nameControl.setValue('new_name');
    component.changeName();
    expect(component.CRUD.emit).toHaveBeenCalledWith('Renaming old_name to new_name');
  });

  it('should filter modelList based on foreignControl value', () => {
    component.modelList = ['ModelOne', 'ModelTwo', 'Another'];
    component.ngOnInit();
    component.foreignControl.setValue('model');
    expect(component.filteredModelList).toEqual(['ModelOne', 'ModelTwo']);
  });

  it('should reset filteredModelList when foreignControl value is empty', () => {
    component.modelList = ['ModelOne', 'ModelTwo', 'AnotherModel'];
    component.foreignControl.setValue('model');
    component.ngOnInit();
    component.foreignControl.setValue('');
    expect(component.filteredModelList).toEqual(component.modelList);
  });

  it('should emit CRUD event on nameControl value change', () => {
    spyOn(component.CRUD, 'emit');
    component.param = makeParam('old_name');
    component.ngOnInit();
    component.nameControl.setValue('new_name');
    expect(component.CRUD.emit).toHaveBeenCalledWith('Renaming old_name to new_name');
  });

  it('should not emit CRUD event on nameControl value change when param is undefined', () => {
    spyOn(component.CRUD, 'emit');
    component.param = undefined;
    component.ngOnInit();

    component.nameControl.setValue('new_name');

    expect(component.CRUD.emit).not.toHaveBeenCalled();
  });

  it('should not emit CRUD event if nameControl value is invalid', () => {
    spyOn(component.CRUD, 'emit');
    component.param = makeParam('old_name');
    component.ngOnInit();
    component.nameControl.setValue('');
    expect(component.CRUD.emit).not.toHaveBeenCalled();
  });

  it('should not emit CRUD event if nameControl value is the same as param name', () => {
    spyOn(component.CRUD, 'emit');
    component.param = makeParam('same_name');
    component.ngOnInit();
    component.nameControl.setValue('same_name');
    expect(component.CRUD.emit).not.toHaveBeenCalled();
  });

  it('should validate foreignControl against modelList', () => {
    component.modelList = ['ValidModel'];
    component.ngOnChanges();
    component.foreignControl.setValue('InvalidModel');
    expect(component.foreignControl.valid).toBeFalse();
    component.foreignControl.setValue('ValidModel');
    expect(component.foreignControl.valid).toBeTrue();
  });
  
  it('should keep nameControl in sync with param name on ngOnChanges', () => {
    component.param = makeParam('initial_name');
    component.ngOnChanges();
    expect(component.nameControl.value).toBe('initial_name');
    component.param.name = 'updated_name';
    component.ngOnChanges();
    expect(component.nameControl.value).toBe('updated_name');
  });

  it('should set nameBeingEdited and update nameControl value on setNameBeingEdited', () => {
    component.param = makeParam('editable_name');
    component.setNameBeingEdited(true);
    expect(component.nameBeingEdited).toBeTrue();
    expect(component.nameControl.value).toBe('editable_name');
    component.setNameBeingEdited(false);
    expect(component.nameBeingEdited).toBeFalse();
    expect(component.nameControl.touched).toBeFalse();
  });

  it('should filter modelList case-insensitively', () => {
    component.modelList = ['ModelOne', 'modelTwo', 'Another'];
    component.ngOnInit();
    component.foreignControl.setValue('MODEL');
    expect(component.filteredModelList).toEqual(['ModelOne', 'modelTwo']);
  });

  it('should sort filteredModelList alphabetically', () => {
    component.modelList = ['banana', 'Apple', 'cherry'];
    component.ngOnInit();
    component.foreignControl.setValue('a');
    expect(component.filteredModelList).toEqual(['Apple', 'banana']);
  });

  it('should handle empty modelList without errors', () => {
    component.modelList = [];
    component.ngOnInit();
    component.foreignControl.setValue('any');
    expect(component.filteredModelList).toEqual([]);
  });

  it('should validate foreignControl with null value', () => {
    component.modelList = ['ValidModel'];
    component.ngOnChanges();

    component.foreignControl.setValue(null);

    expect(component.foreignControl.valid).toBeFalse();
  });

  it('should emit CRUD event for addToSelection', () => {
    spyOn(component.CRUD, 'emit');
    component.param = makeParam('test_param');

    component.addToSelection();

    expect(component.param.selection.length).toBe(1);
    expect(component.CRUD.emit).toHaveBeenCalledWith('Added to selection for test_param');
  });

  it('should emit CRUD event for deleteSelection', () => {
    spyOn(component.CRUD, 'emit');
    component.param = makeParam('test_param');
    component.param.selection = ['item1', 'item2'];

    component.deleteSelection(0);

    expect(component.param.selection).toEqual(['item2']);
    expect(component.CRUD.emit).toHaveBeenCalledWith('Deleted selection for test_param');
  });

  it('should not emit CRUD event for deleteSelection with invalid index', () => {
    spyOn(component.CRUD, 'emit');
    component.param = makeParam('test_param');
    component.param.selection = ['item1'];

    component.deleteSelection(5);

    expect(component.param.selection).toEqual(['item1']);
    expect(component.CRUD.emit).not.toHaveBeenCalled();
  });

  it('should update type, clear dependent values and emit CRUD', () => {
    spyOn(component.CRUD, 'emit');
    component.param = makeParam('typed_param');
    component.param.default = 'value';
    component.param.selection = ['a'];
    component.param._has_domain = true;

    component.changeTypeValue('string');

    expect(component.param.type).toBe('string');
    expect(component.param.default).toBeUndefined();
    expect(component.param.selection).toEqual([]);
    expect(component.param._has_domain).toBeFalse();
    expect(component.CRUD.emit).toHaveBeenCalledWith('changed type of typed_param to string');
  });

  it('should keep _has_domain for relational types', () => {
    component.param = makeParam('relation_param');
    component.param._has_domain = true;

    component.changeTypeValue('many2one');

    expect(component.param._has_domain).toBeTrue();
  });

  it('should update foreign object and reset domain when value changes', () => {
    spyOn(component.CRUD, 'emit');
    component.param = makeParam('foreign_param');
    component.param.domain = ['legacy'];
    component.modelList = ['ValidModel'];
    component.ngOnChanges();
    component.foreignControl.setValue('ValidModel');

    component.changeForeign();

    expect(component.param.foreign_object).toBe('ValidModel');
    expect(component.param.domain).toEqual([]);
    expect(component.CRUD.emit).toHaveBeenCalledWith('changed foreign object of foreign_param to ValidModel');
  });

  it('should not update foreign object when value is invalid', () => {
    spyOn(component.CRUD, 'emit');
    component.param = makeParam('foreign_param');
    component.param.foreign_object = 'LegacyModel';
    component.modelList = ['ValidModel'];
    component.ngOnChanges();
    component.foreignControl.setValue('InvalidModel');

    component.changeForeign();

    expect(component.param.foreign_object).toBe('LegacyModel');
    expect(component.CRUD.emit).not.toHaveBeenCalled();
  });

  it('should not emit when foreign object value is unchanged', () => {
    spyOn(component.CRUD, 'emit');
    component.param = makeParam('foreign_param');
    component.param.foreign_object = 'ValidModel';
    component.modelList = ['ValidModel'];
    component.ngOnChanges();
    component.foreignControl.setValue('ValidModel');

    component.changeForeign();

    expect(component.CRUD.emit).not.toHaveBeenCalled();
  });

  it('should validate nameControl with invalid snake_case', () => {
    component.nameControl.setValue('InvalidName');
    component.nameControl.updateValueAndValidity();

    expect(component.nameControl.valid).toBeFalse();
  });

  it('should validate nameControl with invalid characters', () => {
    component.nameControl.setValue('invalid-name!');
    component.nameControl.updateValueAndValidity();
    expect(component.nameControl.valid).toBeFalse();
  });

  it('should validate nameControl with invalid starting character', () => {
    component.nameControl.setValue('_invalid');
    component.nameControl.updateValueAndValidity();
    expect(component.nameControl.valid).toBeFalse();
  });

  it('should validate nameControl with invalid consecutive underscores', () => {
    component.nameControl.setValue('invalid__name');
    component.nameControl.updateValueAndValidity();
    expect(component.nameControl.valid).toBeFalse();
  });

  it('should validate nameControl with valid snake_case', () => {
    component.nameControl.setValue('valid_name');
    component.nameControl.updateValueAndValidity();
    expect(component.nameControl.valid).toBeTrue();
  });

  it('should block Ctrl+Z and Ctrl+Y in noCancel', () => {
    const preventDefault = jasmine.createSpy('preventDefault');
    const stopImmediatePropagation = jasmine.createSpy('stopImmediatePropagation');

    component.noCancel({
      key: 'z',
      ctrlKey: true,
      preventDefault,
      stopImmediatePropagation
    } as unknown as KeyboardEvent);

    component.noCancel({
      key: 'y',
      ctrlKey: true,
      preventDefault,
      stopImmediatePropagation
    } as unknown as KeyboardEvent);

    expect(preventDefault).toHaveBeenCalledTimes(2);
    expect(stopImmediatePropagation).toHaveBeenCalledTimes(2);
  });

  it('should not block unrelated key combinations in noCancel', () => {
    const preventDefault = jasmine.createSpy('preventDefault');
    const stopImmediatePropagation = jasmine.createSpy('stopImmediatePropagation');

    component.noCancel({
      key: 'a',
      ctrlKey: true,
      preventDefault,
      stopImmediatePropagation
    } as unknown as KeyboardEvent);

    expect(preventDefault).not.toHaveBeenCalled();
    expect(stopImmediatePropagation).not.toHaveBeenCalled();
  });

});