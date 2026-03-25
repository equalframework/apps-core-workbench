import {
  QueryParamActivatorRegistry,
  QueryParamTabActivator,
  QueryParamViewActivator,
  QueryParamCustomActivator,
  QueryParamExpandableActivator,
  IQueryParamActivator
} from './query-param-activator.registry';

describe('QueryParamActivatorRegistry', () => {
  let registry: QueryParamActivatorRegistry;

  beforeEach(() => {
    registry = new QueryParamActivatorRegistry();
  });

  describe('register', () => {
    it('should register an activator', () => {
      const activator: IQueryParamActivator = {
        type: 'test',
        queryParamKeys: ['test'],
        canHandle: () => true,
        activate: async () => {}
      };

      registry.register(activator);
      const found = registry.findActivatorByKey('test');
      expect(found).toBe(activator);
    });

    it('should register activator with multiple keys', () => {
      const activator: IQueryParamActivator = {
        type: 'test',
        queryParamKeys: ['key1', 'key2', 'key3'],
        canHandle: () => true,
        activate: async () => {}
      };

      registry.register(activator);
      
      expect(registry.findActivatorByKey('key1')).toBe(activator);
      expect(registry.findActivatorByKey('key2')).toBe(activator);
      expect(registry.findActivatorByKey('key3')).toBe(activator);
    });

    it('should allow multiple activators', () => {
      const activator1: IQueryParamActivator = {
        type: 'type1',
        queryParamKeys: ['key1'],
        canHandle: () => true,
        activate: async () => {}
      };
      const activator2: IQueryParamActivator = {
        type: 'type2',
        queryParamKeys: ['key2'],
        canHandle: () => true,
        activate: async () => {}
      };

      registry.register(activator1);
      registry.register(activator2);
      
      expect(registry.count()).toBe(2);
      expect(registry.findActivatorByKey('key1')).toBe(activator1);
      expect(registry.findActivatorByKey('key2')).toBe(activator2);
    });
  });

  describe('findActivatorByKey', () => {
    it('should return undefined when no activator is registered', () => {
      const found = registry.findActivatorByKey('nonexistent');
      expect(found).toBeUndefined();
    });

    it('should return the registered activator', () => {
      const activator: IQueryParamActivator = {
        type: 'test',
        queryParamKeys: ['test'],
        canHandle: () => true,
        activate: async () => {}
      };

      registry.register(activator);
      const found = registry.findActivatorByKey('test');
      expect(found).toBe(activator);
    });
  });

  describe('findActivator', () => {
    it('should find activator that can handle the value', () => {
      const activator: IQueryParamActivator = {
        type: 'test',
        queryParamKeys: ['test'],
        canHandle: (key, value) => key === 'test' && value === 'valid',
        activate: async () => {}
      };

      registry.register(activator);
      const found = registry.findActivator('test', 'valid');
      expect(found).toBe(activator);
    });

    it('should return undefined if activator cannot handle value', () => {
      const activator: IQueryParamActivator = {
        type: 'test',
        queryParamKeys: ['test'],
        canHandle: (key, value) => key === 'test' && value === 'valid',
        activate: async () => {}
      };

      registry.register(activator);
      const found = registry.findActivator('test', 'invalid');
      expect(found).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return empty array when no activators', () => {
      const all = registry.getAll();
      expect(all).toEqual([]);
    });

    it('should return all unique activators by type', () => {
      const activator1: IQueryParamActivator = {
        type: 'type1',
        queryParamKeys: ['key1', 'key2'],
        canHandle: () => true,
        activate: async () => {}
      };
      const activator2: IQueryParamActivator = {
        type: 'type2',
        queryParamKeys: ['key3'],
        canHandle: () => true,
        activate: async () => {}
      };

      registry.register(activator1);
      registry.register(activator2);

      const all = registry.getAll();
      expect(all.length).toBe(2);
      expect(all).toContain(activator1);
      expect(all).toContain(activator2);
    });

    it('should avoid duplicates when same activator maps to multiple keys', () => {
      const activator: IQueryParamActivator = {
        type: 'test',
        queryParamKeys: ['key1', 'key2', 'key3'],
        canHandle: () => true,
        activate: async () => {}
      };

      registry.register(activator);

      const all = registry.getAll();
      expect(all.length).toBe(1);
      expect(all[0]).toBe(activator);
    });
  });

  describe('count', () => {
    it('should return 0 when no activators', () => {
      expect(registry.count()).toBe(0);
    });

    it('should return count of unique activators by type', () => {
      const activator1: IQueryParamActivator = {
        type: 'type1',
        queryParamKeys: ['key1', 'key2'],
        canHandle: () => true,
        activate: async () => {}
      };
      const activator2: IQueryParamActivator = {
        type: 'type2',
        queryParamKeys: ['key3'],
        canHandle: () => true,
        activate: async () => {}
      };

      registry.register(activator1);
      registry.register(activator2);

      expect(registry.count()).toBe(2);
    });
  });
});

