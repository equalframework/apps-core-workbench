import { TestBed, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { QueryParamNavigatorService } from './query-param-navigator.service';
import { QueryParamActivatorRegistry, IQueryParamActivator } from './query-param-activator.registry';
import { of } from 'rxjs';

describe('QueryParamNavigatorService', () => {
  let service: QueryParamNavigatorService;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let mockActivatorRegistry: jasmine.SpyObj<QueryParamActivatorRegistry>;
  let mockActivator: jasmine.SpyObj<IQueryParamActivator>;

  function createVisibleElement(tagName: string): HTMLElement {
    const element = document.createElement(tagName);
    Object.defineProperty(element, 'offsetParent', {
      configurable: true,
      value: document.body
    });
    return element;
  }

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'parseUrl']);
    mockActivatedRoute = {
      queryParams: of({}),
      navigateByUrl: jasmine.createSpy('navigateByUrl')
    };

    mockActivator = jasmine.createSpyObj('Activator', ['canHandle', 'activate'], {
      type: 'tab',
      queryParamKeys: ['tab']
    });
    mockActivator.activate.and.returnValue(Promise.resolve());

    mockActivatorRegistry = jasmine.createSpyObj('QueryParamActivatorRegistry', ['findActivatorByKey', 'register', 'findActivator', 'getAll', 'count']);
    mockActivatorRegistry.findActivatorByKey.and.returnValue(undefined);

    TestBed.configureTestingModule({
      providers: [
        QueryParamNavigatorService,
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    });

    service = TestBed.inject(QueryParamNavigatorService);
  });

  describe('registerScrollTarget and unregisterScrollTarget', () => {
    it('should register and retrieve a scroll target', () => {
      const element = createVisibleElement('div');
      service.registerScrollTarget('target-1', element);

      const targets = service.getRegisteredTargets();
      expect(targets).toContain('target-1');
    });

    it('should unregister a scroll target', () => {
      const element = createVisibleElement('div');
      service.registerScrollTarget('target-1', element);
      service.unregisterScrollTarget('target-1');

      const targets = service.getRegisteredTargets();
      expect(targets).not.toContain('target-1');
    });

    it('should handle multiple scroll targets', () => {
      const element1 = createVisibleElement('div');
      const element2 = createVisibleElement('div');

      service.registerScrollTarget('target-1', element1);
      service.registerScrollTarget('target-2', element2);

      const targets = service.getRegisteredTargets();
      expect(targets.length).toBe(2);
      expect(targets).toContain('target-1');
      expect(targets).toContain('target-2');
    });
  });

  describe('registerFocusableField and unregisterFocusableField', () => {
    it('should register and retrieve a focusable field', () => {
      const element = createVisibleElement('input');
      service.registerFocusableField('field-1', element);
      const fields = service.getRegisteredFields();
      expect(fields).toContain('field-1');
    });

    it('should unregister a focusable field', () => {
      const element = createVisibleElement('input');
      service.registerFocusableField('field-1', element);
      service.unregisterFocusableField('field-1');
      const fields = service.getRegisteredFields();
      expect(fields).not.toContain('field-1');
    });
  });

  describe('handleQueryParams', () => {
    it('should navigate to the correct route with query params', async () => {
      const queryParams = { tab: 'details', field: '123' };
      const activator = jasmine.createSpyObj('Activator', ['canHandle', 'activate'], {
        type: 'tab',
        queryParamKeys: ['tab']
      });
      activator.canHandle.and.returnValue(true);
      activator.activate.and.returnValue(Promise.resolve());

      const fieldActivator = jasmine.createSpyObj('FieldActivator', ['canHandle', 'activate'], {
        type: 'field',
        queryParamKeys: ['field']
      });
      fieldActivator.canHandle.and.returnValue(true);
      fieldActivator.activate.and.returnValue(Promise.resolve());

      mockActivatorRegistry.findActivator.and.callFake((key: string) => {
        if (key === 'tab') {
          return activator;
        }

        if (key === 'field') {
          return fieldActivator;
        }

        return undefined;
      });

      spyOn<any>(service, 'navigateToField').and.resolveTo();

      const config = {
        activators: mockActivatorRegistry,
        context: {},
        delay: 0
      };

      await service.handleQueryParams(queryParams, config);
      expect(mockActivatorRegistry.findActivator).toHaveBeenCalledWith('tab', 'details');
      expect(mockActivatorRegistry.findActivator).toHaveBeenCalledWith('field', '123');
      expect(activator.activate).toHaveBeenCalledBefore(fieldActivator.activate);
      expect(service['navigateToField']).toHaveBeenCalledWith('details-123', config);
    });

    it('should skip final field navigation when the field activator consumes the param', async () => {
      const queryParams = { field: 'menu-item' };
      const fieldActivator = jasmine.createSpyObj('FieldActivator', ['canHandle', 'activate'], {
        type: 'field',
        queryParamKeys: ['field'],
        consumesFieldParam: true
      });
      fieldActivator.canHandle.and.returnValue(true);
      fieldActivator.activate.and.returnValue(Promise.resolve());

      mockActivatorRegistry.findActivator.and.callFake((key: string) => {
        if (key === 'field') {
          return fieldActivator;
        }

        return undefined;
      });

      spyOn<any>(service, 'navigateToField').and.resolveTo();

      await service.handleQueryParams(queryParams, {
        activators: mockActivatorRegistry,
        context: {},
        delay: 0
      });

      expect(fieldActivator.activate).toHaveBeenCalledWith('field', 'menu-item', {});
      expect(service['navigateToField']).not.toHaveBeenCalled();
    });
    
    it('should resolve when the element is registered after some delay', fakeAsync(() => {
      const element = createVisibleElement('div');
      let result: HTMLElement | undefined;

      setTimeout(() => {
        service.registerScrollTarget('delayed-target', element);
      }, 100);

      service['waitForElement']('delayed-target').then(resolved => {
        result = resolved;
      });

      tick(100);
      flushMicrotasks();

      expect(result).toBe(element);
    }));  
  });

  describe('extractFocusableInput', () => {
    it('should extract input element from a container', () => {
      const container = document.createElement('div');
      const input = document.createElement('input');
      container.appendChild(input);
      const result = service['extractFocusableInput'](container);
      expect(result).toBe(input);
    });

    it('should return the element itself if it is an input', () => {
      const input = document.createElement('input');
      const result = service['extractFocusableInput'](input);
      expect(result).toBe(input);
    });

    it('should return input[mat-input] if it\'s nested inside the container', () => {
      const container = document.createElement('div');
      const input = document.createElement('input');
      input.setAttribute('mat-input', '');
      container.appendChild(input);
      const result = service['extractFocusableInput'](container);
      expect(result).toBe(input);
    });

    it('should return input[mat-form-field input] if it\'s nested inside the container', () => {
      const container = document.createElement('div');
      const matFormField = document.createElement('div');
      matFormField.setAttribute('mat-form-field', '');
      const input = document.createElement('input');
      matFormField.appendChild(input);
      container.appendChild(matFormField);
      const result = service['extractFocusableInput'](container);
      expect(result).toBe(input);
    });


    it('should return the original element if no input is found', () => {
      const container = document.createElement('div');
      const result = service['extractFocusableInput'](container);
      expect(result).toBe(container);
    });
  });

  describe('activateHierarchy', () => {
    it('should activate elements in the correct order', async () => {
      const hierarchy = ['level-1', 'level-2', 'level-3'];
      const elements = hierarchy.map(levelId => {
        const el = createVisibleElement('div');
        service.registerScrollTarget(levelId, el);
        return el;
      });

      spyOn(service as any, 'waitForElement').and.callFake((levelId: string) => {
        const index = hierarchy.indexOf(levelId);
        return Promise.resolve(elements[index]);
      });

      await service['activateHierarchy'](hierarchy, { activators: mockActivatorRegistry, context: {} });
      expect(service['waitForElement']).toHaveBeenCalledWith('level-1');
      expect(service['waitForElement']).toHaveBeenCalledWith('level-2');
      expect(service['waitForElement']).toHaveBeenCalledWith('level-3');
    });
  });

  describe('navigateToField', () => {
    it('should focus the correct field', async () => {
      const fieldId = 'field-123';
      const input = createVisibleElement('input') as HTMLInputElement;
      service.registerFocusableField(fieldId, input);
      spyOn(input, 'focus').and.callThrough();

      await service['navigateToField'](fieldId, { delay: 0, activators: mockActivatorRegistry, context: {} });
      expect(input.focus).toHaveBeenCalled();
    });

    it('should handle cases with single level in hierarchy', async () => {
      const fieldId = '123';
      const input = createVisibleElement('input') as HTMLInputElement;
      service.registerFocusableField(fieldId, input);
      spyOn(input, 'focus').and.callThrough();
      await service['navigateToField'](fieldId, { delay: 0, activators: mockActivatorRegistry, context: {} });
      expect(input.focus).toHaveBeenCalled();
    });

    it('should handle case where field is not an input-like element', async () => {
      const fieldId = '123';
      const div = createVisibleElement('div');
      service.registerFocusableField(fieldId, div);
      spyOn(div, 'focus').and.callThrough();
      await service['navigateToField'](fieldId, { delay: 0, activators: mockActivatorRegistry, context: {} });
      expect(div.focus).toHaveBeenCalled();
    });
  });

  describe('createLink', () => {
    it('should create a link with correct query params', () => {
      const params = { tab: 'details', field: '123' };
      const link = service.createLink(params);
      expect(link).toContain('tab=details');
      expect(link).toContain('field=123');
    });
  });

  describe('navigateWithParams', () => {
    it('should navigate with merged query params', () => {
      const params = { tab: 'details' };
      service.navigateWithParams(params, 'merge');
      expect(mockRouter.navigate).toHaveBeenCalledWith([], {
        relativeTo: mockActivatedRoute,
        queryParams: params,
        queryParamsHandling: 'merge'
      });
    });
  });

  describe('updateParams', () => {
    it('should update query params', () => {
      const paramsToAdd = { tab: 'details' };
      service.updateParams(paramsToAdd);
      expect(mockRouter.navigate).toHaveBeenCalledWith([], {
        relativeTo: mockActivatedRoute,
        queryParams: paramsToAdd,
        queryParamsHandling: 'merge'
      });
    });
  });

  describe('clearParam', () => {
    it('should clear query params', () => {
      service.clearParam('field');
      expect(mockRouter.navigate).toHaveBeenCalledWith([], {
        relativeTo: mockActivatedRoute,
        queryParams: { field: null },
        queryParamsHandling: 'merge'
      });
    });
  });

  describe('clearScrollTarget', () => {
    it('should clear all scroll targets', () => {
      const element = createVisibleElement('div');
      service.registerScrollTarget('target-1', element);
      service.clearScrollTargets();
      const targets = service.getRegisteredTargets();
      expect(targets.length).toBe(0);
    });
  });

  describe('clearFocusableFields', () => {
    it('should clear all focusable fields', () => {
      const element = createVisibleElement('input');
      service.registerFocusableField('field-1', element);
      service.clearFocusableFields();
      const fields = service.getRegisteredFields();
      expect(fields.length).toBe(0);
    });
  });
});
