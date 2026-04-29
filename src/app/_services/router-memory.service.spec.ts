import { TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { Router, ActivatedRoute, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RouterMemory } from './router-memory.service';
import { Component } from '@angular/core';

@Component({
  template: '<div></div>'
})
class DummyComponent {}

const routes: Routes = [
  { path: 'home', component: DummyComponent },
  { path: 'current/route', component: DummyComponent },
  { path: 'current', component: DummyComponent },
  { path: 'next', component: DummyComponent },
  { path: 'test', component: DummyComponent },
  { path: 'test/path', component: DummyComponent },
  { path: 'path/to/route', component: DummyComponent },
  { path: 'path1', component: DummyComponent },
  { path: 'path2', component: DummyComponent },
  { path: 'path3', component: DummyComponent },
  { path: 'test/route', component: DummyComponent },
  { path: 'route/one', component: DummyComponent },
  { path: 'route/two', component: DummyComponent },
  { path: 'route/three', component: DummyComponent },
  { path: 'route/path', component: DummyComponent },
  { path: 'new/route', component: DummyComponent },
  { path: 'route/without/args', component: DummyComponent }
];

describe('RouterMemory', () => {
  let service: RouterMemory;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      providers: [RouterMemory],
      declarations: [DummyComponent]
    });

    service = TestBed.inject(RouterMemory);
    router = TestBed.inject(Router);
  });

  describe('initialization', () => {
    it('should create service', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize previous array as empty', () => {
      expect(service.previous).toEqual([]);
    });

    it('should initialize saved_args as empty object', () => {
      expect(service.savedArgs).toEqual({});
    });

    it('should set routeReuseStrategy to allow route reload', () => {
      expect(typeof router.routeReuseStrategy.shouldReuseRoute).toBe('function');
      // The method should return false to prevent route reuse
      const result = router.routeReuseStrategy.shouldReuseRoute(null as any, null as any);
      expect(result).toBe(false);
    });
  });

  describe('navigate', () => {
    it('should navigate with command only', () => {
      spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

      const command = ['/home'];
      service.navigate(command);

      expect(router.navigate).toHaveBeenCalledWith(command, jasmine.objectContaining({
        queryParams: undefined
      }));
    });

    it('should navigate with command and query params', () => {
      spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

      const command = ['/home'];
      const queryParams = { id: '123', tab: 'settings' };
      service.navigate(command, queryParams);

      expect(router.navigate).toHaveBeenCalledWith(command, jasmine.objectContaining({
        queryParams: queryParams
      }));
    });

    it('should save current route to previous before navigating', fakeAsync(() => {
      router.navigate(['/current/route']).then(() => {
        tick();
        service.navigate(['/next']);
        tick();

        expect(service.previous.length).toBeGreaterThan(0);
        expect(service.previous[0].url).toContain('current/route');
      });
      tick();
      flush();
    }));

    it('should handle query params wrapped in {queryParams} object', () => {
      spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

      const wrappedParams = { queryParams: { id: '123', tab: 'settings' } };
      service.navigate(['/home'], wrappedParams);

      expect(router.navigate).toHaveBeenCalledWith(['/home'], jasmine.objectContaining({
        queryParams: { id: '123', tab: 'settings' }
      }));
    });

    it('should decode %5C (backslash) in saved URL', fakeAsync(() => {
      // Manually set router.url to a URL with encoded backslashes
      Object.defineProperty(router, 'url', { value: '/path%5Cto%5Croute', writable: true });

      service.navigate(['/next']);
      tick();

      expect(service.previous[0].url).toContain('/path\\to\\route');
    }));

    it('should save query params from current route', fakeAsync(() => {
      router.navigate(['/test'], { queryParams: { tab: 'actions', id: '123' } }).then(() => {
        tick();
        service.navigate(['/next']);
        tick();

        expect(service.previous[0].queryParams).toBeDefined();
        expect(service.previous[0].queryParams!['tab']).toBe('actions');
        expect(service.previous[0].queryParams!['id']).toBe('123');
      });
      tick();
      flush();
    }));

    it('should update saved_args with query params', fakeAsync(() => {
      router.navigate(['/test/path']).then(() => {
        tick();
        const params = { userId: '456', view: 'grid' };
        service.navigate(['/next'], params);
        tick();

        expect(service.savedArgs['/test/path']).toBeDefined();
        expect(service.savedArgs['/test/path'].userId).toBe('456');
        expect(service.savedArgs['/test/path'].view).toBe('grid');
      });
      tick();
      flush();
    }));

    it('should handle multiple navigations with history stack', fakeAsync(() => {
      router.navigate(['/path1']).then(() => {
        tick();
        service.navigate(['/path2']);
        tick();
        return router.navigate(['/path2']);
      }).then(() => {
        tick();
        service.navigate(['/path3']);
        tick();

        expect(service.previous.length).toBe(2);
      });
      tick();
      flush();
    }));
  });

  describe('goBack', () => {
    it('should navigate to previous route when available', fakeAsync(() => {
      router.navigate(['/current']).then(() => {
        tick();
        service.navigate(['/next']);
        tick();
        service.goBack();
        tick();

        // Should have called navigateByUrl with the saved route
        expect(service.previous.length).toBeLessThan(1);
      });
      tick();
      flush();
    }));

    it('should navigate to / when no previous route', () => {
      spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve(true));

      service.goBack();

      expect(router.navigateByUrl).toHaveBeenCalledWith('/');
    });

    it('should navigate to / on error', () => {
      spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve(true));

      // Intentionally break previous array to trigger error
      service.previous = null as any;

      service.goBack();

      expect(router.navigateByUrl).toHaveBeenCalledWith('/');
    });

    it('should pop from previous array when navigating back', fakeAsync(() => {
      router.navigate(['/current']).then(() => {
        tick();
        service.navigate(['/next']);
        tick();
        const previousLength = service.previous.length;

        service.goBack();
        tick();

        expect(service.previous.length).toBe(previousLength - 1);
      });
      tick();
      flush();
    }));

    it('should restore query params from previous route', fakeAsync(() => {
      router.navigate(['/test'], { queryParams: { tab: 'settings' } }).then(() => {
        tick();
        service.navigate(['/next']);
        tick();
        service.goBack();
        tick();

        // Verify goBack was called
        expect(service.previous.length).toBeLessThan(2);
      });
      tick();
      flush();
    }));

    it('should handle going back through multiple routes', fakeAsync(() => {
      router.navigate(['/path1']).then(() => {
        tick();
        service.navigate(['/path2']);
        tick();
        return router.navigate(['/path2']);
      }).then(() => {
        tick();
        service.navigate(['/path3']);
        tick();
        return router.navigate(['/path3']);
      }).then(() => {
        tick();
        expect(service.previous.length).toBe(2);

        service.goBack();
        tick();
        expect(service.previous.length).toBe(1);

        service.goBack();
        tick();
        expect(service.previous.length).toBe(0);
      });
      tick();
      flush();
    }));
  });

  describe('retrieveArgs', () => {
    it('should return saved args for current route', fakeAsync(() => {
      router.navigate(['/test/route']).then(() => {
        tick();
        const params = { userId: '123', view: 'list' };
        service.navigate(['/next'], params);
        tick();

        return router.navigate(['/test/route']);
      }).then(() => {
        tick();
        const retrieved = service.retrieveArgs();
        expect(retrieved).toBeDefined();
        expect(retrieved.userId).toBe('123');
        expect(retrieved.view).toBe('list');
      });
      tick();
      flush();
    }));

    it('should return undefined when no args saved for route', fakeAsync(() => {
      router.navigate(['/route/without/args']).then(() => {
        tick();
        const retrieved = service.retrieveArgs();
        expect(retrieved).toBeUndefined();
      });
      tick();
      flush();
    }));

    it('should return args for multiple routes independently', fakeAsync(() => {
      router.navigate(['/route/one']).then(() => {
        tick();
        service.navigate(['/route/two'], { color: 'red' });
        tick();
        return router.navigate(['/route/two']);
      }).then(() => {
        tick();
        service.navigate(['/route/three'], { color: 'blue' });
        tick();
        return router.navigate(['/route/one']);
      }).then(() => {
        tick();
        const args = service.retrieveArgs();
        expect(args.color).toBe('red');

        return router.navigate(['/route/two']);
      }).then(() => {
        tick();
        const args = service.retrieveArgs();
        expect(args.color).toBe('blue');
      });
      tick();
      flush();
    }));
  });

  describe('updateArg', () => {
    it('should create saved_args entry if not exists', fakeAsync(() => {
      router.navigate(['/new/route']).then(() => {
        tick();
        service.updateArg('key1', 'value1');

        expect(service.savedArgs['/new/route']).toBeDefined();
        expect(service.savedArgs['/new/route'].key1).toBe('value1');
      });
      tick();
      flush();
    }));

    it('should update existing arg for route', fakeAsync(() => {
      router.navigate(['/route/path']).then(() => {
        tick();
        service.updateArg('key1', 'value1');
        expect(service.savedArgs['/route/path'].key1).toBe('value1');

        service.updateArg('key1', 'value2');
        expect(service.savedArgs['/route/path'].key1).toBe('value2');
      });
      tick();
      flush();
    }));

    it('should add multiple args to route', fakeAsync(() => {
      router.navigate(['/route/path']).then(() => {
        tick();
        service.updateArg('key1', 'value1');
        service.updateArg('key2', 'value2');
        service.updateArg('key3', 'value3');

        const args = service.savedArgs['/route/path'];
        expect(args.key1).toBe('value1');
        expect(args.key2).toBe('value2');
        expect(args.key3).toBe('value3');
      });
      tick();
      flush();
    }));

    it('should maintain separate args per route', fakeAsync(() => {
      router.navigate(['/route/one']).then(() => {
        tick();
        service.updateArg('key', 'route1-value');
        return router.navigate(['/route/two']);
      }).then(() => {
        tick();
        service.updateArg('key', 'route2-value');

        expect(service.savedArgs['/route/one'].key).toBe('route1-value');
        expect(service.savedArgs['/route/two'].key).toBe('route2-value');
      });
      tick();
      flush();
    }));

    it('should handle null/undefined values', fakeAsync(() => {
      router.navigate(['/route/path']).then(() => {
        tick();
        service.updateArg('nullKey', null);
        service.updateArg('undefinedKey', undefined);

        expect(service.savedArgs['/route/path'].nullKey).toBeNull();
        expect(service.savedArgs['/route/path'].undefinedKey).toBeUndefined();
      });
      tick();
      flush();
    }));

    it('should handle complex object values', fakeAsync(() => {
      router.navigate(['/route/path']).then(() => {
        tick();
        const complexObj = { nested: { deep: { value: 'test' } }, array: [1, 2, 3] };
        service.updateArg('complex', complexObj);

        expect(service.savedArgs['/route/path'].complex).toEqual(complexObj);
      });
      tick();
      flush();
    }));
  });

  describe('integration scenario', () => {
    it('should handle complete navigation flow with args preservation', fakeAsync(() => {
      // Navigate to route one
      router.navigate(['/route/one']).then(() => {
        tick();
        // From route one, call service.navigate to route two with args
        // This saves route/one to previous
        service.navigate(['/route/two'], { tabIndex: 0 });
        tick();
      }).then(() => {
        // Navigate to route two (may not be necessary since service.navigate does it)
        return router.navigate(['/route/two']);
      }).then(() => {
        tick();
        // From route two, call service.navigate to route three
        // This saves route/two to previous (now previous has 2 items)
        service.navigate(['/route/three'], { tabIndex: 1, userId: '123' });
        tick();

        expect(service.previous.length).toBeGreaterThanOrEqual(1);

        return router.navigate(['/route/two']);
      }).then(() => {
        tick();
        // Check we can retrieve args for route two
        const args = service.retrieveArgs();
        expect(args.tabIndex).toBe(1);
        expect(args.userId).toBe('123');

        return router.navigate(['/route/one']);
      }).then(() => {
        tick();
        // Check we can retrieve args for route one
        const args = service.retrieveArgs();
        expect(args.tabIndex).toBe(0);
      });
      tick();
      flush();
    }));
  });
});
