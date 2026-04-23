import { TestBed } from '@angular/core/testing';
import { fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { ApiService } from 'sb-shared-lib';

import { EqualComponentsProviderService } from './equal-components-provider.service';
import { EqualComponentDescriptor } from '../_models/equal-component-descriptor.class';
import { API_ENDPOINTS } from '../_models/api-endpoints';

describe('EqualComponentsProviderService', () => {
  let service: EqualComponentsProviderService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  /**
   * Default mock responses covering the minimal happy-path data set:
   *   - one package: 'core'
   *   - one class in core: 'Post'
   *   - no views, controllers, menus, or routes
   *
   * After full preloading the cache contains:
   *   cacheMap → { 'core' → { 'class' → [Post] } }
   */
  const defaultFetchResponse = (url: string): any => {
    if (url === API_ENDPOINTS.package.collect_all) {
      return ['core'];
    }
    if (url === API_ENDPOINTS.class.collect_all) {
      return { core: ['Post'] };
    }
    if (url.startsWith('?get=core_config_views&package=')) {
      return [];
    }
    if (url.startsWith('?get=core_config_controllers&package=')) {
      return { data: [], actions: [] };
    }
    if (url.startsWith('?get=core_config_menus&package=')) {
      return [];
    }
    if (url.startsWith('?get=core_config_routes&package=')) {
      return {};
    }
    if (url === API_ENDPOINTS.route.collect_all_live) {
      return {};
    }
    return [];
  };

  const descriptor = (
    packageName: string,
    name: string,
    type: string,
    file: string = '',
    item: any = {}
  ): EqualComponentDescriptor => new EqualComponentDescriptor(packageName, name, type, file, item);

  const seedCache = (cacheEntries: Record<string, Record<string, EqualComponentDescriptor[]>>): void => {
    const cacheMap = new Map<string, Map<string, EqualComponentDescriptor[]>>();

    Object.entries(cacheEntries).forEach(([packageName, types]) => {
      const packageMap = new Map<string, EqualComponentDescriptor[]>();
      Object.entries(types).forEach(([type, components]) => {
        packageMap.set(type, components);
      });
      cacheMap.set(packageName, packageMap);
    });

    (service as any).componentsCacheMapSubject.next(cacheMap);
  };

  beforeEach(() => {
    apiServiceSpy = jasmine.createSpyObj<ApiService>('ApiService', ['fetch']);
    apiServiceSpy.fetch.and.callFake((url: string) => Promise.resolve(defaultFetchResponse(url)) as any);

    TestBed.configureTestingModule({
      providers: [
        EqualComponentsProviderService,
        { provide: ApiService, useValue: apiServiceSpy }
      ]
    });
  });

  afterEach(() => {
    window.history.replaceState({}, '', '/');
    apiServiceSpy.fetch.calls.reset();
  });

  it('should be created', fakeAsync(() => {
    service = TestBed.inject(EqualComponentsProviderService);
    flushMicrotasks();
    expect(service).toBeTruthy();
  }));

  // Behavior after default initialization (mock produces core + Post class).
  // The inner beforeEach creates the service, flushes all promise-based
  // microtasks so the cache is fully populated, then resets the spy so each
  // test only sees the calls it triggers.
  describe('after default initialization', () => {
    beforeEach(fakeAsync(() => {
      service = TestBed.inject(EqualComponentsProviderService);
      flushMicrotasks();
      apiServiceSpy.fetch.calls.reset();
    }));

    describe('getComponents', () => {
      it('should return empty array for class type with a non-matching class_name filter', () => {
        // Class descriptors store item as '' so item.model is undefined;
        // filtering by class_name will always produce an empty result for classes.
        let result: EqualComponentDescriptor[] = [];
        service.getComponents('core', 'class', 'NonExistentClass').subscribe(c => result = c);

        expect(result).toEqual([]);
      });

      it('should call the view API when views are not yet cached', fakeAsync(() => {
        let result: EqualComponentDescriptor[] = [];
        service.getComponents('core', 'view').subscribe(c => result = c);
        flushMicrotasks();

        expect(apiServiceSpy.fetch).toHaveBeenCalledWith(API_ENDPOINTS.view.collect_from_package('core'));
        expect(result).toEqual([]);
      }));

      it('should call the controller API when neither do nor get type is cached', fakeAsync(() => {
        let result: EqualComponentDescriptor[] = [];
        service.getComponents('core', 'controller').subscribe(c => result = c);
        flushMicrotasks();

        expect(apiServiceSpy.fetch).toHaveBeenCalledWith(API_ENDPOINTS.controller.collect_from_package('core'));
        expect(result).toEqual([]);
      }));

      it('should call the menu API when menus are not yet cached', fakeAsync(() => {
        service.getComponents('core', 'menu').subscribe();
        flushMicrotasks();

        expect(apiServiceSpy.fetch).toHaveBeenCalledWith(API_ENDPOINTS.menu.collect_from_package('core'));
      }));

      it('should call the route API when routes are not yet cached', fakeAsync(() => {
        service.getComponents('core', 'route').subscribe();
        flushMicrotasks();

        expect(apiServiceSpy.fetch).toHaveBeenCalledWith(API_ENDPOINTS.route.collect_from_package('core'));
      }));

      it('should return empty array for an unknown package', fakeAsync(() => {
        let result: EqualComponentDescriptor[] = [];
        service.getComponents('unknown_package', 'class').subscribe(c => result = c);
        flushMicrotasks();

        expect(result).toEqual([]);
      }));
    });

    describe('getComponent', () => {
      it('should fall back to API and return null when component is not in cache', fakeAsync(() => {
        let result: EqualComponentDescriptor | null = undefined as any;
        service.getComponent('core', 'class', '', 'NonExistent').subscribe(c => result = c);
        flushMicrotasks();

        expect(result).toBeNull();
      }));

      it('should return null for a component in an unknown package', fakeAsync(() => {
        let result: EqualComponentDescriptor | null = undefined as any;
        service.getComponent('unknown_package', 'class', '', 'Post').subscribe(c => result = c);
        flushMicrotasks();

        expect(result).toBeNull();
      }));
    });

    describe('getComponentCountByType', () => {
      it('should return 0 for a package that does not exist', () => {
        let count = -1;
        service.getComponentCountByType('class', 'nonexistent').subscribe(n => count = n);

        expect(count).toBe(0);
      });

      it('should return 0 for controller type when none are cached', () => {
        let count = -1;
        service.getComponentCountByType('controller').subscribe(n => count = n);

        expect(count).toBe(0);
      });

      it('should return 0 for view type when none are cached', () => {
        let count = -1;
        service.getComponentCountByType('view').subscribe(n => count = n);

        expect(count).toBe(0);
      });
    });

    describe('cache hits', () => {
      beforeEach(() => {
        seedCache({
          core: {
            class: [descriptor('core', 'Post', 'class', 'core/classes/Post.class.php', '')],
            do: [descriptor('core', 'create', 'do', 'core/actions/create.php', { model: 'Post' })],
            get: [descriptor('core', 'read', 'get', 'core/data/read.php', { model: 'Post' })]
          }
        });
        apiServiceSpy.fetch.calls.reset();
      });

      it('should return a cached class component without calling the API', fakeAsync(() => {
        let result: EqualComponentDescriptor | null = null;

        service.getComponent('core', 'class', '', 'Post').subscribe(component => result = component);
        flushMicrotasks();

        expect(result).not.toBeNull();
        expect((result as unknown as EqualComponentDescriptor).name).toBe('Post');
        expect(apiServiceSpy.fetch).not.toHaveBeenCalled();
      }));

      it('should return cached class components from getComponents without calling the API', () => {
        let result: EqualComponentDescriptor[] = [];

        service.getComponents('core', 'class').subscribe(components => result = components);

        expect(result.length).toBe(1);
        expect(result[0].name).toBe('Post');
        expect(apiServiceSpy.fetch).not.toHaveBeenCalled();
      });

      it('should merge do and get controller components from cache without calling the API', () => {
        let result: EqualComponentDescriptor[] = [];

        service.getComponents('core', 'controller').subscribe(components => result = components);

        expect(result.map(component => component.name)).toEqual(['create', 'read']);
        expect(apiServiceSpy.fetch).not.toHaveBeenCalled();
      });

      it('should count cached controller components across do and get buckets', () => {
        let count = -1;

        service.getComponentCountByType('controller', 'core').subscribe(value => count = value);

        expect(count).toBe(2);
      });
    });

    describe('reloadComponents', () => {
      it('should always re-fetch the packages list', fakeAsync(() => {
        service.reloadComponents();
        flushMicrotasks();

        expect(apiServiceSpy.fetch).toHaveBeenCalledWith(API_ENDPOINTS.package.collect_all);
      }));

      it('should reload only the specified component type', fakeAsync(() => {
        service.reloadComponents('core', 'view');
        flushMicrotasks();

        expect(apiServiceSpy.fetch).toHaveBeenCalledWith(API_ENDPOINTS.view.collect_from_package('core'));
        expect(apiServiceSpy.fetch).not.toHaveBeenCalledWith(API_ENDPOINTS.class.collect_all);
        expect(apiServiceSpy.fetch).not.toHaveBeenCalledWith(API_ENDPOINTS.controller.collect_from_package('core'));
        expect(apiServiceSpy.fetch).not.toHaveBeenCalledWith(API_ENDPOINTS.menu.collect_from_package('core'));
        expect(apiServiceSpy.fetch).not.toHaveBeenCalledWith(API_ENDPOINTS.route.collect_from_package('core'));
      }));

      it('should reload all component types when no type is specified', fakeAsync(() => {
        service.reloadComponents('core');
        flushMicrotasks();

        expect(apiServiceSpy.fetch).toHaveBeenCalledWith(API_ENDPOINTS.controller.collect_from_package('core'));
        expect(apiServiceSpy.fetch).toHaveBeenCalledWith(API_ENDPOINTS.view.collect_from_package('core'));
        expect(apiServiceSpy.fetch).toHaveBeenCalledWith(API_ENDPOINTS.menu.collect_from_package('core'));
        expect(apiServiceSpy.fetch).toHaveBeenCalledWith(API_ENDPOINTS.route.collect_from_package('core'));
        expect(apiServiceSpy.fetch).toHaveBeenCalledWith(API_ENDPOINTS.class.collect_all);
      }));

      it('should warn and not crash when reloading a non-existent package', fakeAsync(() => {
        spyOn(console, 'warn');
        service.reloadComponents('nonexistent_package');
        flushMicrotasks();

        expect(console.warn).toHaveBeenCalled();
      }));
    });
  });

  describe('preloadComponents', () => {
    beforeEach(fakeAsync(() => {
      service = TestBed.inject(EqualComponentsProviderService);
      flushMicrotasks();
      apiServiceSpy.fetch.calls.reset();
    }));

    it('should preload view components first when URL targets a view under a package', fakeAsync(() => {
      window.history.replaceState({}, '', '/workbench/#/package/core/view/core\\Post:default');

      service.preloadComponents();
      flushMicrotasks();

      const calls = apiServiceSpy.fetch.calls.allArgs().map(args => args[0] as string);
      const viewUrl = API_ENDPOINTS.view.collect_from_package('core');
      const packagesUrl = API_ENDPOINTS.package.collect_all;

      expect(calls.length).toBeGreaterThan(0);
      expect(calls[0]).toBe(viewUrl);
      expect(calls.indexOf(packagesUrl)).toBeGreaterThan(0);
      expect(calls.filter(url => url === viewUrl).length).toBeGreaterThan(1);
    }));

    it('should preload class components first when URL targets a class under a package', fakeAsync(() => {
      window.history.replaceState({}, '', '/workbench/#/package/core/class/Post');

      service.preloadComponents();
      flushMicrotasks();

      const calls = apiServiceSpy.fetch.calls.allArgs().map(args => args[0] as string);
      const classUrl = API_ENDPOINTS.class.collect_all;
      const packagesUrl = API_ENDPOINTS.package.collect_all;

      expect(calls.length).toBeGreaterThan(0);
      expect(calls[0]).toBe(classUrl);
      expect(calls).toContain(packagesUrl);
      expect(calls.filter(url => url === classUrl).length).toBeGreaterThan(1);
    }));

    it('should preload controllers first when URL targets a controller under a package', fakeAsync(() => {
      window.history.replaceState({}, '', '/workbench/#/package/core/controller/create');

      service.preloadComponents();
      flushMicrotasks();

      const calls = apiServiceSpy.fetch.calls.allArgs().map(args => args[0] as string);
      const controllerUrl = API_ENDPOINTS.controller.collect_from_package('core');

      expect(calls.length).toBeGreaterThan(0);
      expect(calls[0]).toBe(controllerUrl);
      expect(calls).toContain(API_ENDPOINTS.package.collect_all);
    }));

    it('should preload menu components first when URL targets a menu under a package', fakeAsync(() => {
      window.history.replaceState({}, '', '/workbench/#/package/core/menu/main');

      service.preloadComponents();
      flushMicrotasks();

      const calls = apiServiceSpy.fetch.calls.allArgs().map(args => args[0] as string);
      const menuUrl = API_ENDPOINTS.menu.collect_from_package('core');

      expect(calls.length).toBeGreaterThan(0);
      expect(calls[0]).toBe(menuUrl);
      expect(calls).toContain(API_ENDPOINTS.package.collect_all);
    }));

    it('should still start with package loading when a class URL has no package context', fakeAsync(() => {
      window.history.replaceState({}, '', '/workbench/#/class/Post');

      service.preloadComponents();
      flushMicrotasks();

      const calls = apiServiceSpy.fetch.calls.allArgs().map(args => args[0] as string);

      expect(calls.length).toBeGreaterThan(0);
      expect(calls[0]).toBe(API_ENDPOINTS.package.collect_all);
      expect(calls).toContain(API_ENDPOINTS.class.collect_all);
    }));

    it('should preload route lives first when URL targets route without package context', fakeAsync(() => {
      window.history.replaceState({}, '', '/workbench/#/routes');

      service.preloadComponents();
      flushMicrotasks();

      const calls = apiServiceSpy.fetch.calls.allArgs().map(args => args[0] as string);

      expect(calls.length).toBeGreaterThan(0);
      expect(calls[0]).toBe(API_ENDPOINTS.route.collect_all_live);
      expect(calls).toContain(API_ENDPOINTS.package.collect_all);
    }));

    it('should start with package loading when URL has no component priority', fakeAsync(() => {
      window.history.replaceState({}, '', '/workbench/');

      service.preloadComponents();
      flushMicrotasks();

      const calls = apiServiceSpy.fetch.calls.allArgs().map(args => args[0] as string);

      expect(calls.length).toBeGreaterThan(0);
      expect(calls[0]).toBe(API_ENDPOINTS.package.collect_all);
    }));
  });
  
});
