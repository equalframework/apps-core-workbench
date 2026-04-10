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

  // Preload priority – the constructor inspects the current URL and fetches the
  // matching component type BEFORE fetching packages.
  describe('preload priority', () => {
    function getCallOrder(urls: string[]): number[] {
      const calls = apiServiceSpy.fetch.calls.allArgs().map(args => args[0] as string);
      return urls.map(u => calls.indexOf(u));
    }

    it('should preload class components before packages when URL targets a model', fakeAsync(() => {
      window.history.replaceState({}, '', '/#/package/core/model/Post');
      service = TestBed.inject(EqualComponentsProviderService);
      flushMicrotasks();

      const [classIdx, packageIdx] = getCallOrder([
        API_ENDPOINTS.class.collect_all,
        API_ENDPOINTS.package.collect_all
      ]);

      expect(classIdx).toBeGreaterThanOrEqual(0);
      expect(packageIdx).toBeGreaterThanOrEqual(0);
      expect(classIdx).toBeLessThan(packageIdx);
    }));

    it('should preload view components before packages when URL targets a view', fakeAsync(() => {
      window.history.replaceState({}, '', '/#/package/core/view/Post/list');
      service = TestBed.inject(EqualComponentsProviderService);
      flushMicrotasks();

      const [viewIdx, packageIdx] = getCallOrder([
        API_ENDPOINTS.view.collect_from_package('core'),
        API_ENDPOINTS.package.collect_all
      ]);

      expect(viewIdx).toBeGreaterThanOrEqual(0);
      expect(packageIdx).toBeGreaterThanOrEqual(0);
      expect(viewIdx).toBeLessThan(packageIdx);
    }));

    it('should preload controller components before packages when URL targets a controller', fakeAsync(() => {
      window.history.replaceState({}, '', '/#/package/core/controller/get/GetUser');
      service = TestBed.inject(EqualComponentsProviderService);
      flushMicrotasks();

      const [controllerIdx, packageIdx] = getCallOrder([
        API_ENDPOINTS.controller.collect_from_package('core'),
        API_ENDPOINTS.package.collect_all
      ]);

      expect(controllerIdx).toBeGreaterThanOrEqual(0);
      expect(packageIdx).toBeGreaterThanOrEqual(0);
      expect(controllerIdx).toBeLessThan(packageIdx);
    }));

    it('should preload menu components before packages when URL targets a menu', fakeAsync(() => {
      window.history.replaceState({}, '', '/#/package/core/menu/left');
      service = TestBed.inject(EqualComponentsProviderService);
      flushMicrotasks();

      const [menuIdx, packageIdx] = getCallOrder([
        API_ENDPOINTS.menu.collect_from_package('core'),
        API_ENDPOINTS.package.collect_all
      ]);

      expect(menuIdx).toBeGreaterThanOrEqual(0);
      expect(packageIdx).toBeGreaterThanOrEqual(0);
      expect(menuIdx).toBeLessThan(packageIdx);
    }));

    it('should preload route components before packages when URL targets a route', fakeAsync(() => {
      window.history.replaceState({}, '', '/#/package/core/route/test');
      service = TestBed.inject(EqualComponentsProviderService);
      flushMicrotasks();

      const [routeIdx, packageIdx] = getCallOrder([
        API_ENDPOINTS.route.collect_from_package('core'),
        API_ENDPOINTS.package.collect_all
      ]);

      expect(routeIdx).toBeGreaterThanOrEqual(0);
      expect(packageIdx).toBeGreaterThanOrEqual(0);
      expect(routeIdx).toBeLessThan(packageIdx);
    }));

    it('should fetch packages before any component type when URL has no known context', fakeAsync(() => {
      window.history.replaceState({}, '', '/');
      service = TestBed.inject(EqualComponentsProviderService);
      flushMicrotasks();

      const [packageIdx, classIdx] = getCallOrder([
        API_ENDPOINTS.package.collect_all,
        API_ENDPOINTS.class.collect_all
      ]);

      expect(packageIdx).toBeGreaterThanOrEqual(0);
      expect(classIdx).toBeGreaterThanOrEqual(0);
      expect(packageIdx).toBeLessThan(classIdx);
    }));
  });

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

    describe('equalComponents$', () => {
      it('should emit a package entry for each loaded package', () => {
        let components: EqualComponentDescriptor[] = [];
        service.equalComponents$.subscribe(c => components = c);

        const packageEntry = components.find(c => c.type === 'package' && c.name === 'core');
        expect(packageEntry).toBeTruthy();
      });

      it('should emit a class entry for each loaded class', () => {
        let components: EqualComponentDescriptor[] = [];
        service.equalComponents$.subscribe(c => components = c);

        const classEntry = components.find(c => c.type === 'class' && c.name === 'Post');
        expect(classEntry).toBeTruthy();
        expect(classEntry!.package_name).toBe('core');
      });
    });

    describe('getPackages', () => {
      it('should return an array of loaded package names', () => {
        let packages: string[] = [];
        service.getPackages().subscribe(p => packages = p);

        expect(packages).toContain('core');
      });
    });

    describe('getComponents', () => {
      it('should return class components from cache without an API call', () => {
        let result: EqualComponentDescriptor[] = [];
        service.getComponents('core', 'class').subscribe(c => result = c);

        expect(result.length).toBe(1);
        expect(result[0].name).toBe('Post');
        expect(result[0].type).toBe('class');
        expect(result[0].package_name).toBe('core');
        expect(apiServiceSpy.fetch).not.toHaveBeenCalled();
      });

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
      it('should return a matching component from cache synchronously', () => {
        let result: EqualComponentDescriptor | null = null;
        service.getComponent('core', 'class', '', 'Post').subscribe(c => result = c);

        expect(result).toBeTruthy();
        expect(result!.name).toBe('Post');
        expect(result!.type).toBe('class');
        expect(apiServiceSpy.fetch).not.toHaveBeenCalled();
      });

      it('should search across all cached types when component_type is empty string', () => {
        let result: EqualComponentDescriptor | null = null;
        service.getComponent('core', '', '', 'Post').subscribe(c => result = c);

        expect(result).toBeTruthy();
        expect(result!.name).toBe('Post');
      });

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
      it('should return the number of packages', () => {
        let count = -1;
        service.getComponentCountByType('package').subscribe(n => count = n);

        expect(count).toBe(1);
      });

      it('should count all class components across all packages', () => {
        let count = -1;
        service.getComponentCountByType('class').subscribe(n => count = n);

        expect(count).toBe(1);
      });

      it('should count class components in a specific package', () => {
        let count = -1;
        service.getComponentCountByType('class', 'core').subscribe(n => count = n);

        expect(count).toBe(1);
      });

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
});
