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

  describe('Component Initialization', () => {
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
  });

  describe('Form Validators', () => {
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
      const control1 = new FormControl('invalid');
      const control2 = new FormControl('en-US');
      const control3 = new FormControl('en_uS');
      const control4 = new FormControl('en_Us');
      const control5 = new FormControl('En');
      const control6 = new FormControl('eN');

      const result1 = ModelTradEditorComponent.langCaseValidator(control1);
      const result2 = ModelTradEditorComponent.langCaseValidator(control2);
      const result3 = ModelTradEditorComponent.langCaseValidator(control3);
      const result4 = ModelTradEditorComponent.langCaseValidator(control4);
      const result5 = ModelTradEditorComponent.langCaseValidator(control5);
      const result6 = ModelTradEditorComponent.langCaseValidator(control6);
      expect(result1).toEqual({ case: true });
      expect(result2).toEqual({ case: true });
      expect(result3).toEqual({ case: true });
      expect(result4).toEqual({ case: true });
      expect(result5).toEqual({ case: true });
      expect(result6).toEqual({ case: true });
    });
  });

  describe('Tab Switching', () => {
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
  });

  describe('View Selection', () => {
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
  });

  describe('Language Management', () => {
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
  });

  describe('Error Field Management', () => {
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
  });

  describe('Utility Functions', () => {
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
  });

  describe('Navigation Initialization', () => {
    const getActivatorByType = (type: string) => {
      const activators = component['activatorRegistry'].getAll() as any[];
      return activators.find((activator: any) => activator.type === type);
    };

    it('should initialize navigation with activators', () => {
      component['initializeNavigation']();
      expect(component['activatorRegistry']).toBeDefined();
      const activators = component['activatorRegistry'].getAll();

      expect(activators.length).toBe(5);
      expect(activators.map((activator: any) => activator.type)).toEqual([
        'lang',
        'tab',
        'view',
        'view_tab',
        'field'
      ]);

      expect(activators).toEqual([
        jasmine.objectContaining({
          type: 'lang',
          queryParamKeys: ['lang'],
          canHandle: jasmine.any(Function),
          activate: jasmine.any(Function)
        }),
        jasmine.objectContaining({
          type: 'tab',
          queryParamKeys: ['tab'],
          canHandle: jasmine.any(Function),
          activate: jasmine.any(Function)
        }),
        jasmine.objectContaining({
          type: 'view',
          queryParamKeys: ['view'],
          canHandle: jasmine.any(Function),
          activate: jasmine.any(Function)
        }),
        jasmine.objectContaining({
          type: 'view_tab',
          queryParamKeys: ['view_tab'],
          canHandle: jasmine.any(Function),
          activate: jasmine.any(Function)
        }),
        jasmine.objectContaining({
          type: 'field',
          queryParamKeys: ['field'],
          canHandle: jasmine.any(Function),
          activate: jasmine.any(Function)
        })
      ]);
    });

    it('should evaluate and activate lang activator', async () => {
      component.data = { en: { view: {} } } as any;
      spyOn(component, 'onLangChange');
      component['initializeNavigation']();

      const langActivator = getActivatorByType('lang');
      expect(langActivator.canHandle('lang', 'en')).toBe(true);
      expect(langActivator.canHandle('tab', 'en')).toBe(false);
      expect(langActivator.canHandle('lang', 'es')).toBe(false);

      await langActivator.activate('lang', 'en', component as any);
      expect(component.onLangChange).toHaveBeenCalledWith('en');

      await langActivator.activate('lang', 'es', component as any);
      expect(component.onLangChange).toHaveBeenCalledTimes(1);
    });

    it('should evaluate and activate tab activator for view tab', async () => {
      component.lang = 'en';
      component.data['en'] = {
        view: { defaultView: {} }
      } as any;
      component.activeView = '';
      component.activeField = 'fieldA';
      component.errorActiveField = 'errFieldA';
      component['initializeNavigation']();

      const tabActivator = getActivatorByType('tab');
      expect(tabActivator.canHandle('tab', 'view')).toBe(true);
      expect(tabActivator.canHandle('tab', 'unknown')).toBe(false);

      await tabActivator.activate('tab', 'view', component as any);
      expect(component.activeTab).toBe('view');
      expect(component.selectedTabIndex).toBe(1);
      expect(component.activeView).toBe('defaultView');
      expect(component.activeField).toBe('');
      expect(component.errorActiveField).toBe('');
    });

    it('should evaluate and activate view activator', async () => {
      component.lang = 'en';
      component.data['en'] = {
        view: { view1: {}, view2: {} }
      } as any;
      component['initializeNavigation']();

      const viewActivator = getActivatorByType('view');
      expect(viewActivator.canHandle('view', 'view1')).toBe(true);
      expect(viewActivator.canHandle('view', 'missing')).toBe(false);
      expect(viewActivator.canHandle('tab', 'view1')).toBe(false);

      component.activeField = 'to-reset';
      await viewActivator.activate('view', 'view2', component as any);
      expect(component.activeView).toBe('view2');
      expect(component.viewActiveTab['view2']).toBe('');
      expect(component.activeField).toBe('');
    });

    it('should activate view_tab and initialize active view when needed', async () => {
      component.lang = 'en';
      component.activeTab = 'view';
      component.activeView = '';
      component.data['en'] = {
        view: { firstView: { layout: {} } }
      } as any;
      component['initializeNavigation']();

      const viewTabActivator = getActivatorByType('view_tab');
      expect(viewTabActivator.canHandle('view_tab', 'layout')).toBe(true);
      expect(viewTabActivator.canHandle('view_tab', null)).toBe(false);
      expect(viewTabActivator.canHandle('view_tab', 'invalid')).toBe(false);

      await viewTabActivator.activate('view_tab', 'layout', component as any);
      expect(component.activeView).toBe('firstView');
      expect(component.viewActiveTab['firstView']).toBe('layout');
      expect(component.selectedViewTabIndex['firstView']).toBe(0);
    });

    it('should activate field on model tab and on error tab', async () => {
      component.lang = 'en';
      component.data['en'] = {
        model: { f1: {} },
        error: {
          _base: {
            fErr: { val: {}, active: false }
          }
        }
      } as any;
      component['initializeNavigation']();

      const fieldActivator = getActivatorByType('field');

      component.activeTab = 'model';
      expect(fieldActivator.canHandle('field', 'f1')).toBe(true);
      expect(fieldActivator.canHandle('field', 'missing')).toBe(false);
      expect(fieldActivator.canHandle('tab', 'f1')).toBe(false);

      await fieldActivator.activate('field', 'f1', component as any);
      expect(component.activeField).toBe('f1');

      component.activeTab = 'error';
      await fieldActivator.activate('field', 'fErr', component as any);
      expect(component.errorActiveField).toBe('fErr');
      expect(component.data['en'].error._base.fErr.active).toBe(true);
      expect(component.expandedErrorFields['fErr']).toBe(true);
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

  describe('ngOnInit', () => {
    it('should initialize component on ngOnInit', async () => {
      spyOn<any>(component, 'initializeNavigation').and.callThrough();
      await component.ngOnInit();
      expect(component['initializeNavigation']).toHaveBeenCalled();
    });

    it('should set error state when route params are missing', async () => {
      mockActivatedRoute.parent.snapshot.paramMap.get.and.returnValue(null);
      mockActivatedRoute.snapshot.paramMap.get.and.returnValue(null);

      await component.ngOnInit();

      expect(component.error).toBe(true);
      expect(component.loading).toBe(true);
    });

    it('should handle query params through navigator', async () => {
      mockActivatedRoute.queryParams = of({ tab: 'model', lang: 'en' });
      await component.ngOnInit();
      expect(mockQueryParamNavigator.handleQueryParams).toHaveBeenCalled();
    });
  });

  describe('Translation Pipeline', () => {
    it('should handle empty translations data in initTranslations', async () => {
      mockWorkbenchService.getTranslations.and.returnValue(of(null));

      await component.initTranslations();

      expect(component.loading).toBe(false);
      expect(component.availableLanguages.length).toBeGreaterThan(0);
    });

    it('should initialize first language and load remaining in background', async () => {
      const allData = {
        en: [{ name: 'en-name' }],
        fr: [{ name: 'fr-name' }]
      } as any;
      mockWorkbenchService.getTranslations.and.returnValue(of(allData));
      mockWorkbenchService.getTranslationLanguages.and.callFake((pkg: string, model: string, lang: string) => {
        if (lang === 'en') {
          return of({ name: 'EN', model: { field1: { label: 'L' } }, view: {}, error: {} } as any);
        }
        return of({ name: 'FR', model: {}, view: {}, error: {} } as any);
      });
      mockWorkbenchService.getSchema.and.returnValue(of({ fields: { field1: { usage: 'text' } } }));
      mockEqualComponentsProvider.getComponents.and.returnValue(of([]));

      await component.initTranslations();

      expect(component.lang).toBe('en');
      expect(component.loading).toBe(false);
      expect(component.data.en).toBeDefined();
      expect(component.data.fr).toBeDefined();
    });

    it('should fetch translation languages while tolerating failures', async () => {
      mockWorkbenchService.getTranslationLanguages.and.callFake((pkg: string, model: string, lang: string) => {
        if (lang === 'fr') {
          return of(null as any);
        }
        return of({ name: 'EN' } as any);
      });

      const result = await (component as any).fetchAllTranslationLanguages(['en', 'fr']);

      expect(result.en).toEqual({ name: 'EN' });
      expect(result.fr).toBeUndefined();
    });

    it('should return null from fillLanguage when new translator is invalid', async () => {
      spyOn(component as any, 'createNewLang').and.resolveTo({ ok: false } as any);

      const result = await (component as any).fillLanguage('en', {});

      expect(result).toBeNull();
    });

    it('should ensure error base entries from model template', () => {
      (component as any)._modelTemplate = {
        modelFields: ['f1', 'f2'],
        views: [],
        errors: {}
      };
      component.data.en = { error: { _base: { f1: { active: true, val: {} } } } } as any;

      (component as any).ensureErrorBase('en');

      expect(component.data.en.error._base.f1).toBeDefined();
      expect(component.data.en.error._base.f2).toEqual({ active: false, val: {} });
    });

    it('should build model template with supported views only', async () => {
      mockWorkbenchService.getSchema.and.returnValue(of({
        fields: {
          a: { usage: 'text' },
          b: { usage: 'email' }
        }
      }));
      mockEqualComponentsProvider.getComponents.and.returnValue(of([
        { name: 'TestModel:list.main', package_name: 'test-package' },
        { name: 'TestModel:form.edit', package_name: 'test-package' },
        { name: 'TestModel:ignored.custom', package_name: 'test-package' }
      ] as any));
      mockWorkbenchService.readView.and.returnValue(of({ layout: {}, actions: [], routes: [], name: 'list.main' } as any));

      await (component as any)._buildModelTemplate();

      expect((component as any)._modelTemplate.modelFields).toEqual(['a', 'b']);
      expect((component as any)._modelTemplate.views.length).toBe(2);
      expect((component as any)._modelTemplate.errors.a.fieldUsage).toBe('text');
    });

    it('should create translator through createNewLang', async () => {
      (component as any)._modelTemplate = {
        modelFields: ['field1'],
        views: [],
        errors: {}
      };

      const translator = await component.createNewLang();

      expect(translator.ok).toBe(true);
      expect(translator.model.field1).toBeDefined();
    });
  });

  describe('Language And Error Operations', () => {
    it('should not create language when no language selected', async () => {
      component.langName.setValue('');
      await component.createLanguage();
      expect(Object.keys(component.data).length).toBe(0);
    });

    it('should create language and switch to it', async () => {
      (component as any)._modelTemplate = { modelFields: ['f1'], views: [], errors: {} };
      component.langName.setValue('de');

      await component.createLanguage();

      expect(component.data.de).toBeDefined();
      expect(component.lang).toBe('de');
      expect(component.addingLanguage).toBe(false);
    });

    it('should add preset error only once', () => {
      component.data.en = {
        error: {
          _base: {
            field1: { active: false, val: {} }
          }
        }
      } as any;

      component.addPresetError('field1', 'missing_mandatory', 'en');
      component.addPresetError('field1', 'missing_mandatory', 'en');

      expect(Object.keys(component.data.en.error._base.field1.val).length).toBe(1);
      expect(component.data.en.error._base.field1.active).toBe(true);
    });

    it('should create custom error entry', () => {
      component.data.en = {
        error: {
          _base: {
            field1: { active: true, val: {} }
          }
        }
      } as any;
      component.addError.setValue('my_custom_error');

      component.createError('en', 'field1');

      expect(component.data.en.error._base.field1.val.my_custom_error).toBeDefined();
      expect(component.addError.value).toBe('');
    });

    it('should toggle active error group state', () => {
      component.lang = 'en';
      component.data.en = {
        error: {
          _base: {
            field1: { active: false, val: {} }
          }
        }
      } as any;

      component.changeActive('field1');
      expect(component.data.en.error._base.field1.active).toBe(true);

      component.changeActive('field1');
      expect(component.data.en.error._base.field1.active).toBe(false);
    });

    it('should compute suggested errors not yet added', () => {
      (component as any)._modelTemplate = {
        modelFields: ['field1'],
        views: [],
        errors: {
          field1: { fieldUsage: 'text', errorTypes: [] }
        }
      };
      component.data.en = {
        error: {
          _base: {
            field1: {
              active: true,
              val: {
                size_exceeded: { isActive: true }
              }
            }
          }
        }
      } as any;

      const remaining = component.getSuggestedErrorsNotAdded('field1', 'en');

      expect(remaining).toEqual(['broken_usage']);
    });
  });

  describe('Field And View Branching', () => {
    it('should return visible inner tabs based on content', () => {
      component.lang = 'en';
      component.data.en = {
        view: {
          v1: {
            layout: { a: {} },
            actions: { b: {} },
            routes: {}
          }
        }
      } as any;

      const tabs = (component as any).getVisibleInnerTabs('v1');
      expect(tabs).toEqual(['layout', 'actions']);
    });

    it('should get inner tab index with fallback defaults', () => {
      component.lang = 'en';
      component.data.en = {
        view: {
          v1: {
            layout: { a: {} }
          }
        }
      } as any;

      const idx = component.getViewInnerIndex('v1');
      expect(idx).toBe(0);
      expect(component.viewActiveTab.v1).toBe('layout');
    });

    it('should validate field existence by active tab type', () => {
      component.lang = 'en';
      component.data.en = {
        model: { fieldA: {} },
        view: {
          view1: {
            layout: { fieldB: {} },
            actions: { fieldC: {} },
            routes: { fieldD: {} }
          }
        },
        error: {
          _base: {
            fieldE: { active: true, val: { x: {} } }
          }
        }
      } as any;

      component.activeTab = 'model';
      expect((component as any).fieldExists('en', 'fieldA')).toBe(true);

      component.activeTab = 'view';
      component.activeView = 'view1';
      component.viewActiveTab.view1 = 'layout';
      expect((component as any).fieldExists('en', 'fieldB')).toBe(true);
      component.viewActiveTab.view1 = 'actions';
      expect((component as any).fieldExists('en', 'fieldC')).toBe(true);
      component.viewActiveTab.view1 = 'routes';
      expect((component as any).fieldExists('en', 'fieldD')).toBe(true);

      component.activeTab = 'error';
      expect((component as any).fieldExists('en', 'fieldE')).toBe(true);
      expect((component as any).fieldExists('en', 'missing')).toBe(false);
    });

    it('should return error field names from template first, then from data', () => {
      (component as any)._modelTemplate = {
        modelFields: ['z', 'a'],
        views: [],
        errors: {}
      };
      expect(component.getErrorFieldNames('en')).toEqual(['a', 'z']);

      (component as any)._modelTemplate = null;
      component.data.en = {
        error: {
          _base: {
            x: { active: true, val: {} },
            y: { active: false, val: {} }
          }
        }
      } as any;
      expect(component.getErrorFieldNames('en')).toEqual(['x', 'y']);
    });
  });

  describe('Save Debug Reload And Background', () => {
    it('should validate and save all language exports', () => {
      component.data = {
        en: {
          export: () => ({ name: 'EN' })
        },
        fr: {
          export: () => ({ name: 'FR' })
        }
      } as any;
      mockJsonValidationService.validateBySchemaType.and.returnValue([] as any);

      component.saveAll();

      expect(mockJsonValidationService.validateBySchemaType).toHaveBeenCalled();
      expect(mockJsonValidationService.validateAndSave).toHaveBeenCalled();
    });

    it('should open debug export dialog', () => {
      component.lang = 'en';
      component.data.en = { export: () => ({ ok: true }) } as any;

      component.debugExport();

      expect(mockMatDialog.open).toHaveBeenCalled();
    });

    it('should reset template and reinitialize on reload', () => {
      spyOn(component, 'initTranslations');
      (component as any)._modelTemplate = { modelFields: [], views: [], errors: {} } as any;
      component.loading = false;

      component.reload();

      expect((component as any)._modelTemplate).toBeNull();
      expect(component.loading).toBe(true);
      expect(component.initTranslations).toHaveBeenCalled();
    });

    it('should preload background provider once and ignore repeated calls', async () => {
      const injectorGetSpy = spyOn((component as any).injector, 'get').and.callThrough();
      component['backgroundPreloadStarted'] = false;
      (component as any).provider = null;

      await (component as any).fetchBackgroundData();
      await (component as any).fetchBackgroundData();

      expect(component['backgroundPreloadStarted']).toBe(true);
      expect(injectorGetSpy).toHaveBeenCalledTimes(1);
    });
  });
});
