import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { JsonValidationService } from 'src/app/in/_services/json-validation.service';
import { Param } from '../../../_models/Params';

import { PackageControllerParamsComponent } from './package-controller-params.component';

describe('PackageControllerParamsComponent', () => {
  let component: PackageControllerParamsComponent;
  let fixture: ComponentFixture<PackageControllerParamsComponent>;

  const workbenchServiceSpy = jasmine.createSpyObj('WorkbenchService', ['updateController']);
  const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
  const matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
  const locationSpy = jasmine.createSpyObj('Location', ['back']);
  const jsonValidationServiceSpy = jasmine.createSpyObj('JsonValidationService', ['validateAndSave', 'validateBySchemaType']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PackageControllerParamsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: WorkbenchService, useValue: workbenchServiceSpy },
        { provide: MatSnackBar, useValue: matSnackBarSpy },
        { provide: MatDialog, useValue: matDialogSpy },
        { provide: Location, useValue: locationSpy },
        { provide: JsonValidationService, useValue: jsonValidationServiceSpy }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PackageControllerParamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.controllerName).toBe('');
      expect(component.controllerType).toBe('');
      expect(component.controllerPackage).toBe('');
      expect(component.types).toEqual([]);
      expect(component.usages).toEqual([]);
      expect(component.paramsScheme).toBeNull();
      expect(component.modelList).toEqual([]);
      expect(component.dataReady).toBeFalse();
      expect(component.isSaving).toBeFalse();
      expect(component.error).toBeFalse();
      expect(component.paramList).toEqual([]);
      expect(component.selectedIndex).toBe(-1);
      expect(component.loading).toBeFalse();
    });

    it('should initialize with @Input properties', () => {
      component.controllerName = 'testController';
      component.controllerType = 'read';
      component.controllerPackage = 'test_package';
      component.types = ['string', 'number'];
      component.usages = ['usage1', 'usage2'];
      component.modelList = ['model1', 'model2'];
      component.paramsScheme = { announcement: { params: { param1: {}, param2: {} } } };
      component.dataReady = true;

      component.ngOnInit();
      expect(component.controllerName).toBe('testController');
      expect(component.controllerType).toBe('read');
      expect(component.controllerPackage).toBe('test_package');
      expect(component.types).toEqual(['array', 'string', 'number']);
      expect(component.usages).toEqual(['usage1', 'usage2']);
      expect(component.modelList).toEqual(['model1', 'model2']);
      expect(component.paramsScheme).toEqual({ announcement: { params: { param1: {}, param2: {} } } });
      expect(component.dataReady).toBeTrue();
    });

    it('should add array type if not present in types array', () => {
      component.types = ['string', 'number'];
      component.ngOnInit();
      expect(component.types[0]).toBe('array');
      expect(component.types).toContain('string');
      expect(component.types).toContain('number');
    });

    it('should not duplicate array type if already present', () => {
      component.types = ['array', 'string'];
      component.ngOnInit();
      expect(component.types.filter(t => t === 'array').length).toBe(1);
    });

    it('should initialize paramList from paramsScheme', () => {
      component.paramsScheme = {
        announcement: {
          params: {
            param1: { type: 'string' },
            param2: { type: 'number' }
          }
        }
      };
      component.ngOnInit();
      expect(component.paramList.length).toBe(2);
      expect(component.paramList[0].name).toBe('param1');
      expect(component.paramList[1].name).toBe('param2');
    });

    it('should set loading to false after ngOnInit', () => {
      component.ngOnInit();
      expect(component.loading).toBeFalse();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('pressing Ctrl+S should trigger save and prevent default', () => {
      spyOn(component, 'save');
      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });
      spyOn(event, 'preventDefault');
      spyOn(event, 'stopImmediatePropagation');
      component.onKeydown(event);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopImmediatePropagation).toHaveBeenCalled();
      expect(component.save).toHaveBeenCalled();
    });

    it('pressing Ctrl+Y should trigger revertOneChange and prevent default', () => {
      spyOn(component, 'revertOneChange');
      const event = new KeyboardEvent('keydown', { key: 'y', ctrlKey: true });
      spyOn(event, 'preventDefault');
      spyOn(event, 'stopImmediatePropagation');
      component.onKeydown(event);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopImmediatePropagation).toHaveBeenCalled();
      expect(component.revertOneChange).toHaveBeenCalled();
    });

    it('pressing Ctrl+Z should trigger cancelOneChange and prevent default', () => {
      spyOn(component, 'cancelOneChange');
      const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true });
      spyOn(event, 'preventDefault');
      spyOn(event, 'stopImmediatePropagation');
      component.onKeydown(event);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopImmediatePropagation).toHaveBeenCalled();
      expect(component.cancelOneChange).toHaveBeenCalled();
    });

    it('should ignore non-shortcut keys', () => {
      spyOn(component, 'save');
      const event = new KeyboardEvent('keydown', { key: 'a' });
      component.onKeydown(event);
      expect(component.save).not.toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('should navigate back when goBack is invoked', () => {
      component.goBack();
      expect(locationSpy.back).toHaveBeenCalled();
    });
  });

  describe('Selection', () => {
    it('should set selectedIndex when onSelection is invoked', () => {
      component.onSelection(3);
      expect(component.selectedIndex).toBe(3);
    });

    it('should update selectedIndex on multiple selections', () => {
      component.onSelection(1);
      expect(component.selectedIndex).toBe(1);
      component.onSelection(5);
      expect(component.selectedIndex).toBe(5);
    });
  });

  describe('History Management', () => {
    beforeEach(() => {
      component.paramList = [];
      component.paramListHistory = [];
      component.paramFutureHistory = [];
    });

    it('should calculate lastIndex correctly', () => {
      expect(component.lastIndex).toBe(-1);
      component.paramListHistory.push({ param: [], message: 'test' });
      expect(component.lastIndex).toBe(0);
    });

    it('should record changes in onChange', () => {
      const param1 = new Param('param1', {});
      component.paramList = [param1];
      component.onChange('added param1');
      
      expect(component.paramListHistory.length).toBe(1);
      expect(component.paramListHistory[0].message).toBe('added param1');
      expect(component.paramFutureHistory.length).toBe(0);
    });

    it('should clear future history when onChange is called', () => {
      component.paramListHistory = [{ param: [], message: 'original' }];
      component.paramFutureHistory = [{ param: [], message: 'reverted' }];
      
      component.onChange('new change');
      
      expect(component.paramFutureHistory.length).toBe(0);
    });

    it('should cancel changes to previous state', () => {
      const param1 = new Param('param1', { type: 'string' });
      const param2 = new Param('param2', { type: 'number' });
      
      component.paramList = [param1];
      component.onChange('added param1');
      
      component.paramList = [param1, param2];
      component.onChange('added param2');
      
      component.cancelOneChange();
      
      expect(component.paramList.length).toBe(1);
      expect(component.paramFutureHistory.length).toBe(1);
      expect(matSnackBarSpy.open).toHaveBeenCalledWith('undone added param2', 'INFO');
    });

    it('should not cancel changes when history length is 0', () => {
      component.paramListHistory = [];
      component.cancelOneChange();
      expect(component.paramListHistory.length).toBe(0);
    });

    it('should revert changes to future state', () => {
      const param1 = new Param('param1', {});
      component.paramList = [param1];
      component.onChange('added param1');
      const param2 = new Param('param2', {});
      component.paramList = [param1, param2];
      component.onChange('added param2');
      component.cancelOneChange();
      expect(matSnackBarSpy.open).toHaveBeenCalledWith('undone added param2', 'INFO');

      component.revertOneChange();
      
      expect(component.paramListHistory.length).toBe(2);
      expect(matSnackBarSpy.open).toHaveBeenCalledWith('reverted added param2', 'INFO');
    });

    it('should not revert changes when future history is empty', () => {
      component.paramFutureHistory = [];
      component.paramListHistory = [{ param: [], message: 'original' }];
      component.revertOneChange();
      expect(component.paramListHistory.length).toBe(1);
    });
  });

  describe('Schema Conversion', () => {
    it('should convert paramList to schema object', () => {
      const param1 = new Param('param1', { type: 'string', deprecated: false });
      const param2 = new Param('param2', { type: 'number', required: true });
      component.paramList = [param1, param2];
      
      component.toSchema();
      
      expect(component.sch).toBeDefined();
      expect(component.sch['param1']).toBeDefined();
      expect(component.sch['param2']).toBeDefined();
    });

    it('should export params with original scheme data', () => {
      component.scheme = {
        announcement: {
          response: 'response data',
          access: 'public',
          description: 'test'
        }
      };
      component.controllerName = 'testCtrl';
      component.controllerType = 'read';
      component.controllerPackage = 'test.package';
      
      const param1 = new Param('param1', { type: 'string' });
      component.paramList = [param1];
      
      const result = component.export();
      
      expect(result).toBeDefined();
      expect(result.params).toBeDefined();
      expect(result.params['param1']).toBeDefined();
    });
  });

  describe('JSON Formatting', () => {
    it('should format json with controller metadata', () => {
      component.scheme = {
        announcement: {
          response: { type: 'object' },
          access: 'public',
          description: 'Test controller',
          deprecated: false
        }
      };
      component.controllerName = 'testController';
      component.controllerType = 'read';
      component.controllerPackage = 'test.package';
      
      const formatted = component.formatJson({ params: {} });
      
      expect(formatted.name).toBe('testController');
      expect(formatted.type).toBe('read');
      expect(formatted.package_name).toBe('test.package');
    });

    it('should copy announcement fields to formatted json', () => {
      component.scheme = {
        announcement: {
          response: { type: 'object' },
          access: 'public',
          description: 'Test controller',
          deprecated: false,
          help: 'Help text',
          usage: 'Usage example',
          providers: 'test_provider',
          constants: { CONSTANT: 'value' }
        }
      };
      component.controllerName = 'ctrl';
      component.controllerType = 'read';
      component.controllerPackage = 'pkg';
      
      const formatted = component.formatJson({ params: {} });
      
      expect(formatted.response).toBeDefined();
      expect(formatted.access).toBe('public');
      expect(formatted.description).toBe('Test controller');
      expect(formatted.help).toBe('Help text');
    });
  });

  describe('Dialog and UI', () => {
    it('should open json viewer dialog when showJson is called', () => {
      component.paramsScheme = {
        announcement: { params: { param1: {} } }
      };
      component.ngOnInit();
      component.controllerName = 'test';
      component.controllerType = 'read';
      component.controllerPackage = 'pkg';
      component.scheme = component.paramsScheme;
      
      component.showJson();
      
      expect(matDialogSpy.open).toHaveBeenCalledWith(
        jasmine.any(Function),
        jasmine.objectContaining({
          width: '75%',
          height: '85%'
        })
      );
    });

    it('should handle custom button "show JSON"', () => {
      spyOn(component, 'showJson');
      component.handleCustomButton('show JSON');
      expect(component.showJson).toHaveBeenCalled();
    });

    it('should ignore unknown custom buttons', () => {
      spyOn(component, 'showJson');
      component.handleCustomButton('unknown button');
      expect(component.showJson).not.toHaveBeenCalled();
    });
  });

  describe('Persistence', () => {
    it('should call validateAndSave when save is invoked', () => {
      component.paramsScheme = { announcement: { params: {} } };
      component.controllerName = 'testController';
      component.controllerType = 'read';
      component.controllerPackage = 'test.package';
      component.scheme = component.paramsScheme;
      
      jsonValidationServiceSpy.validateBySchemaType.and.returnValue(true);
      
      component.save();
      
      expect(jsonValidationServiceSpy.validateAndSave).toHaveBeenCalled();
      expect(jsonValidationServiceSpy.validateBySchemaType).toHaveBeenCalled();
    });

    it('should pass formatted json to validation service', () => {
      component.paramsScheme = { announcement: { params: {} } };
      component.controllerName = 'ctrl';
      component.controllerType = 'write';
      component.controllerPackage = 'pkg';
      component.scheme = component.paramsScheme;
      
      jsonValidationServiceSpy.validateBySchemaType.and.returnValue(true);
      
      component.save();
      
      const callArgs = jsonValidationServiceSpy.validateAndSave.calls.mostRecent().args;
      expect(callArgs[0]).toBe(true);
    });
  });

  describe('Lifecycle', () => {
    it('should clean up subscriptions on destroy', () => {
      spyOn(component['ngUnsubscribe'], 'next');
      spyOn(component['ngUnsubscribe'], 'complete');
      component.ngOnDestroy();
      expect(component['ngUnsubscribe'].next).toHaveBeenCalled();
      expect(component['ngUnsubscribe'].complete).toHaveBeenCalled();
    });
  });

});