import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuTradEditorComponent } from './menu-trad-editor.component';
import { ActivatedRoute } from '@angular/router';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { NotificationService } from 'src/app/in/_services/notification.service';
import { JsonValidationService } from 'src/app/in/_services/json-validation.service';
import { EqualComponentsProviderService } from 'src/app/in/_services/equal-components-provider.service';
import { MatDialog } from '@angular/material/dialog';
import { ChangeDetectorRef, Injector } from '@angular/core';
import { Location } from '@angular/common';
import { QueryParamActivatorRegistry } from 'src/app/_services/query-param-activator.registry';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QueryParamNavigatorService } from 'src/app/_services/query-param-navigator.service';
import { of, Subject } from 'rxjs';

describe('MenuTradEditorComponent', () => {
  let component: MenuTradEditorComponent;
  let fixture: ComponentFixture<MenuTradEditorComponent>;
  let mockWorkbenchService: jasmine.SpyObj<WorkbenchService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockJsonValidationService: jasmine.SpyObj<JsonValidationService>;
  let mockEqualComponentsProvider: jasmine.SpyObj<EqualComponentsProviderService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockLocation: jasmine.SpyObj<Location>;
  let mockQueryParamNavigator: jasmine.SpyObj<QueryParamNavigatorService>;
  let mockChangeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;
  let mockActivatedRoute: any;
  let mockInjector: jasmine.SpyObj<Injector>;
  let queryParamsSubject: Subject<any>;

  beforeEach(async () => {
    // Setup queryParams subject for ActivatedRoute
    queryParamsSubject = new Subject();

    // Setup ActivatedRoute mock with proper hierarchy
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.callFake((key: string) => {
            if (key === 'menu_name') return 'test-menu';
            return null;
          })
        }
      },
      parent: {
        snapshot: {
          paramMap: {
            get: jasmine.createSpy('get').and.callFake((key: string) => {
              if (key === 'package_name') return 'test-package';
              return null;
            })
          }
        }
      },
      queryParams: queryParamsSubject.asObservable()
    };

    // Create service spies with more complete method signatures
    mockWorkbenchService = jasmine.createSpyObj('WorkbenchService', [
      'readMenu',
      'getMenuTranslationsList',
      'getTranslationLanguagesByPackage',
      'collectAllLanguagesCode',
      'overwriteMenuTranslations'
    ]);

    mockNotificationService = jasmine.createSpyObj('NotificationService', ['showError', 'showSuccess']);
    mockJsonValidationService = jasmine.createSpyObj('JsonValidationService', [
      'validate',
      'validateBySchemaType',
      'validateAndSave'
    ]);
    mockEqualComponentsProvider = jasmine.createSpyObj('EqualComponentsProviderService', ['areEqual']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockLocation = jasmine.createSpyObj('Location', ['back']);
    mockQueryParamNavigator = jasmine.createSpyObj('QueryParamNavigatorService', ['handleQueryParams']);
    mockChangeDetectorRef = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges', 'markForCheck']);
    mockInjector = jasmine.createSpyObj('Injector', ['get']);

    // Setup default return values
    mockWorkbenchService.collectAllLanguagesCode.and.returnValue(
      of(['en', 'fr', 'de', 'es', 'it', 'pt', 'nl'])
    );
    mockWorkbenchService.readMenu.and.returnValue(of({}));
    mockWorkbenchService.getTranslationLanguagesByPackage.and.returnValue(of({}));
    mockWorkbenchService.getMenuTranslationsList.and.returnValue(of({}));
    mockQueryParamNavigator.handleQueryParams.and.returnValue(Promise.resolve());
    mockInjector.get.and.returnValue(mockEqualComponentsProvider);

    await TestBed.configureTestingModule({
      declarations: [MenuTradEditorComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: WorkbenchService, useValue: mockWorkbenchService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: JsonValidationService, useValue: mockJsonValidationService },
        { provide: EqualComponentsProviderService, useValue: mockEqualComponentsProvider },
        { provide: MatDialog, useValue: mockDialog },
        { provide: ChangeDetectorRef, useValue: mockChangeDetectorRef },
        { provide: Location, useValue: mockLocation },
        { provide: QueryParamNavigatorService, useValue: mockQueryParamNavigator },
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        { provide: Injector, useValue: mockInjector }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuTradEditorComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default property values', () => {
      expect(component.packageName).toBe('');
      expect(component.menuName).toBe('');
      expect(component.lang).toBe('');
      expect(component.error).toBeFalse();
      expect(component.loading).toBeTrue();
      expect(component.addingLanguage).toBeFalse();
      expect(component.activeTab).toBe('menu');
      expect(component.activeField).toBe('');
      expect(component.isSaving).toBeFalse();
    });

    it('should have correct TAB_NAMES', () => {
      expect(component.TAB_NAMES).toEqual(['menu']);
    });

    it('should load all languages on ngOnInit', async () => {
      await component.ngOnInit();
      expect(mockWorkbenchService.collectAllLanguagesCode).toHaveBeenCalled();
      expect(component.allLanguages).toEqual(['en', 'fr', 'de', 'es', 'it', 'pt', 'nl']);
    });

    it('should set error when package_name or menu_name is missing', async () => {
      mockActivatedRoute.parent.snapshot.paramMap.get = jasmine.createSpy('get').and.returnValue(null);
      await component.ngOnInit();
      expect(component.error).toBeTrue();
    });

    it('should extract package and menu names from route params', async () => {
      await component.ngOnInit();
      expect(component.packageName).toBe('test-package');
      expect(component.menuName).toBe('test-menu');
    });
  });

  describe('Language Management', () => {
    it('should handle language change', () => {
      const lang = 'fr';
      component.onLangChange(lang);
      expect(component.lang).toBe(lang);
      expect(component.activeField).toBe('');
    });

    it('should clear activeField when language changes', () => {
      component.activeField = 'some-field';
      component.onLangChange('fr');
      expect(component.activeField).toBe('');
    });

    it('should start adding language', () => {
      component.startAddingLanguage();
      expect(component.addingLanguage).toBeTrue();
    });

    it('should stop adding language', () => {
      component.stopAddingLanguage();
      expect(component.addingLanguage).toBeFalse();
    });

    it('should update available languages based on localSchema', () => {
      component.localSchema = {
        en: {} as any,
        fr: {} as any
      };
      component.updateAvailableLanguages();
      expect(component.availableLanguages).toContain('de');
      expect(component.availableLanguages).toContain('es');
      expect(component.availableLanguages).not.toContain('en');
      expect(component.availableLanguages).not.toContain('fr');
    });
  });

  describe('Tab Management', () => {
    it('should handle tab change', () => {
      component.onTabChange(0);
      expect(component.activeTab).toBe('menu');
      expect(component.activeField).toBe('');
    });

    it('should clear activeField when tab changes', () => {
      component.activeField = 'some-field';
      component.onTabChange(0);
      expect(component.activeField).toBe('');
    });

    it('should return correct selected tab index', () => {
      component.activeTab = 'menu';
      expect(component.selectedTabIndex).toBe(0);
    });

    it('should return 0 for selectedTabIndex if activeTab is not found', () => {
      component.activeTab = 'invalid-tab';
      expect(component.selectedTabIndex).toBe(0);
    });
  });

  describe('Navigation', () => {
    it('should call location.back on goBack', () => {
      component.goBack();
      expect(mockLocation.back).toHaveBeenCalled();
    });
  });

  describe('Item Checking', () => {
    beforeEach(() => {
      component.lang = 'en';
      component.checkedItems = { en: new Set<string>() };
    });

    it('should mark item as checked', () => {
      component['setItemChecked']('en', 'item1', true);
      expect(component.isItemChecked('item1')).toBeTrue();
    });

    it('should uncheck item', () => {
      component.checkedItems['en'].add('item1');
      component['setItemChecked']('en', 'item1', false);
      expect(component.isItemChecked('item1')).toBeFalse();
    });

    it('should return false for unchecked item', () => {
      expect(component.isItemChecked('nonexistent')).toBeFalse();
    });

    it('should return false if language not set', () => {
      component.lang = '';
      expect(component.isItemChecked('item1')).toBeFalse();
    });
  });

  describe('Menu Item Metadata', () => {
    it('should get menu item metadata by ID', () => {
      component['_menuMetadata'].set('item1', { id: 'item1', type: 'parent', icon: 'home' });
      const metadata = component.getMenuItemMetadata('item1');
      expect(metadata).toEqual({ id: 'item1', type: 'parent', icon: 'home' });
    });

    it('should return null for missing metadata', () => {
      const metadata = component.getMenuItemMetadata('nonexistent');
      expect(metadata).toBeNull();
    });

    it('should get item parent ID from hierarchy map', () => {
      component['_hierarchyMap'].set('child1', 'parent1');
      expect(component.getItemParentId('child1')).toBe('parent1');
    });

    it('should return null if item has no parent', () => {
      expect(component.getItemParentId('root-item')).toBeNull();
    });

    it('should get item children from children map', () => {
      component['_childrenMap'].set('parent1', ['child1', 'child2']);
      expect(component.getItemChildren('parent1')).toEqual(['child1', 'child2']);
    });

    it('should return empty array if item has no children', () => {
      expect(component.getItemChildren('leaf-item')).toEqual([]);
    });

    it('should calculate item depth correctly', () => {
      component['_hierarchyMap'].set('child1', 'parent1');
      component['_hierarchyMap'].set('parent1', null);
      expect(component.getItemDepth('child1')).toBe(1);
    });

    it('should return 0 depth for root item', () => {
      expect(component.getItemDepth('root')).toBe(0);
    });

    it('should check if item has children', () => {
      component['_childrenMap'].set('parent1', ['child1', 'child2']);
      expect(component.itemHasChildren('parent1')).toBeTrue();
      expect(component.itemHasChildren('leaf')).toBeFalse();
    });
  });

  describe('Translation Item Changes', () => {
    beforeEach(() => {
      component.lang = 'en';
      component.localSchema = {
        en: {
          view: {
            menu: {
              layout: {
                item1: { label: { value: '' } }
              }
            }
          }
        } as any
      };
      component.checkedItems = { en: new Set<string>() };
    });

    it('should update translation item on change', () => {
      component.onTranslationItemChange({
        key: 'item1',
        changes: { label: { value: 'New Label' } }
      });

      const layout = component.localSchema['en'].view['menu'].layout;
      expect(layout['item1'].label.value).toBe('New Label');
    });

    it('should mark item as checked when editing a field', () => {
      component.onTranslationItemChange({
        key: 'item1',
        changes: { label: { value: 'New Label' } }
      });

      expect(component.isItemChecked('item1')).toBeTrue();
    });

    it('should handle is_active field change', () => {
      component.onTranslationItemChange({
        key: 'item1',
        changes: { is_active: true }
      });

      expect(component.isItemChecked('item1')).toBeTrue();
    });

    it('should not throw when lang is not set', () => {
      component.lang = '';
      expect(() => {
        component.onTranslationItemChange({
          key: 'item1',
          changes: { label: { value: 'Test' } }
        });
      }).not.toThrow();
    });
  });

  describe('Data Export and Save', () => {
    beforeEach(() => {
      component.packageName = 'test-package';
      component.menuName = 'test-menu';
    });

    it('should open debug dialog with exported data', () => {
      component.localSchema = { en: {} as any };
      component.debugExport();
      expect(mockDialog.open).toHaveBeenCalled();
    });

    it('should call saveAll with correct parameters', () => {
      component.localSchema = { en: {} as any };
      component.saveAll();
      expect(mockJsonValidationService.validateAndSave).toHaveBeenCalled();
    });
  });

  describe('Utility Methods', () => {
    it('should return sorted object keys via obk', () => {
      const obj = { c: 1, a: 2, b: 3 };
      expect(component.obk(obj)).toEqual(['a', 'b', 'c']);
    });

    it('should reload component state', () => {
      component['_menuScheme'] = {} as any;
      component.loading = false;
      component.reload();
      expect(component.loading).toBeTrue();
      expect(component['_menuScheme']).toBeNull();
    });
  });

  describe('Validator', () => {
    it('should validate 2-letter language codes', () => {
      const control = { value: 'en' } as any;
      expect(MenuTradEditorComponent.langCaseValidator(control)).toBeNull();

      control.value = 'EN';
      expect(MenuTradEditorComponent.langCaseValidator(control)).toEqual({ case: true });

      control.value = 'e1';
      expect(MenuTradEditorComponent.langCaseValidator(control)).toEqual({ case: true });
    });

    it('should validate 5-letter locale codes (e.g., en_US)', () => {
      const control = { value: 'en_US' } as any;
      expect(MenuTradEditorComponent.langCaseValidator(control)).toBeNull();

      control.value = 'en_us';
      expect(MenuTradEditorComponent.langCaseValidator(control)).toEqual({ case: true });

      control.value = 'EN_US';
      expect(MenuTradEditorComponent.langCaseValidator(control)).toEqual({ case: true });
    });

    it('should reject invalid language code lengths', () => {
      const control = { value: 'e' } as any;
      expect(MenuTradEditorComponent.langCaseValidator(control)).toEqual({ case: true });

      control.value = 'english';
      expect(MenuTradEditorComponent.langCaseValidator(control)).toEqual({ case: true });
    });
  });
});