describe('QueryParamTabActivator', () => {
  let activator: QueryParamTabActivator;
  const tabMap = { 'layout': 0, 'header': 1, 'actions': 2, 'routes': 3, 'advanced': 4 };

  beforeEach(() => {
    activator = new QueryParamTabActivator(tabMap);
  });

  describe('canHandle', () => {
    it('should return true for valid tab names', () => {
      expect(activator.canHandle('tab', 'layout')).toBe(true);
      expect(activator.canHandle('tab', 'actions')).toBe(true);
    });

    it('should return false for invalid tab names', () => {
      expect(activator.canHandle('tab', 'invalid')).toBe(false);
    });

    it('should return false for non-tab keys', () => {
      expect(activator.canHandle('other', 'layout')).toBe(false);
    });
  });

  describe('activate', () => {
    it('should set correct tab index', async () => {
      const context = { selectedTabIndex: 0 };
      
      await activator.activate('tab', 'actions', context);
      
      expect(context.selectedTabIndex).toBe(2);
    });

    it('should handle all tabs in map', async () => {
      const context = { selectedTabIndex: 0 };
      
      for (const [tabName, index] of Object.entries(tabMap)) {
        await activator.activate('tab', tabName, context);
        expect(context.selectedTabIndex).toBe(index);
      }
    });

    it('should not change context for invalid tab name', async () => {
      const context = { selectedTabIndex: 0 };
      
      await activator.activate('tab', 'invalid', context);
      
      expect(context.selectedTabIndex).toBe(0);
    });

    it('should use custom property name', async () => {
      const customActivator = new QueryParamTabActivator(tabMap, 'customTabProperty');
      const context = { customTabProperty: 0 };
      
      await customActivator.activate('tab', 'actions', context);
      
      expect(context.customTabProperty).toBe(2);
    });
  });

  describe('type and queryParamKeys', () => {
    it('should have correct type', () => {
      expect(activator.type).toBe('tab');
    });

    it('should have correct queryParamKeys', () => {
      expect(activator.queryParamKeys).toEqual(['tab']);
    });
  });
});

describe('QueryParamViewActivator', () => {
  describe('with static view options', () => {
    let activator: QueryParamViewActivator;

    beforeEach(() => {
      activator = new QueryParamViewActivator(['list', 'form', 'grid']);
    });

    describe('canHandle', () => {
      it('should return true for valid views', () => {
        expect(activator.canHandle('view', 'list')).toBe(true);
        expect(activator.canHandle('view', 'form')).toBe(true);
      });

      it('should return false for invalid views', () => {
        expect(activator.canHandle('view', 'invalid')).toBe(false);
      });

      it('should return false for non-view keys', () => {
        expect(activator.canHandle('other', 'list')).toBe(false);
      });

      it('should return false for null/undefined values', () => {
        expect(activator.canHandle('view', null)).toBe(false);
        expect(activator.canHandle('view', undefined)).toBe(false);
      });
    });

    describe('activate', () => {
      it('should set active view', async () => {
        const context = { activeView: 'list' };
        
        await activator.activate('view', 'form', context);
        
        expect(context.activeView).toBe('form');
      });

      it('should use custom property name', async () => {
        const customActivator = new QueryParamViewActivator(['list', 'form'], 'myActiveView');
        const context = { myActiveView: 'list' };
        
        await customActivator.activate('view', 'form', context);
        
        expect(context.myActiveView).toBe('form');
      });
    });

    describe('type and queryParamKeys', () => {
      it('should have correct type', () => {
        expect(activator.type).toBe('view');
      });

      it('should have correct queryParamKeys', () => {
        expect(activator.queryParamKeys).toEqual(['view']);
      });
    });
  });

  describe('with dynamic view options (function)', () => {
    let activator: QueryParamViewActivator;

    beforeEach(() => {
      activator = new QueryParamViewActivator(
        (context) => context.availableViews || ['list', 'form']
      );
    });

    it('should use dynamic view options', async () => {
      const context = { activeView: 'list', availableViews: ['custom1', 'custom2'] };
      
      await activator.activate('view', 'custom1', context);
      expect(context.activeView).toBe('custom1');
    });

    it('should fall back to default views when context lacks availableViews', async () => {
      const context = { activeView: 'list' };
      
      expect(activator.canHandle('view', 'list')).toBe(true);
      expect(activator.canHandle('view', 'form')).toBe(true);
      expect(activator.canHandle('view', 'grid')).toBe(false);
    });
  });
});

