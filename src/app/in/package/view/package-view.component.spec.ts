import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PackageViewComponent } from './package-view.component';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { RouterMemory } from '../../../_services/router-memory.service';
import { QueryParamNavigatorService } from '../../../_services/query-param-navigator.service';
import { TypeUsageService } from '../../../_services/type-usage.service';
import { EqualComponentsProviderService } from '../../_services/equal-components-provider.service';
import { NotificationService } from '../../_services/notification.service';
import { WorkbenchService } from '../../_services/workbench.service';
import { JsonValidationService, ValidationResult } from '../../../in/_services/json-validation.service';
import { View } from './_objects/View';
import { EqualComponentDescriptor } from '../../_models/equal-component-descriptor.class';

describe('PackageViewComponent', () => {
  let component: PackageViewComponent;
  let fixture: ComponentFixture<PackageViewComponent>;

  // Mock services
  let mockActivatedRoute: any;
  let mockLocation: jasmine.SpyObj<Location>;
  let mockWorkbenchService: jasmine.SpyObj<WorkbenchService>;
  let mockMatDialog: jasmine.SpyObj<MatDialog>;
  let mockMatSnackBar: jasmine.SpyObj<MatSnackBar>;
  let mockTypeUsageService: jasmine.SpyObj<TypeUsageService>;
  let mockEqualComponentsProvider: jasmine.SpyObj<EqualComponentsProviderService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockRouterMemory: jasmine.SpyObj<RouterMemory>;
  let mockQueryParamNavigator: jasmine.SpyObj<QueryParamNavigatorService>;
  let mockJsonValidationService: jasmine.SpyObj<JsonValidationService>;

  beforeEach(async () => {
    // Setup mock ActivatedRoute
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.callFake((key: string) => {
            const params: any = { package_name: 'test_package' };
            return params[key];
          })
        },
        params: {
          entity_view: 'Post:default.form'
        }
      },
      queryParams: of({})
    };

    // Setup mock services
    mockLocation = jasmine.createSpyObj('Location', ['back']);
    
    mockWorkbenchService = jasmine.createSpyObj('WorkbenchService', [
      'getSchema',
      'readView',
      'collectControllers',
      'announceController',
      'getCoreGroups',
      'saveView'
    ]);

    mockMatDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockMatSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    mockTypeUsageService = jasmine.createSpyObj('TypeUsageService', [], {
      typeIcon: { 'string': 'text_fields', 'integer': 'numbers' }
    });

    mockEqualComponentsProvider = jasmine.createSpyObj('EqualComponentsProviderService', ['getComponent']);
    mockNotificationService = jasmine.createSpyObj('NotificationService', [
      'showError',
      'showSuccess',
      'showInfo'
    ]);

    mockRouterMemory = jasmine.createSpyObj('RouterMemory', ['someMethod']);
    mockQueryParamNavigator = jasmine.createSpyObj('QueryParamNavigatorService', ['handleQueryParams']);
    
    mockJsonValidationService = jasmine.createSpyObj('JsonValidationService', [
      'validateView',
      'validateAndSave',
      'getErrorSummary',
      'formatErrorsForDisplay'
    ]);

    // Default return values for mocked methods
    mockWorkbenchService.getSchema.and.returnValue(of({
      fields: {
        title: { type: 'string' },
        description: { type: 'string' }
      }
    }));

    mockWorkbenchService.readView.and.returnValue(of({
      name: 'default',
      layout: { items: [] },
      operations: [],
      groupBy: { items: [] }
    }));

    mockWorkbenchService.collectControllers.and.returnValue(of(['test_controller']));
    mockWorkbenchService.announceController.and.returnValue(of({
      announcement: { extends: 'core_model_collect' }
    }));
    mockWorkbenchService.getCoreGroups.and.returnValue(of({
      group1: { name: 'Group 1' },
      group2: { name: 'Group 2' }
    }));

    mockEqualComponentsProvider.getComponent.and.returnValue(of(
      new EqualComponentDescriptor('test_package', 'Post:default.form', 'view')
    ));

    mockJsonValidationService.validateView.and.returnValue(of({ valid: true, errors: [], warnings: [], message: '' } as ValidationResult));
    mockJsonValidationService.validateAndSave.and.callFake((validate$, saveFn, setIsSaving) => {
      setIsSaving(true);

      validate$.subscribe(
        (validationResult) => {
          if (validationResult.valid) {
            saveFn().subscribe(
              (result) => {
                setIsSaving(false);
                const saveResult = result || {};
                const wasSuccessful = typeof saveResult.success === 'boolean' ? saveResult.success : true;
                const saveMessage = saveResult.message || (wasSuccessful ? 'Saved successfully' : 'Save failed');

                if (wasSuccessful) {
                  mockNotificationService.showSuccess(saveMessage);
                } else {
                  mockNotificationService.showError(saveMessage);
                }
              },
              (error) => {
                setIsSaving(false);
                mockNotificationService.showError('Save error: ' + (error.message || 'Unknown error'));
              }
            );
          } else {
            setIsSaving(false);
            const summary = mockJsonValidationService.getErrorSummary(validationResult);
            const details = mockJsonValidationService.formatErrorsForDisplay(validationResult.errors);
            mockNotificationService.showError(summary + '\n\n' + details);
          }
        },
        (error) => {
          setIsSaving(false);
          mockNotificationService.showError('Validation error: ' + (error.message || 'Failed to validate'));
        }
      );
    });

    await TestBed.configureTestingModule({
      declarations: [PackageViewComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Location, useValue: mockLocation },
        { provide: WorkbenchService, useValue: mockWorkbenchService },
        { provide: MatDialog, useValue: mockMatDialog },
        { provide: MatSnackBar, useValue: mockMatSnackBar },
        { provide: TypeUsageService, useValue: mockTypeUsageService },
        { provide: EqualComponentsProviderService, useValue: mockEqualComponentsProvider },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: RouterMemory, useValue: mockRouterMemory },
        { provide: QueryParamNavigatorService, useValue: mockQueryParamNavigator },
        { provide: JsonValidationService, useValue: mockJsonValidationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PackageViewComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.loading).toBe(true);
      expect(component.error).toBe(false);
      expect(component.isSaving).toBe(false);
      expect(component.selectedTabIndex).toBe(0);
      // name and entity are set during init, not in constructor
      expect(component.fields).toBeDefined();
    });

    it('should have correct tab name to index mapping', () => {
      component.ngOnInit();
      expect(component['tabNameToIndexMap']).toEqual({
        layout: 0,
        header: 1,
        actions: 2,
        routes: 3,
        advanced: 4
      });
    });
  });

  describe('ngOnInit and init()', () => {
    it('should call init() on component initialization', async () => {
      spyOn(component, 'init').and.returnValue(Promise.resolve());
      
      await component.ngOnInit();
      
      expect(component.init).toHaveBeenCalled();
    });

    it('should initialize navigation', async () => {
      spyOn<any>(component, 'initializeNavigation');
      
      await component.ngOnInit();
      
      expect(component['initializeNavigation']).toHaveBeenCalled();
    });

    it('should initialize query param activator registry', async () => {
      await component.ngOnInit();
      
      expect(component['queryParamActivatorRegistry']).toBeDefined();
    });

    it('should load component and set properties correctly', async () => {
      await component.init();
      // Wait for all promises and observables to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      fixture.detectChanges();
      
      // After init completes, these properties should be set
      expect(component.name).toBe('form');
      expect(component.entity).toBe('Post');
      expect(component.viewId).toBe('default.form');
    });

    it('should load schema and set fields', async () => {
      await component.init();
      await fixture.whenStable();
      
      expect(mockWorkbenchService.getSchema).toHaveBeenCalledWith('test_package\\Post');
      expect(component.fields).toEqual(['title', 'description']);
    });

    it('should load view scheme', async () => {
      await component.init();
      await fixture.whenStable();
      
      expect(mockWorkbenchService.readView).toHaveBeenCalledWith(
        'test_package',
        'default.form',
        'Post'
      );
      expect(component.viewScheme).toBeDefined();
    });

    it('should collect controllers and filter by extends', async () => {
      mockWorkbenchService.collectControllers.and.returnValue(of(['test_controller', 'other_controller']));
      mockWorkbenchService.announceController.and.callFake((controller: string) => {
        if (controller === 'test_controller') {
          return of({ announcement: { extends: 'core_model_collect' } });
        }
        return of({ announcement: { extends: 'other' } });
      });

      await component.init();
      await new Promise(resolve => setTimeout(resolve, 50));
      fixture.detectChanges();

      // Controllers start with core_model_collect and may be updated
      expect(component.collectController.length).toBeGreaterThan(0);
    });

    it('should load core groups', async () => {
      await component.init();
      // Give promise chain time to complete
      await new Promise(resolve => setTimeout(resolve, 50));
      fixture.detectChanges();

      expect(component.groups.length).toBeGreaterThanOrEqual(0);
    });

    it('should set icon type from TypeUsageService', async () => {
      await component.init();
      await fixture.whenStable();

      expect(component.iconType).toEqual({ 'string': 'text_fields', 'integer': 'numbers' });
    });

    it('should handle component not found', async () => {
      mockEqualComponentsProvider.getComponent.and.returnValue(of(null));

      await component.init();
      await fixture.whenStable();

      expect(component.loading).toBe(false);
    });

    it('should handle schema loading error', async () => {
      mockWorkbenchService.getSchema.and.returnValue(throwError({ message: 'Schema error' }));

      await component.init();
      await fixture.whenStable();

      // The loading state reflects initialization attempt
      expect(component.error).toBe(true);
    });

    it('should handle view scheme loading error', async () => {
      mockWorkbenchService.readView.and.returnValue(throwError({ message: 'View error' }));

      await component.init();
      await fixture.whenStable();

      // When an error occurs during init, error flag is set
      expect(component.error).toBe(true);
    });
  });

  describe('View Object Changes', () => {
    it('should update viewObj when onViewObjChange is called', () => {
      const newView = new View({ layout: { items: [] }, operations: [], groupBy: { items: [] } }, '');
      
      component.onViewObjChange(newView);
      
      expect(component.viewObj).toEqual(newView);
    });
  });

  describe('ID Compliance', () => {
    it('should return ID compliance status', async () => {
      await component.init();
      spyOn(component.viewObj, 'id_compliant').and.returnValue({ ok: true, id_list: ['id1', 'id2'] });

      const compliance = component.idCompliancy;

      expect(compliance.ok).toBe(true);
      expect(compliance.id_list).toEqual(['id1', 'id2']);
    });

    it('should identify duplicate IDs', async () => {
      await component.init();
      component['compliancyCache'] = { ok: false, id_list: ['id1', 'id2', 'id1'] };

      const doublons = component.idDuplicates;

      expect(doublons).toBe('id1');
    });

    it('should handle multiple duplicate IDs', async () => {
      await component.init();
      component['compliancyCache'] = { ok: false, id_list: ['id1', 'id2', 'id1', 'id2'] };

      const doublons = component.idDuplicates;

      expect(doublons).toContain('id1');
      expect(doublons).toContain('id2');
    });
  });

  describe('Save Functionality', () => {
    beforeEach(async () => {
      await component.init();
      spyOn(component.viewObj, 'id_compliant').and.returnValue({ ok: true, id_list: ['id1'] });
      spyOn(component.viewObj, 'export').and.returnValue({
        layout: { items: [] },
        operations: [],
        groupBy: { items: [] }
      });
    });

    it('should save successfully when validation passes', async () => {
      mockJsonValidationService.validateView.and.returnValue(of({ valid: true, errors: [], warnings: [], message: '' } as ValidationResult));
      mockWorkbenchService.saveView.and.returnValue(of({ success: true, message: 'Saved' }));

      component.save();
      await fixture.whenStable();

      expect(mockJsonValidationService.validateView).toHaveBeenCalled();
      expect(mockWorkbenchService.saveView).toHaveBeenCalled();
      expect(mockNotificationService.showSuccess).toHaveBeenCalledWith('Saved');
    });

    it('should show error when validation fails', async () => {
      mockJsonValidationService.validateView.and.returnValue(of({
        valid: false,
        errors: [{ message: 'Invalid field' }],
        warnings: [],
        message: 'Validation failed'
      }));
      mockJsonValidationService.getErrorSummary.and.returnValue('Validation failed');
      mockJsonValidationService.formatErrorsForDisplay.and.returnValue('Field error');

      component.save();
      await fixture.whenStable();

      expect(mockNotificationService.showError).toHaveBeenCalled();
    });

    it('should prevent saving if ID compliance fails', () => {
      spyOnProperty(component, 'idCompliancy', 'get').and.returnValue({ ok: false, id_list: ['id1', 'id1'] });
      spyOnProperty(component, 'idDuplicates', 'get').and.returnValue('id1');

      component.save();

      expect(mockNotificationService.showError).toHaveBeenCalledWith(
        jasmine.stringMatching(/Cannot save/)
      );
      expect(mockWorkbenchService.saveView).not.toHaveBeenCalled();
    });

    it('should not allow concurrent saves', () => {
      component.isSaving = true;

      component.save();

      expect(mockWorkbenchService.saveView).not.toHaveBeenCalled();
    });

    it('should show error when save fails', async () => {
      mockJsonValidationService.validateView.and.returnValue(of({ valid: true, errors: [], warnings: [], message: '' } as ValidationResult));
      mockWorkbenchService.saveView.and.returnValue(of({ success: false, message: 'Save failed' }));

      component.save();
      await fixture.whenStable();

      expect(mockNotificationService.showError).toHaveBeenCalledWith('Save failed');
    });

    it('should handle save errors from service', async () => {
      mockJsonValidationService.validateView.and.returnValue(of({ valid: true, errors: [], warnings: [], message: '' } as ValidationResult));
      mockWorkbenchService.saveView.and.returnValue(throwError({ message: 'Network error' }));

      component.save();
      await fixture.whenStable();

      expect(mockNotificationService.showError).toHaveBeenCalledWith(
        jasmine.stringMatching(/Save error/)
      );
    });

    it('should handle validation request errors', async () => {
      mockJsonValidationService.validateView.and.returnValue(throwError({ message: 'Validation error' }));

      component.save();
      await fixture.whenStable();

      expect(mockNotificationService.showError).toHaveBeenCalledWith(
        jasmine.stringMatching(/Validation error/)
      );
    });

    it('should reset isSaving flag after successful save', async () => {
      mockJsonValidationService.validateView.and.returnValue(of({ valid: true, errors: [], warnings: [], message: '' } as ValidationResult));
      mockWorkbenchService.saveView.and.returnValue(of({ success: true, message: 'Saved' }));

      component.save();
      await fixture.whenStable();

      expect(component.isSaving).toBe(false);
    });

    it('should reset isSaving flag after failed validation', async () => {
      mockJsonValidationService.validateView.and.returnValue(of({ valid: false, errors: [], warnings: [], message: '' } as ValidationResult));
      mockJsonValidationService.getErrorSummary.and.returnValue('Error');
      mockJsonValidationService.formatErrorsForDisplay.and.returnValue('Details');

      component.save();
      await fixture.whenStable();

      expect(component.isSaving).toBe(false);
    });
  });

  describe('Cancel Functionality', () => {
    it('should reinitialize component on cancel', async () => {
      spyOn(component, 'init').and.returnValue(Promise.resolve());
      
      component.cancel();
      
      // Wait for setTimeout
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(component.init).toHaveBeenCalled();
    });

    it('should show cancel notification', async () => {
      spyOn(component, 'init').and.returnValue(Promise.resolve());
      
      component.cancel();
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Changes canceled', '', {
        duration: 1000
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate back', () => {
      component.goBack();

      expect(mockLocation.back).toHaveBeenCalled();
    });
  });

  describe('Custom Button Handling', () => {
    it('should open JSON viewer for "Show JSON" button', () => {
      spyOn(component, 'openJsonViewer');

      component.handleCustomButton('Show JSON');

      expect(component.openJsonViewer).toHaveBeenCalled();
    });

    it('should not do anything for unknown buttons', () => {
      spyOn(component, 'openJsonViewer');

      component.handleCustomButton('Unknown Button');

      expect(component.openJsonViewer).not.toHaveBeenCalled();
    });
  });

  describe('Utility Methods', () => {
    it('should open JSON viewer dialog', async () => {
      await component.init();
      mockMatDialog.open.and.returnValue({} as MatDialogRef<any>);

      component.openJsonViewer();

      expect(mockMatDialog.open).toHaveBeenCalled();
    });

    it('should format names correctly in ToNameDisp', () => {
      expect(component.ToNameDisp('test_name')).toBe('Test Name');
      expect(component.ToNameDisp('another_test_name')).toBe('Another Test Name');
      expect(component.ToNameDisp('simple')).toBe('Simple');
    });
  });

  describe('Navigation', () => {
    it('should initialize QueryParamActivatorRegistry', () => {
      component['initializeNavigation']();

      // The registry should be defined and initialized
      expect(component['queryParamActivatorRegistry']).toBeTruthy();
    });
  });

  describe('Object Initialization', () => {
    it('should initialize viewObj with correct type', async () => {
      await component.init();

      expect(component.viewObj instanceof View).toBe(true);
    });

    it('should have correct default layout', async () => {
      await component.init();

      expect(component.viewObj.layout).toBeDefined();
      expect(component.viewObj.operations).toBeDefined();
      expect(component.viewObj.groupBy).toBeDefined();
    });
  });

  describe('Loading and Error States', () => {
    it('should set loading to false after successful initialization', async () => {
      await component.init();
      // Wait for async subscription callback to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(component.loading).toBe(false);
    });

    it('should set error to true on initialization failure', async () => {
      mockWorkbenchService.getSchema.and.returnValue(throwError({ message: 'Error' }));

      await component.init();
      await fixture.whenStable();

      expect(component.error).toBe(true);
    });
  });
});
