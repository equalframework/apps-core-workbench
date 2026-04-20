import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { ModelTradEditorComponent } from './model-trad-editor.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SharedLibModule } from 'sb-shared-lib';
import { TranslateFakeLoader } from '@ngx-translate/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { Injector, NO_ERRORS_SCHEMA } from '@angular/core';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { NotificationService } from 'src/app/in/_services/notification.service';
import { QueryParamNavigatorService } from 'src/app/_services/query-param-navigator.service';
import { JsonValidationService } from 'src/app/in/_services/json-validation.service';
import { EqualComponentsProviderService } from 'src/app/in/_services/equal-components-provider.service';

describe('ModelTradEditorComponent', () => {
  let component: ModelTradEditorComponent;
  let fixture: ComponentFixture<ModelTradEditorComponent>;
  let mockActivatedRoute: any;
  let mockWorkbenchService: jasmine.SpyObj<WorkbenchService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockMatDialog: jasmine.SpyObj<MatDialog>;
  let mockLocation: jasmine.SpyObj<Location>;
  let mockQueryParamNavigator: jasmine.SpyObj<QueryParamNavigatorService>;
  let mockJsonValidationService: jasmine.SpyObj<JsonValidationService>;
  let mockEqualComponentsProvider: jasmine.SpyObj<EqualComponentsProviderService>;
  let mockInjector: jasmine.SpyObj<Injector>;

  beforeAll(() => {
    // Deactivate teardown for these tests because of a problem with
    // the primeNg dialog.
    TestBed.resetTestEnvironment();
    TestBed.initTestEnvironment(
        BrowserDynamicTestingModule,
        platformBrowserDynamicTesting(),
        {teardown: {destroyAfterEach: false}}
      );
  });

  beforeEach(async () => {
    // Create mock services
    mockActivatedRoute = {
      parent: {
        snapshot: {
          paramMap: {
            get: jasmine.createSpy('get').and.returnValue('test-package')
          }
        }
      },
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.callFake((key: string) => {
            if (key === 'class_name') return 'TestModel';
            if (key === 'type') return 'model';
            return null;
          })
        }
      },
      queryParams: of({})
    };

    mockWorkbenchService = jasmine.createSpyObj('WorkbenchService', [
      'collectAllLanguagesCode',
      'getTranslations',
      'getTranslationLanguages',
      'getSchema',
      'readView',
      'saveTranslations'
    ]);

    mockNotificationService = jasmine.createSpyObj('NotificationService', ['showError', 'showSuccess']);
    mockMatDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockLocation = jasmine.createSpyObj('Location', ['back']);
    mockQueryParamNavigator = jasmine.createSpyObj('QueryParamNavigatorService', ['handleQueryParams']);
    mockJsonValidationService = jasmine.createSpyObj('JsonValidationService', [
      'validateAndSave',
      'validateBySchemaType'
    ]);
    mockEqualComponentsProvider = jasmine.createSpyObj('EqualComponentsProviderService', ['getComponents']);
    mockInjector = jasmine.createSpyObj('Injector', ['get']);

    // Setup default return values - all must return Observables or safe defaults
    mockWorkbenchService.collectAllLanguagesCode.and.returnValue(of(['en', 'fr', 'de']));
    mockWorkbenchService.getTranslations.and.returnValue(of({}));
    mockWorkbenchService.getTranslationLanguages.and.returnValue(of([] as any));
    mockWorkbenchService.getSchema.and.returnValue(of({ fields: { field1: { type: 'string' } } }));
    mockWorkbenchService.readView.and.returnValue(of());
    mockWorkbenchService.saveTranslations.and.returnValue(of({}));
    mockEqualComponentsProvider.getComponents.and.returnValue(of([]));
    mockInjector.get.and.returnValue(mockEqualComponentsProvider);

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [ModelTradEditorComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: WorkbenchService, useValue: mockWorkbenchService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: MatDialog, useValue: mockMatDialog },
        { provide: Location, useValue: mockLocation },
        { provide: QueryParamNavigatorService, useValue: mockQueryParamNavigator },
        { provide: JsonValidationService, useValue: mockJsonValidationService },
        { provide: EqualComponentsProviderService, useValue: mockEqualComponentsProvider },
        { provide: Injector, useValue: mockInjector },
        { provide: TranslateFakeLoader }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelTradEditorComponent);
    component = fixture.componentInstance;
    // Don't call detectChanges here to avoid triggering HTTP calls during initialization
  });

  // ============================================================================
  // COMPONENT INITIALIZATION TESTS
  // ============================================================================

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default properties', () => {
    expect(component.packageName).toBeFalsy();
    expect(component.modelName).toBeFalsy();
    expect(component.activeTab).toBe('model');
    expect(component.loading).toBe(true);
    expect(component.isSaving).toBe(false);
    expect(component.data).toEqual({});
    expect(component.allLanguages.length).toBeGreaterThan(0);
  });

  it('should have correct tab names', () => {
    expect(component.TAB_NAMES).toEqual(['model', 'view', 'error']);
  });

  it('should map tab names to indices correctly', () => {
    expect(component['tabNameToIndexMap']['model']).toBe(0);
    expect(component['tabNameToIndexMap']['view']).toBe(1);
    expect(component['tabNameToIndexMap']['error']).toBe(2);
  });

  it('should have error type descriptions defined', () => {
    expect(component.ERROR_TYPE_DESCRIPTIONS['missing_mandatory']).toBeDefined();
    expect(component.ERROR_TYPE_DESCRIPTIONS['missing_mandatory'].severity).toBe('error');
    expect(component.ERROR_TYPE_DESCRIPTIONS['pattern_mismatch'].severity).toBe('warning');
  });

  // ============================================================================
  // FORM VALIDATION TESTS
  // ============================================================================

  it('should validate snake_case format', () => {
    const control = new FormControl('valid-snake_case');
    const result = ModelTradEditorComponent.snakeCaseValidator(control);
    expect(result).toBeNull();
  });

  it('should reject invalid characters in snake_case', () => {
    const control = new FormControl('invalid@case');
    const result = ModelTradEditorComponent.snakeCaseValidator(control);
    expect(result).toEqual({ case: true });
  });

  it('should validate language code format (2-letter)', () => {
    const control = new FormControl('en');
    const result = ModelTradEditorComponent.langCaseValidator(control);
    expect(result).toBeNull();
  });

  it('should validate language code format (5-letter with region)', () => {
    const control = new FormControl('en_US');
    const result = ModelTradEditorComponent.langCaseValidator(control);
    expect(result).toBeNull();
  });

  it('should reject invalid language code format', () => {
    const control = new FormControl('invalid');
    const result = ModelTradEditorComponent.langCaseValidator(control);
    expect(result).toEqual({ case: true });
  });

  // ============================================================================
  // TAB SWITCHING TESTS
  // ============================================================================

  it('should change active tab on onTabChange', () => {
    component.onTabChange(1);
    expect(component.activeTab).toBe('view');
    expect(component.selectedTabIndex).toBe(1);
  });

  it('should clear active field when tab changes', () => {
    component.activeField = 'testField';
    component.onTabChange(0);
    expect(component.activeField).toBe('');
  });

  it('should set activeView when switching to view tab', () => {
    component.lang = 'en';
    component.data['en'] = {
      view: { testView: {} }
    } as any;
    component.onTabChange(1);
    expect(component.activeView).toBe('testView');
  });

  it('should clear activeView when switching away from view tab', () => {
    component.activeView = 'testView';
    component.onTabChange(0);
    expect(component.activeView).toBe('');
  });

  // ============================================================================
  // VIEW SELECTION TESTS
  // ============================================================================

  it('should get view names from current language', () => {
    component.lang = 'en';
    component.data['en'] = {
      view: { view1: {}, view2: {} }
    } as any;
    const views = component.getViewNames();
    expect(views).toContain('view1');
    expect(views).toContain('view2');
  });

  it('should return empty array if no language selected', () => {
    component.lang = '';
    const views = component.getViewNames();
    expect(views).toEqual([]);
  });

  it('should handle view selection by index', () => {
    component.lang = 'en';
    component.data['en'] = {
      view: { view1: {}, view2: {} }
    } as any;
    component.onViewSelected(1);
    expect(component.activeView).toBe('view2');
  });

  it('should initialize view active tab on view selection', () => {
    component.lang = 'en';
    component.data['en'] = {
      view: { view1: { layout: {} } }
    } as any;
    component.onViewSelected(0);
    expect(component.viewActiveTab['view1']).toBeDefined();
  });

  // ============================================================================
  // LANGUAGE MANAGEMENT TESTS
  // ============================================================================

  it('should change language and clear fields', () => {
    component.activeField = 'testField';
    component.onLangChange('fr');
    expect(component.lang).toBe('fr');
    expect(component.activeField).toBe('');
  });

  it('should update available languages based on existing data', () => {
    component.data = { en: {}, fr: {} } as any;
    component.allLanguages = ['en', 'fr', 'de', 'es'];
    component.updateAvailableLanguages();
    expect(component.availableLanguages).toEqual(['de', 'es']);
  });

  it('should not allow creating duplicate language', async () => {
    component.data['en'] = {} as any;
    component.langName.setValue('en');
    await component.createLanguage();
    expect(mockNotificationService.showError).toHaveBeenCalledWith(
      'This model already has a translation for this language.',
      'ERROR'
    );
  });

  // ============================================================================
  // ERROR FIELD MANAGEMENT TESTS
  // ============================================================================

  it('should toggle error field expansion', () => {
    component.expandedErrorFields['field1'] = false;
    component.toggleErrorFieldExpansion('field1');
    expect(component.expandedErrorFields['field1']).toBe(true);
  });

  it('should return error field expansion state', () => {
    component.expandedErrorFields['field1'] = true;
    expect(component.isErrorFieldExpanded('field1')).toBe(true);
  });

  it('should default to expanded for undefined fields', () => {
    expect(component.isErrorFieldExpanded('newField')).toBe(true);
    expect(component.expandedErrorFields['newField']).toBe(true);
  });

  it('should get suggested errors for field usage', () => {
    component['_modelTemplate'] = {
      modelFields: ['field1'],
      views: [],
      errors: {
        field1: { fieldUsage: 'text', errorTypes: ['size_exceeded', 'broken_usage'] }
      }
    } as any;
    const errors = component.getSuggestedErrorsForField('field1');
    expect(errors).toEqual(['size_exceeded', 'broken_usage']);
  });

  it('should get error description', () => {
    const desc = component.getErrorDescription('missing_mandatory');
    expect(desc).toBe('Field is null/empty and required');
  });

  it('should get error severity', () => {
    expect(component.getErrorSeverity('missing_mandatory')).toBe('error');
    expect(component.getErrorSeverity('pattern_mismatch')).toBe('warning');
  });

  // ============================================================================
  // UTILITY TESTS
  // ============================================================================

  it('should sort object keys alphabetically', () => {
    const obj = { zebra: 1, apple: 2, banana: 3 };
    const keys = component.obk(obj);
    expect(keys).toEqual(['apple', 'banana', 'zebra']);
  });

  it('should go back using location service', () => {
    component.goBack();
    expect(mockLocation.back).toHaveBeenCalled();
  });

  it('should start adding language', () => {
    component.startAddingLanguage();
    expect(component.addingLanguage).toBe(true);
  });

  it('should stop adding language', () => {
    component.addingLanguage = true;
    component.stopAddingLanguage();
    expect(component.addingLanguage).toBe(false);
  });

  it('should return field usage from model template', () => {
    component['_modelTemplate'] = {
      modelFields: ['field1'],
      views: [],
      errors: {
        field1: { fieldUsage: 'email', errorTypes: [] }
      }
    };
    expect(component.getFieldUsage('field1')).toBe('email');
  });

  it('should return empty value if usage not found', () => {
    component['_modelTemplate'] = {
      modelFields: [],
      views: [],
      errors: {}
    };
    expect(component.getFieldUsage('unknown')).toBe('');
  });

  // ============================================================================
  // NAVIGATION TESTS
  // ============================================================================

  it('should initialize navigation with activators', () => {
    component['initializeNavigation']();
    expect(component['activatorRegistry']).toBeDefined();
  });

  it('should get selected view index', () => {
    component.lang = 'en';
    component.data['en'] = {
      view: { view1: {}, view2: {} }
    } as any;
    component.activeView = 'view2';
    const index = component.getSelectedViewIndex();
    expect(index).toBe(1);
  });

  it('should handle inner view tab switching', () => {
    component.lang = 'en';
    component.data['en'] = {
      view: { view1: { layout: {}, actions: {} } }
    } as any;
    component.activeView = 'view1';
    component.onViewInnerChange('view1', 1);
    expect(component.selectedViewTabIndex['view1']).toBe(1);
  });
});
