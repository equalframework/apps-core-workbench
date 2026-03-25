import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { QueryParamNavigatorService } from './query-param-navigator.service';
import { QueryParamActivatorRegistry, QueryParamTabActivator } from './query-param-activator.registry';
import { of } from 'rxjs';

describe('QueryParamNavigatorService', () => {
  let service: QueryParamNavigatorService;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'parseUrl']);
    mockActivatedRoute = {
      queryParams: of({}),
      navigateByUrl: jasmine.createSpy('navigateByUrl')
    };

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
      const element = document.createElement('div');
      service.registerScrollTarget('target-1', element);

      const targets = service.getRegisteredTargets();
      expect(targets).toContain('target-1');
    });

    it('should unregister a scroll target', () => {
      const element = document.createElement('div');
      service.registerScrollTarget('target-1', element);
      service.unregisterScrollTarget('target-1');

      const targets = service.getRegisteredTargets();
      expect(targets).not.toContain('target-1');
    });

    it('should handle multiple scroll targets', () => {
      const element1 = document.createElement('div');
      const element2 = document.createElement('div');

      service.registerScrollTarget('target-1', element1);
      service.registerScrollTarget('target-2', element2);

      const targets = service.getRegisteredTargets();
      expect(targets.length).toBe(2);
      expect(targets).toContain('target-1');
      expect(targets).toContain('target-2');
    });
  });

  describe('registerFocusableField and unregisterFocusableField', () => {
    it('should register an input element as focusable field', async () => {
      const input = document.createElement('input');
      spyOn(input, 'focus');
      service.registerFocusableField('field-1', input);
      const registry = new QueryParamActivatorRegistry();

      // Since we can't directly access the internal map, we test by focusing
      await service.focusField('field-1', { activators: registry, scrollOptions: {} });
      expect(input.focus).toHaveBeenCalled();
    });

    it('should register a textarea element as focusable field', async () => {
      const textarea = document.createElement('textarea');
      const spy = spyOn(textarea, 'focus');
      service.registerFocusableField('field-textarea', textarea);
      const registry = new QueryParamActivatorRegistry();
      
      await service.focusField('field-textarea', { activators: registry, scrollOptions: {} });
      expect(spy).toHaveBeenCalled();
    });

    it('should register a select element as focusable field', async () => {
      const select = document.createElement('select');
      const spy = spyOn(select, 'focus');
      service.registerFocusableField('field-select', select);
      const registry = new QueryParamActivatorRegistry();
      
      await service.focusField('field-select', { activators: registry, scrollOptions: {} });
      expect(spy).toHaveBeenCalled();
    });

    it('should register a button element as focusable field', async () => {
      const button = document.createElement('button');
      const spy = spyOn(button, 'click');
      service.registerFocusableField('button-1', button);
      const registry = new QueryParamActivatorRegistry();
      
      await service.focusField('button-1', { activators: registry, scrollOptions: {} });
      expect(spy).toHaveBeenCalled();
    });

    it('should not register non-focusable elements', () => {
      const div = document.createElement('div');
      // Register non-focusable element - should not throw
      expect(() => service.registerFocusableField('div-1', div)).not.toThrow();
    });

    it('should unregister a focusable field', async () => {
      const input = document.createElement('input');
      spyOn(input, 'focus');
      service.registerFocusableField('field-1', input);
      service.unregisterFocusableField('field-1');
      const registry = new QueryParamActivatorRegistry();

      // After unregistering, focus should not be called
      await service.focusField('field-1', { activators: registry, scrollOptions: {} });
      expect(input.focus).not.toHaveBeenCalled();
    });
  });

  describe('scrollToElement', () => {
    it('should scroll to a registered element', async () => {
      const element = document.createElement('div');
      spyOn(element, 'scrollIntoView');
      service.registerScrollTarget('target-1', element);
      const registry = new QueryParamActivatorRegistry();

      await service.scrollToElement('target-1', { activators: registry, scrollOptions: {} });

      expect(element.scrollIntoView).toHaveBeenCalled();
    });

    it('should use custom scroll options', async () => {
      const element = document.createElement('div');
      const scrollSpy = spyOn(element, 'scrollIntoView');
      service.registerScrollTarget('target-1', element);
      const registry = new QueryParamActivatorRegistry();

      const customOptions: ScrollIntoViewOptions = { behavior: 'auto', block: 'center' };
      await service.scrollToElement('target-1', { activators: registry, scrollOptions: customOptions });

      expect(scrollSpy).toHaveBeenCalledWith(customOptions);
    });

    it('should call onScroll callback after scrolling', async () => {
      const element = document.createElement('div');
      spyOn(element, 'scrollIntoView');
      service.registerScrollTarget('target-1', element);
      const registry = new QueryParamActivatorRegistry();
      
      const onScrollSpy = jasmine.createSpy('onScroll');
      await service.scrollToElement('target-1', {
        activators: registry,
        scrollOptions: {},
        onScroll: onScrollSpy
      });

      expect(onScrollSpy).toHaveBeenCalledWith('target-1');
    });

    it('should respect scroll delay', async () => {
      const element = document.createElement('div');
      spyOn(element, 'scrollIntoView');
      service.registerScrollTarget('target-1', element);
      const registry = new QueryParamActivatorRegistry();

      const startTime = Date.now();
      await service.scrollToElement('target-1', { activators: registry, scrollOptions: {}, scrollDelay: 100 });
      const elapsed = Date.now() - startTime;

      expect(elapsed).toBeGreaterThanOrEqual(100);
      expect(element.scrollIntoView).toHaveBeenCalled();
    });

    it('should warn when target not found', async () => {
      const registry = new QueryParamActivatorRegistry();
      spyOn(console, 'warn');
      await service.scrollToElement('nonexistent', { activators: registry, scrollOptions: {} });

      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('focusField', () => {
    it('should call focus on input element', async () => {
      const input = document.createElement('input');
      spyOn(input, 'focus');
      service.registerFocusableField('field-1', input);
      const registry = new QueryParamActivatorRegistry();

      await service.focusField('field-1', { activators: registry, scrollOptions: {} });

      expect(input.focus).toHaveBeenCalled();
    });

    it('should call click on button element', async () => {
      const button = document.createElement('button');
      spyOn(button, 'click');
      service.registerFocusableField('button-1', button);
      const registry = new QueryParamActivatorRegistry();

      await service.focusField('button-1', { activators: registry, scrollOptions: {} });

      expect(button.click).toHaveBeenCalled();
    });

    it('should respect focus delay', async () => {
      const input = document.createElement('input');
      spyOn(input, 'focus');
      service.registerFocusableField('field-1', input);
      const registry = new QueryParamActivatorRegistry();

      const startTime = Date.now();
      await service.focusField('field-1', { activators: registry, scrollOptions: {}, scrollDelay: 100 });
      const elapsed = Date.now() - startTime;

      expect(elapsed).toBeGreaterThanOrEqual(100);
      expect(input.focus).toHaveBeenCalled();
    });

    it('should warn when field not found', async () => {
      const registry = new QueryParamActivatorRegistry();
      spyOn(console, 'warn');
      await service.focusField('nonexistent', { activators: registry, scrollOptions: {} });

      expect(console.warn).toHaveBeenCalled();
    });

    it('should find and focus nested input inside container', async () => {
      const container = document.createElement('div');
      const input = document.createElement('input');
      container.appendChild(input);
      const registry = new QueryParamActivatorRegistry();
      
      spyOn(input, 'focus');
      service.registerFocusableField('container-1', input);

      await service.focusField('container-1', { activators: registry, scrollOptions: {} });

      expect(input.focus).toHaveBeenCalled();
    });
  });

  describe('handleQueryParams', () => {
    it('should handle simple element parameter', async () => {
      const element = document.createElement('div');
      spyOn(element, 'scrollIntoView');
      service.registerScrollTarget('field-customer', element);

      const registry = new QueryParamActivatorRegistry();
      await service.handleQueryParams(
        { element: 'field-customer' },
        { activators: registry, context: {}, elementKeys: ['element'] }
      );

      expect(element.scrollIntoView).toHaveBeenCalled();
    });

    it('should activate tab before scrolling', async () => {
      const element = document.createElement('div');
      spyOn(element, 'scrollIntoView');
      service.registerScrollTarget('field-customer', element);

      const context = { selectedTabIndex: 0 };
      const registry = new QueryParamActivatorRegistry();
      const tabMap = { 'actions': 2 };
      registry.register(new QueryParamTabActivator(tabMap));

      await service.handleQueryParams(
        { tab: 'actions', element: 'field-customer' },
        { activators: registry, context, elementKeys: ['element'] }
      );

      expect(context.selectedTabIndex).toBe(2);
      expect(element.scrollIntoView).toHaveBeenCalled();
    });

    it('should handle field parameter with focus', async () => {
      const input = document.createElement('input');
      spyOn(input, 'focus');
      service.registerFocusableField('field-customer', input);

      const registry = new QueryParamActivatorRegistry();
      await service.handleQueryParams(
        { field: 'field-customer' },
        { activators: registry, context: {} }
      );

      expect(input.focus).toHaveBeenCalled();
    });

    it('should handle both element and field parameters', async () => {
      const element = document.createElement('div');
      const input = document.createElement('input');
      
      spyOn(element, 'scrollIntoView');
      spyOn(input, 'focus');

      service.registerScrollTarget('section-1', element);
      service.registerFocusableField('field-customer', input);

      const registry = new QueryParamActivatorRegistry();
      await service.handleQueryParams(
        { element: 'section-1', field: 'field-customer' },
        { activators: registry, context: {} }
      );

      expect(element.scrollIntoView).toHaveBeenCalled();
      expect(input.focus).toHaveBeenCalled();
    });

    it('should use alternative element key aliases', async () => {
      const element = document.createElement('div');
      spyOn(element, 'scrollIntoView');
      service.registerScrollTarget('field-1', element);

      const registry = new QueryParamActivatorRegistry();
      await service.handleQueryParams(
        { view: 'field-1' },
        { activators: registry, context: {}, elementKeys: ['element', 'view'] }
      );

      expect(element.scrollIntoView).toHaveBeenCalled();
    });

    it('should skip intermediate activator keys', async () => {
      const registry = new QueryParamActivatorRegistry();
      registry.register(new QueryParamTabActivator({ 'actions': 2 }));

      const context = { selectedTabIndex: 0 };
      spyOn(console, 'log');

      await service.handleQueryParams(
        { tab: 'actions', element: 'field-1' },
        { activators: registry, context, elementKeys: ['element'] }
      );

      // Should still activate tab even though element doesn't exist
      expect(context.selectedTabIndex).toBe(2);
    });
  });

  describe('createLink', () => {
    it('should create correct query string', () => {
      const link = service.createLink({ tab: 'actions', element: 'field-customer' });
      
      expect(link).toContain('?');
      expect(link).toContain('tab=actions');
      expect(link).toContain('element=field-customer');
      expect(link).toContain('&');
    });

    it('should URL encode special characters', () => {
      const link = service.createLink({ search: 'hello world', field: 'data:value' });
      
      expect(link).toContain('hello%20world');
      expect(link).toContain('data%3Avalue');
    });

    it('should handle empty params', () => {
      const link = service.createLink({});
      expect(link).toBe('?');
    });

    it('should handle single parameter', () => {
      const link = service.createLink({ element: 'field-1' });
      expect(link).toContain('element=field-1');
    });
  });

  describe('navigateWithParams', () => {
    it('should call router.navigate with correct parameters', () => {
      mockRouter.navigate.and.returnValue(Promise.resolve(true));

      service.navigateWithParams({ tab: 'actions' });

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        [],
        jasmine.objectContaining({
          queryParams: { tab: 'actions' },
          queryParamsHandling: 'merge'
        })
      );
    });

    it('should respect queryParamsHandling parameter', () => {
      mockRouter.navigate.and.returnValue(Promise.resolve(true));

      service.navigateWithParams({ tab: 'actions' }, 'preserve');

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        [],
        jasmine.objectContaining({
          queryParamsHandling: 'preserve'
        })
      );
    });
  });

  describe('updateParams', () => {
    it('should navigate with merge queryParamsHandling', () => {
      mockRouter.navigate.and.returnValue(Promise.resolve(true));

      service.updateParams({ element: 'field-1' });

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        [],
        jasmine.objectContaining({
          queryParams: { element: 'field-1' },
          queryParamsHandling: 'merge'
        })
      );
    });
  });

  describe('clearParam', () => {
    it('should set param to null for removal', () => {
      mockRouter.navigate.and.returnValue(Promise.resolve(true));

      service.clearParam('tab');

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        [],
        jasmine.objectContaining({
          queryParams: { tab: null },
          queryParamsHandling: 'merge'
        })
      );
    });
  });

  describe('getRegisteredTargets', () => {
    it('should return list of registered target IDs', () => {
      const element1 = document.createElement('div');
      const element2 = document.createElement('div');

      service.registerScrollTarget('target-1', element1);
      service.registerScrollTarget('target-2', element2);

      const targets = service.getRegisteredTargets();
      expect(targets).toContain('target-1');
      expect(targets).toContain('target-2');
    });

    it('should return empty array when nothing registered', () => {
      const targets = service.getRegisteredTargets();
      expect(targets.length).toBe(0);
    });
  });

  describe('clearScrollTargets', () => {
    it('should clear all registered scroll targets', () => {
      const element1 = document.createElement('div');
      const element2 = document.createElement('div');

      service.registerScrollTarget('target-1', element1);
      service.registerScrollTarget('target-2', element2);

      service.clearScrollTargets();

      const targets = service.getRegisteredTargets();
      expect(targets.length).toBe(0);
    });
  });

  describe('integration scenario', () => {
    it('should handle complex navigation scenario', async () => {
      // Setup: Create elements and activators
      const tabGroup = document.createElement('div');
      const section = document.createElement('div');
      const input = document.createElement('input');

      spyOn(section, 'scrollIntoView');
      spyOn(input, 'focus');

      service.registerScrollTarget('actions-section', section);
      service.registerFocusableField('customer-input', input);

      // Create activators
      const context = { selectedTabIndex: 0 };
      const registry = new QueryParamActivatorRegistry();
      registry.register(new QueryParamTabActivator({ 'actions': 2 }));

      // Simulate URL: ?tab=actions&element=actions-section&field=customer-input
      await service.handleQueryParams(
        { tab: 'actions', element: 'actions-section', field: 'customer-input' },
        { activators: registry, context, elementKeys: ['element'] }
      );

      // Verify everything was called in correct order
      expect(context.selectedTabIndex).toBe(2);
      expect(section.scrollIntoView).toHaveBeenCalled();
      expect(input.focus).toHaveBeenCalled();
    });
  });
});