describe('QueryParamCustomActivator', () => {
  let activator: QueryParamCustomActivator;
  let activateCallback: jasmine.Spy;

  beforeEach(() => {
    activateCallback = jasmine.createSpy('activateCallback').and.returnValue(Promise.resolve());
    activator = new QueryParamCustomActivator('custom', ['key1', 'key2'], activateCallback);
  });

  describe('canHandle', () => {
    it('should return true for registered keys with valid values', () => {
      expect(activator.canHandle('key1', 'value')).toBe(true);
      expect(activator.canHandle('key2', 'value')).toBe(true);
    });

    it('should return false for unregistered keys', () => {
      expect(activator.canHandle('key3', 'value')).toBe(false);
    });

    it('should return false for null/undefined values', () => {
      expect(activator.canHandle('key1', null)).toBe(false);
      expect(activator.canHandle('key1', undefined)).toBe(false);
    });
  });

  describe('activate', () => {
    it('should call the callback with correct parameters', async () => {
      const context = {};
      
      await activator.activate('key1', 'testValue', context);
      
      expect(activateCallback).toHaveBeenCalledWith('key1', 'testValue', context);
    });

    it('should wait for callback to complete', async () => {
      let callbackCompleted = false;
      const customActivator = new QueryParamCustomActivator(
        'custom',
        ['key1'],
        async () => {
          await new Promise(resolve => setTimeout(resolve, 50));
          callbackCompleted = true;
        }
      );

      const promise = customActivator.activate('key1', 'value', {});
      expect(callbackCompleted).toBe(false);
      
      await promise;
      expect(callbackCompleted).toBe(true);
    });
  });

  describe('type and queryParamKeys', () => {
    it('should have specified type', () => {
      expect(activator.type).toBe('custom');
    });

    it('should have specified queryParamKeys', () => {
      expect(activator.queryParamKeys).toEqual(['key1', 'key2']);
    });
  });
});

describe('QueryParamExpandableActivator', () => {
  let activator: QueryParamExpandableActivator;
  let expandCallback: jasmine.Spy;

  beforeEach(() => {
    expandCallback = jasmine.createSpy('expandCallback').and.returnValue(Promise.resolve());
    activator = new QueryParamExpandableActivator(['section-', 'panel-'], expandCallback);
  });

  describe('canHandle', () => {
    it('should return true for values with registered prefixes', () => {
      expect(activator.canHandle('any-key', 'section-1')).toBe(true);
      expect(activator.canHandle('any-key', 'panel-2')).toBe(true);
    });

    it('should return false for values without registered prefixes', () => {
      expect(activator.canHandle('any-key', 'tab-1')).toBe(false);
    });

    it('should return false for null/undefined values', () => {
      expect(activator.canHandle('any-key', null)).toBe(false);
      expect(activator.canHandle('any-key', undefined)).toBe(false);
    });
  });

  describe('activate', () => {
    it('should call expand callback with element ID', async () => {
      await activator.activate('any-key', 'section-1', {});
      
      expect(expandCallback).toHaveBeenCalledWith('section-1');
    });

    it('should convert value to string', async () => {
      await activator.activate('any-key', 123, {});
      
      expect(expandCallback).toHaveBeenCalledWith('123');
    });

    it('should wait for callback before throwing', async () => {
      let callbackCompleted = false;
      const customActivator = new QueryParamExpandableActivator(
        ['section-', 'panel-'],
        async () => {
          await new Promise(resolve => setTimeout(resolve, 50));
          callbackCompleted = true;
        }
      );

      const promise = customActivator.activate('any-key', 'section-1', {});
      expect(callbackCompleted).toBe(false);
      
      await promise;
      expect(callbackCompleted).toBe(true);
    });
  });

  describe('type', () => {
    it('should have type "expandable"', () => {
      expect(activator.type).toBe('expandable');
    });
  });
});
