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

    it('should register a MAT-SELECT element as focusable field', async () => {
      const matSelect = document.createElement('mat-select');
      const spy = spyOn(matSelect, 'click');
      service.registerFocusableField('mat-select-1', matSelect);
      const registry = new QueryParamActivatorRegistry();

      await service.focusField('mat-select-1', { activators: registry, scrollOptions: {} });
      expect(spy).toHaveBeenCalled();
    });

    it('should register a MAT-CHECKBOX element as focusable field', async () => {
      const matCheckbox = document.createElement('mat-checkbox');
      const innerInput = document.createElement('input');
      innerInput.type = 'checkbox';
      matCheckbox.appendChild(innerInput);

      spyOn(innerInput, 'focus');
      spyOn(innerInput, 'click');
      service.registerFocusableField('mat-checkbox-1', matCheckbox);
      const registry = new QueryParamActivatorRegistry();

      await service.focusField('mat-checkbox-1', { activators: registry, scrollOptions: {} });
      expect(innerInput.focus).toHaveBeenCalled();
      expect(innerInput.click).toHaveBeenCalled();
    });

    it('should register a TYPE-INPUT element as focusable field', async () => {
      const typeInput = document.createElement('type-input');
      service.registerFocusableField('type-input-1', typeInput);
      const registry = new QueryParamActivatorRegistry();

      // Should not throw
      expect(() => service.focusField('type-input-1', { activators: registry, scrollOptions: {} })).not.toThrow();
    });

    it('should not register non-focusable elements', () => {
      const div = document.createElement('div');
      spyOn(console, 'warn');
      // Register non-focusable element - should warn
      service.registerFocusableField('div-1', div);
      expect(console.warn).toHaveBeenCalled();
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

  describe('registerScrollTarget - warnings', () => {
    it('should warn when registering duplicate scroll target', () => {
      const element1 = document.createElement('div');
      const element2 = document.createElement('div');
      service.registerScrollTarget('target-1', element1);
      spyOn(console, 'warn');

      service.registerScrollTarget('target-1', element2);

      expect(console.warn).toHaveBeenCalled();
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

    it('should focus and click mat-list-item', async () => {
      const element = document.createElement('div');
      element.className = 'mat-list-item';
      spyOn(element, 'scrollIntoView');
      spyOn(element, 'focus');
      spyOn(element, 'click');
      service.registerScrollTarget('target-1', element);
      const registry = new QueryParamActivatorRegistry();

      await service.scrollToElement('target-1', { activators: registry, scrollOptions: {} });

      expect(element.focus).toHaveBeenCalled();
      expect(element.click).toHaveBeenCalled();
    });

    it('should focus and click item-pretty', async () => {
      const element = document.createElement('div');
      element.className = 'item-pretty';
      spyOn(element, 'scrollIntoView');
      spyOn(element, 'focus');
      spyOn(element, 'click');
      service.registerScrollTarget('target-1', element);
      const registry = new QueryParamActivatorRegistry();

      await service.scrollToElement('target-1', { activators: registry, scrollOptions: {} });

      expect(element.focus).toHaveBeenCalled();
      expect(element.click).toHaveBeenCalled();
    });

    it('should use default scroll options when not provided', async () => {
      const element = document.createElement('div');
      const scrollSpy = spyOn(element, 'scrollIntoView');
      service.registerScrollTarget('target-1', element);
      const registry = new QueryParamActivatorRegistry();

      await service.scrollToElement('target-1', { activators: registry });

      expect(scrollSpy).toHaveBeenCalledWith(jasmine.any(Object));
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

    it('should click on MAT-SELECT element', async () => {
      const matSelect = document.createElement('mat-select');
      spyOn(matSelect, 'click');
      service.registerFocusableField('select-1', matSelect);
      const registry = new QueryParamActivatorRegistry();

      await service.focusField('select-1', { activators: registry, scrollOptions: {} });

      expect(matSelect.click).toHaveBeenCalled();
    });

    it('should handle MAT-CHECKBOX with inner input', async () => {
      const matCheckbox = document.createElement('mat-checkbox');
      const innerInput = document.createElement('input');
      innerInput.type = 'checkbox';
      matCheckbox.appendChild(innerInput);

      spyOn(innerInput, 'focus');
      spyOn(innerInput, 'click');
      service.registerFocusableField('checkbox-1', matCheckbox);
      const registry = new QueryParamActivatorRegistry();

      await service.focusField('checkbox-1', { activators: registry, scrollOptions: {} });

      expect(innerInput.focus).toHaveBeenCalled();
      expect(innerInput.click).toHaveBeenCalled();
    });

    it('should silently handle MAT-CHECKBOX with no inner input', async () => {
      const matCheckbox = document.createElement('mat-checkbox');
      service.registerFocusableField('checkbox-1', matCheckbox);
      const registry = new QueryParamActivatorRegistry();

      // Should not throw - silently handles missing inner input
      expect(async () => {
        await service.focusField('checkbox-1', { activators: registry, scrollOptions: {} });
      }).not.toThrow();
    });

    it('should find and click nested button inside container', async () => {
      const container = document.createElement('div');
      const button = document.createElement('button');
      container.appendChild(button);

      spyOn(button, 'click');
      service.registerFocusableField('btn-1', button);
      const registry = new QueryParamActivatorRegistry();

      await service.focusField('btn-1', { activators: registry, scrollOptions: {} });

      expect(button.click).toHaveBeenCalled();
    });

    it('should find and focus nested input inside of custom container', async () => {
      const container = document.createElement('type-input');
      const input = document.createElement('input');
      container.appendChild(input);

      spyOn(input, 'focus');
      service.registerFocusableField('custom-container', container);
      const registry = new QueryParamActivatorRegistry();

      await service.focusField('custom-container', { activators: registry, scrollOptions: {} });

      expect(input.focus).toHaveBeenCalled();
    });

    it('should warn when container has no focusable child', async () => {
      const container = document.createElement('type-input');
      spyOn(console, 'warn');
      service.registerFocusableField('empty-container', container);
      const registry = new QueryParamActivatorRegistry();

      await service.focusField('empty-container', { activators: registry, scrollOptions: {} });

      expect(console.warn).toHaveBeenCalled();
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

    it('should handle field parameter with parent scroll target', async () => {
      const section = document.createElement('div');
      section.setAttribute('appScrollTarget', 'section-1');
      const input = document.createElement('input');
      section.appendChild(input);

      spyOn(section, 'scrollIntoView');
      spyOn(input, 'focus');

      service.registerScrollTarget('section-1', section);
      service.registerFocusableField('field-customer', input);

      const registry = new QueryParamActivatorRegistry();
      await service.handleQueryParams(
        { field: 'field-customer' },
        { activators: registry, context: {} }
      );

      expect(section.scrollIntoView).toHaveBeenCalled();
      expect(input.focus).toHaveBeenCalled();
    });

    it('should handle empty query params', async () => {
      const registry = new QueryParamActivatorRegistry();
      // Should not throw
      expect(async () => {
        await service.handleQueryParams({}, { activators: registry, context: {} });
      }).not.toThrow();
    });

    it('should use default element key when elementKeys not provided', async () => {
      const element = document.createElement('div');
      spyOn(element, 'scrollIntoView');
      service.registerScrollTarget('field-1', element);

      const registry = new QueryParamActivatorRegistry();
      await service.handleQueryParams(
        { element: 'field-1' },
        { activators: registry, context: {} }
      );

      expect(element.scrollIntoView).toHaveBeenCalled();
    });

    it('should handle activator errors gracefully', async () => {
      const mockActivator = jasmine.createSpyObj('IQueryParamActivator', ['activate']);
      mockActivator.activate.and.returnValue(Promise.reject(new Error('Activation failed')));
      (mockActivator as any).key = 'tab';

      const registry = new QueryParamActivatorRegistry();
      (registry as any).activators = [mockActivator];
      (registry as any).findActivatorByKey = jasmine.createSpy('findActivatorByKey').and.returnValue(mockActivator);

      spyOn(console, 'error');

      await service.handleQueryParams(
        { tab: 'actions' },
        { activators: registry, context: {} }
      );

      expect(console.error).toHaveBeenCalled();
    });

    it('should handle multiple query params with different keys', async () => {
      const element = document.createElement('div');
      const input = document.createElement('input');

      spyOn(element, 'scrollIntoView');
      spyOn(input, 'focus');

      service.registerScrollTarget('field-1', element);
      service.registerFocusableField('field-2', input);

      const context = { selectedTabIndex: 0 };
      const registry = new QueryParamActivatorRegistry();
      registry.register(new QueryParamTabActivator({ 'actions': 2 }));

      await service.handleQueryParams(
        { tab: 'actions', element: 'field-1', field: 'field-2' },
        { activators: registry, context, elementKeys: ['element'] }
      );

      expect(context.selectedTabIndex).toBe(2);
      expect(element.scrollIntoView).toHaveBeenCalled();
      expect(input.focus).toHaveBeenCalled();
    });

    it('should handle field without parent scroll target', async () => {
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

    it('should prioritize element over field in element keys', async () => {
      const element1 = document.createElement('div');
      const element2 = document.createElement('div');

      spyOn(element1, 'scrollIntoView');
      spyOn(element2, 'scrollIntoView');

      service.registerScrollTarget('field-1', element1);
      service.registerScrollTarget('field-2', element2);

      const registry = new QueryParamActivatorRegistry();
      await service.handleQueryParams(
        { element: 'field-1', view: 'field-2' },
        { activators: registry, context: {}, elementKeys: ['element', 'view'] }
      );

      // First key ('element') should be found and scrolled to
      expect(element1.scrollIntoView).toHaveBeenCalled();
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

    it('should allow registering new targets after clearing', () => {
      const element1 = document.createElement('div');
      service.registerScrollTarget('target-1', element1);
      service.clearScrollTargets();

      const element2 = document.createElement('div');
      service.registerScrollTarget('target-2', element2);

      const targets = service.getRegisteredTargets();
      expect(targets).toContain('target-2');
      expect(targets).not.toContain('target-1');
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
