import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { Field } from '../../_object/Field';
import { FieldEditorSpComponent } from './field-editor-sp.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { OverlayModule } from '@angular/cdk/overlay';

describe('FieldEditorSpComponent', () => {
  let component: FieldEditorSpComponent;
  let fixture: ComponentFixture<FieldEditorSpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FieldEditorSpComponent ],
      imports: [ HttpClientTestingModule, HttpClientModule, TranslateModule.forRoot(), OverlayModule ],
      providers: [ WorkbenchService, MatSnackBar ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    // Initialize Field.type_directives with required types
    if (!Field.type_directives) {
      Field.type_directives = {
        string: {
          name: true, description: true, readonly: true, required: true, multilang: true,
          unique: true, store: true, instant: true, default: true, selection: true,
          dependencies: true, visible: true, domain: true, usage: true, alias: true,
          onUpdate: true, onRevert: true, onDelete: true, onDetach: true
        },
        computed: {
          name: true, description: true, readonly: true, resultType: true, function: true,
          dependencies: true, visible: true, domain: true, usage: true, alias: true,
          onUpdate: true, onRevert: true, onDelete: true, onDetach: true
        },
        many2one: {
          name: true, description: true, readonly: true, required: true,
          foreign_object: true, foreign_field: true, dependencies: true,
          visible: true, domain: true, usage: true, alias: true,
          onUpdate: true, onRevert: true, onDelete: true, onDetach: true
        },
        number: {
          name: true, description: true, readonly: true, required: true, multilang: true,
          unique: true, store: true, instant: true, default: true, selection: true,
          dependencies: true, visible: true, domain: true, usage: true, alias: true,
          onUpdate: true, onRevert: true, onDelete: true, onDetach: true
        }
      };
    }

    fixture = TestBed.createComponent(FieldEditorSpComponent);
    component = fixture.componentInstance;
    component.field = null;
    component.types = [];
    component.models = [];
    component.entity = '';
    component.fields = [];
    component.computedFields = [];
    component.dummyScheme = {};

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('changeName', () => {
    it('should change field name on valid input', () => {
      component.field = new Field();
      component.field.name = 'oldName';
      component.changeName('new_name');
      expect(component.field.name).toBe('new_name');
    });

    it('should emit CRUD event on name change', () => {
      spyOn(component.CRUD, 'emit');
      component.field = new Field();
      component.field.name = 'oldName';
      component.changeName('new_name');
      expect(component.CRUD.emit).toHaveBeenCalledWith('Renaming oldName to new_name');
    });

    const invalidInputs = [
      { input: 'Invalid Name', desc: 'uppercase/space' },
      { input: '', desc: 'empty input' },
      { input: 'UPPERCASE', desc: 'uppercase input' }
    ];

    invalidInputs.forEach(({ input, desc }) => {
      it(`should not change field name on ${desc}`, () => {
        component.field = new Field();
        component.field.name = 'oldName';
        component.changeName(input);
        expect(component.field.name).toBe('oldName');
      });
    });
  });

  describe('Field Property Changes', () => {
    const propertyChanges = [
      { method: 'changeTypeValue', value: 'string', property: 'type', resetsDefault: true },
      { method: 'changeResultType', value: 'number', property: 'resultType', resetsDefault: true },
      { method: 'changeFunction', value: 'SUM', property: 'function', resetsDefault: false },
      { method: 'changeDesc', value: 'Test description', property: 'description', resetsDefault: false },
      { method: 'changeForeignObject', value: 'foreignObj', property: 'foreign_object', resetsDefault: false },
      { method: 'changeForeignField', value: 'foreignField', property: 'foreign_field', resetsDefault: false },
      { method: 'changeAlias', value: 'alias', property: 'alias', resetsDefault: false },
      { method: 'changeRelLocalKey', value: 'localKey', property: 'relLocalKey', resetsDefault: false },
    ];

    propertyChanges.forEach(({ method, value, property, resetsDefault }) => {
      it(`${method} should update ${property}`, () => {
        component.field = new Field();
        spyOn(component.CRUD, 'emit');
        (component as any)[method](value);
        expect((component.field as any)[property]).toBe(value);
        expect(component.CRUD.emit).toHaveBeenCalled();
      });

      if (resetsDefault) {
        it(`${method} should reset default and selection`, () => {
          component.field = new Field();
          component.field.default = 'defaultValue';
          component.field.selection = ['option1'];
          (component as any)[method](value);
          expect(component.field.default).toBeUndefined();
          expect(component.field.selection).toEqual([]);
        });
      }
    });
  });

  describe('Relationship Field Changes', () => {
    it('should change relTable and reset defaults', () => {
      component.field = new Field();
      component.field.default = 'defaultValue';
      component.field.selection = ['option1'];
      spyOn(component.CRUD, 'emit');
      component.changeRelTable('relatedTable');
      expect(component.field.relTable).toBe('relatedTable');
      expect(component.field.default).toBeUndefined();
      expect(component.field.selection).toEqual([]);
      expect(component.CRUD.emit).toHaveBeenCalled();
    });

    it('should change relForeignKey and reset defaults', () => {
      component.field = new Field();
      component.field.default = 'defaultValue';
      component.field.selection = ['option1'];
      spyOn(component.CRUD, 'emit');
      component.changeRelForeignKey('foreignKey');
      expect(component.field.relForeignKey).toBe('foreignKey');
      expect(component.field.default).toBeUndefined();
      expect(component.field.selection).toEqual([]);
      expect(component.CRUD.emit).toHaveBeenCalled();
    });
  });

  describe('Boolean Toggle Methods', () => {
    const toggleMethods = [
      { method: 'changeReadonly', property: 'readonly' },
      { method: 'changeUnique', property: 'unique' },
      { method: 'changeStore', property: 'store' },
      { method: 'changeInstant', property: 'instant' },
      { method: 'changeRequired', property: 'required' },
      { method: 'changeMultilang', property: 'multilang' }
    ];

    toggleMethods.forEach(({ method, property }) => {
      it(`${method} should toggle to true`, () => {
        spyOn(component.CRUD, 'emit');
        component.field = new Field();
        (component as any)[method](true);
        expect((component.field as any)[property]).toBeTrue();
        expect(component.CRUD.emit).toHaveBeenCalled();
      });

      it(`${method} should toggle back to false`, () => {
        spyOn(component.CRUD, 'emit');
        component.field = new Field();
        (component as any)[method](true);
        (component as any)[method](false);
        expect((component.field as any)[property]).toBeFalse();
        expect(component.CRUD.emit).toHaveBeenCalledTimes(2);
      });

      it(`${method} should not emit when field is null`, () => {
        spyOn(component.CRUD, 'emit');
        component.field = null;
        (component as any)[method](true);
        expect(component.CRUD.emit).not.toHaveBeenCalled();
      });
    });
  });

  describe('Has* Toggle Methods', () => {
    const hasToggleMethods = [
      { method: 'changeHasDefault', property: '_hasDefault' },
      { method: 'changeHasSelection', property: '_hasSelection' },
      { method: 'changeHasDependencies', property: '_hasDependencies' },
      { method: 'changeHasVisible', property: '_hasVisible' },
      { method: 'changeHasDomain', property: '_hasDomain' }
    ];

    hasToggleMethods.forEach(({ method, property }) => {
      it(`${method} should toggle property`, () => {
        spyOn(component.CRUD, 'emit');
        component.field = new Field();
        (component as any)[method](true);
        expect((component.field as any)[property]).toBeTrue();
        expect(component.CRUD.emit).toHaveBeenCalled();
      });

      it(`${method} should toggle back to false`, () => {
        spyOn(component.CRUD, 'emit');
        component.field = new Field();
        (component as any)[method](true);
        (component as any)[method](false);
        expect((component.field as any)[property]).toBeFalse();
      });

      it(`${method} should not emit when field is null`, () => {
        spyOn(component.CRUD, 'emit');
        component.field = null;
        (component as any)[method](true);
        expect(component.CRUD.emit).not.toHaveBeenCalled();
      });
    });
  });

  describe('OnEvent Methods', () => {
    const onEventMethods = [
      { method: 'changeOnUpdate', value: 'updateValue' },
      { method: 'changeOnRevert', value: 'revertValue' },
      { method: 'changeOnDelete', value: 'deleteValue' },
      { method: 'changeOnDetach', value: 'detachValue' }
    ];

    onEventMethods.forEach(({ method, value }) => {
      it(`${method} should update value and emit CRUD event`, () => {
        spyOn(component.CRUD, 'emit');
        component.field = new Field();
        (component as any)[method](value);
        expect(component.CRUD.emit).toHaveBeenCalled();
      });

      it(`${method} should not emit when field is null`, () => {
        spyOn(component.CRUD, 'emit');
        component.field = null;
        (component as any)[method](value);
        expect(component.CRUD.emit).not.toHaveBeenCalled();
      });
    });
  });

  describe('Selection Methods', () => {
    it('should add to selection', () => {
      component.field = new Field();
      component.field.selection = ['option1'];
      component.addToSelection();
      expect(component.field.selection.length).toBe(2);
    });

    it('should delete selection by index', () => {
      component.field = new Field();
      component.field.selection = ['option1', 'option2', 'option3'];
      component.deleteSelection(1);
      expect(component.field.selection).toEqual(['option1', 'option3']);
    });

    it('should change selection value', () => {
      spyOn(component.CRUD, 'emit');
      component.field = new Field();
      component.field.selection = ['option1', 'option2'];
      component.changeSelection(0, 'newOption');
      expect(component.field.selection[0]).toBe('newOption');
      expect(component.CRUD.emit).toHaveBeenCalled();
    });
  });

  describe('Default Methods', () => {
    it('should change default value', () => {
      spyOn(component.CRUD, 'emit');
      component.field = new Field();
      component.changeDefault('defaultValue');
      expect(component.field.default).toBe('defaultValue');
      expect(component.CRUD.emit).toHaveBeenCalled();
    });

    it('should not change default if field is null', () => {
      spyOn(component.CRUD, 'emit');
      component.field = null;
      component.changeDefault('defaultValue');
      expect(component.CRUD.emit).not.toHaveBeenCalled();
    });
  });

  describe('Visible and Domain Methods', () => {
    it('should change visible value', () => {
      spyOn(component.CRUD, 'emit');
      component.field = new Field();
      component.changeVisible('visibleValue');
      expect(component.field.visible).toBe('visibleValue');
      expect(component.CRUD.emit).toHaveBeenCalled();
    });

    it('should change domain value', () => {
      spyOn(component.CRUD, 'emit');
      component.field = new Field();
      component.changeDomain('domainValue');
      expect(component.field.domain).toBe('domainValue');
      expect(component.CRUD.emit).toHaveBeenCalled();
    });

    it('should not emit when field is null for visible change', () => {
      spyOn(component.CRUD, 'emit');
      component.field = null;
      component.changeVisible('visibleValue');
      expect(component.CRUD.emit).not.toHaveBeenCalled();
    });

    it('should not emit when field is null for domain change', () => {
      spyOn(component.CRUD, 'emit');
      component.field = null;
      component.changeDomain('domainValue');
      expect(component.CRUD.emit).not.toHaveBeenCalled();
    });
  });

  describe('Dependencies Methods', () => {
    it('should add to dependencies', () => {
      spyOn(component.CRUD, 'emit');
      component.field = new Field();
      component.field.dependencies = [];
      component.dependencyInput = 'newDependency';
      component.addToDependencies();
      expect(component.field.dependencies).toContain('newDependency');
      expect(component.dependencyInput).toBe('');
      expect(component.CRUD.emit).toHaveBeenCalled();
    });

    it('should not add duplicate dependencies', () => {
      spyOn(component.CRUD, 'emit');
      component.field = new Field();
      component.field.dependencies = ['existingDependency'];
      component.dependencyInput = 'existingDependency';
      component.addToDependencies();
      expect(component.field.dependencies.length).toBe(1);
      expect(component.CRUD.emit).not.toHaveBeenCalled();
    });

    it('should not add empty dependency', () => {
      spyOn(component.CRUD, 'emit');
      component.field = new Field();
      component.field.dependencies = [];
      component.dependencyInput = '';
      component.addToDependencies();
      expect(component.field.dependencies.length).toBe(0);
      expect(component.CRUD.emit).not.toHaveBeenCalled();
    });

    it('should delete dependency by index', () => {
      spyOn(component.CRUD, 'emit');
      component.field = new Field();
      component.field.dependencies = ['dep1', 'dep2', 'dep3'];
      component.DeleteDependency(1);
      expect(component.field.dependencies).toEqual(['dep1', 'dep3']);
      expect(component.CRUD.emit).toHaveBeenCalled();
    });
  });

  describe('Keyboard and Navigation Methods', () => {
    it('should prevent Ctrl+Z key', () => {
      const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true });
      spyOn(event, 'preventDefault');
      spyOn(event, 'stopImmediatePropagation');
      component.noCancel(event);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopImmediatePropagation).toHaveBeenCalled();
    });

    it('should prevent Ctrl+Y key', () => {
      const event = new KeyboardEvent('keydown', { key: 'y', ctrlKey: true });
      spyOn(event, 'preventDefault');
      spyOn(event, 'stopImmediatePropagation');
      component.noCancel(event);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopImmediatePropagation).toHaveBeenCalled();
    });

    it('should not prevent other keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'a', ctrlKey: true });
      spyOn(event, 'preventDefault');
      component.noCancel(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('should emit navToParent event', () => {
      spyOn(component.navToParent, 'emit');
      component.navigateToParent();
      expect(component.navToParent.emit).toHaveBeenCalled();
    });
  });

  describe('ngOnChanges Lifecycle', () => {
    it('should initialize type directives on ngOnChanges', async () => {
      component.field = new Field();
      component.field.type = 'string';
      Field.type_directives['string'] = 'stringDirective';
      await component.ngOnChanges();
      expect(component.finalTypeDirective).toEqual('stringDirective' as any);
    });

    it('should handle errors in ngOnChanges gracefully', async () => {
      component.field = new Field();
      component.field.type = 'nonExistentType';
      await component.ngOnChanges();
      expect(component.finalTypeDirective).toBeUndefined();
    });
  });

  describe('Null Field Checks - Property Changes', () => {
    const propertyMethods = [
      { method: 'changeTypeValue', args: ['string'] },
      { method: 'changeResultType', args: ['number'] },
      { method: 'changeFunction', args: ['SUM'] },
      { method: 'changeDesc', args: ['description'] },
      { method: 'changeForeignObject', args: ['foreignObj'] },
      { method: 'changeForeignField', args: ['foreignField'] },
      { method: 'changeAlias', args: ['alias'] },
      { method: 'changeRelLocalKey', args: ['localKey'] },
      { method: 'changeRelTable', args: ['table'] },
      { method: 'changeRelForeignKey', args: ['key'] }
    ];

    propertyMethods.forEach(({ method, args }) => {
      it(`${method} should not emit when field is null`, () => {
        spyOn(component.CRUD, 'emit');
        component.field = null;
        (component as any)[method](...args);
        expect(component.CRUD.emit).not.toHaveBeenCalled();
      });
    });
  });
});
