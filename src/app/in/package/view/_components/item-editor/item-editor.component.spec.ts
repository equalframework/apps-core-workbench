import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { ItemEditorComponent } from './item-editor.component';
import { SharedLibModule } from 'sb-shared-lib';
import { ViewItem } from '../../_objects/View';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { TranslateFakeLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { EqualComponentsProviderService } from 'src/app/in/_services/equal-components-provider.service';


describe('ItemEditorComponent', () => {
  let component: ItemEditorComponent;
  let fixture: ComponentFixture<ItemEditorComponent>;
  let mockWorkbenchService: jasmine.SpyObj<WorkbenchService>;
  let mockEqualComponentsProvider: jasmine.SpyObj<EqualComponentsProviderService>;

  beforeEach(async () => {
    mockWorkbenchService = jasmine.createSpyObj('WorkbenchService', ['getWidgetTypes']);
    mockWorkbenchService.getWidgetTypes.and.returnValue(of({
      char: ['type1', 'type2']
    }));

    mockEqualComponentsProvider = jasmine.createSpyObj('EqualComponentsProviderService', ['getComponents']);
    mockEqualComponentsProvider.getComponents.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports : [SharedLibModule, BrowserAnimationsModule],
      declarations: [ ItemEditorComponent ],
      providers : [
        TranslateFakeLoader,
        { provide: WorkbenchService, useValue: mockWorkbenchService },
        { provide: EqualComponentsProviderService, useValue: mockEqualComponentsProvider }
      ]
    })

    .compileComponents();
  });


  beforeEach(() => {
    fixture = TestBed.createComponent(ItemEditorComponent);
    component = fixture.componentInstance;
    component.item = new ViewItem();
    fixture.detectChanges();
  });

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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('widgetTypes', () => {
    it('should return a blank option for label items', () => {
      component.item.type = 'label';
      expect(component.widgetTypes).toEqual(['']);
    });

    it('should return widget types for a known field type', () => {
      component.item.type = 'field';
      component.item.value = 'name';
      component.scheme = {
        fields: {
          name: { type: 'char' }
        }
      };

      component['_widgetTypes'] = {
        char: ['type1', 'type2']
      };

      expect(component.widgetTypes).toEqual(['', 'type1', 'type2']);
    });

    it('should return a blank option for unknown field types', () => {
      component.item.type = 'field';
      component.item.value = 'name';
      component.scheme = {
        fields: {
          name: { type: 'unknown' }
        }
      };

      expect(component.widgetTypes).toEqual(['']);
    });

    it('should return a blank option if scheme or fields are missing', () => {
      component.item.type = 'field';
      component.item.value = 'name';
      component.scheme = {};
      expect(component.widgetTypes).toEqual(['']);
    });

     it('should return a blank option if field is missing in scheme', () => { 
      component.item.type = 'field';
      component.item.value = 'name';
      component.scheme = {
        fields: {
          other: { type: 'char' }
        }
      };
      expect(component.widgetTypes).toEqual(['']);
     });
  });

  describe('update_has_field', () => {
    it('should update has_view, has_domain, and has_header based on widgetForm properties', () => {
      component.item.viewType = 1;
      component.item.widgetForm._has_view = true;
      component.item.widgetForm._has_domain = false;
      component.item.widgetForm._has_header = true;
      spyOn(component, 'set_has_view');
      spyOn(component, 'set_has_domain');
      spyOn(component, 'set_has_header');
      component.update_has_field();
      expect(component.set_has_view).toHaveBeenCalledWith(true);
      expect(component.set_has_domain).toHaveBeenCalledWith(true);
      expect(component.set_has_header).toHaveBeenCalledWith(true);
    });
  });

  describe('set_has_view', () => {
    it('should set widgetForm._has_view based on event and _has_viewEnabled', () => {
      component.item.viewType = 0;
      component.item.widgetForm._has_view = true;
      spyOn(component, 'getListOptions4View');
      component.set_has_view(true);
      expect(component.item.widgetForm._has_view).toBeTrue();
    });

    it('should not set widgetForm._has_view if viewType is 1', () => {
      component.item.viewType = 1;
      component.set_has_view(true);
      expect(component.item.widgetForm._has_view).toBeFalse();
    });
  });

  describe('set_has_domain', () => {
    it('should set widgetForm._has_domain based on event and _has_viewEnabled', () => {
      component.item.viewType = 0;
      component.item.widgetForm._has_domain = true;
      component.set_has_domain(true);
      expect(component.item.widgetForm._has_domain).toBeTrue();
    });

    it('should not set widgetForm._has_domain if viewType is 1', () => {
      component.item.viewType = 1;
      component.set_has_domain(true);
      expect(component.item.widgetForm._has_domain).toBeFalse();
      });
  });

  describe('set_has_header', () => {
    it('should set widgetForm._has_header based on event and _has_viewEnabled', () => {
      component.item.viewType = 0;
      component.item.widgetForm._has_header = true;
      component.set_has_header(true);
      expect(component.item.widgetForm._has_header).toBeTrue();
    });

    it('should not set widgetForm._has_header if viewType is 1', () => {
      component.item.viewType = 1;
      component.set_has_header(true);
      expect(component.item.widgetForm._has_header).toBeFalse();
    });
  });

  describe('fieldType', () => {
    it('should return string for label items', () => {
      component.item.type = 'label';
      expect(component.fieldType).toBe('string');
    });

    it('should return the field type from the scheme for field items', () => {
      component.item.type = 'field';
      component.item.value = 'name';
      component.scheme = {
        fields: {
          name: { type: 'char' }
        }
      };
      expect(component.fieldType).toBe('char');
    });

    it('should return undefined if scheme or fields are missing', () => {
      component.item.type = 'field';
      component.item.value = 'name';
      component.scheme = {};
      expect(component.fieldType).toBe('string');
    });

    it('should return undefined if field is missing in scheme', () => {
      component.item.type = 'field';
      component.item.value = 'name';
      component.scheme = {
        fields: {
          other: { type: 'char' }
        }
      };
      expect(component.fieldType).toBe('string');
    });

    it('should return string or the result_type for computed fields', () => {
      component.item.type = 'field';
      component.item.value = 'computed_field';
      component.scheme = {
        fields: {
          computed_field: { type: 'computed', result_type: 'integer' }
        }
      };
      expect(component.fieldType).toBe('integer');
    });

    it('should return string for computed fields without result_type', () => {
    component.item.type = 'field';
    component.item.value = 'computed_field';
    component.scheme = {
      fields: {
        computed_field: { type: 'computed' }
      }
    };
    expect(component.fieldType).toBe('string');
    });

    it('should return string for items  without type field', () => {
    component.item.type = 'field';
    component.item.value = 'name';
    component.scheme = {
      fields: {
        name: { }
      }
    };
    expect(component.fieldType).toBe('string');
    });
  });

  describe('getListOptions4View', () => {
    it('should load list options from the provider when viewType is 1', fakeAsync(() => {
      component.item.viewType = 1;
      component.item.type = 'field';
      component.item.value = 'name';
      component.scheme = {
        fields: {
          name: { type: 'many2one', foreign_object: 'pkg\\model' }
        }
      };
      mockEqualComponentsProvider['getComponents'].and.returnValue(of([
        { name: 'Model:list.default' }
      ] as any));

      component.getListOptions4View();

      flushMicrotasks();
      expect(mockEqualComponentsProvider['getComponents']).toHaveBeenCalledWith('pkg', 'view', 'model');
      expect(component.cacheList).toEqual({
        foreign: 'pkg\\model',
        lists: { 'list.default': 'Model:list.default' }
      });
    }));

    it('should not call the provider if viewType is not 1', fakeAsync(() => {
    component.item.viewType = 0;
    mockEqualComponentsProvider['getComponents'] = jasmine.createSpy('getComponents');
    component.getListOptions4View();

    flushMicrotasks();
    expect(mockEqualComponentsProvider['getComponents']).not.toHaveBeenCalled();
    }));
  });
        

});
