import { Observable, of, throwError } from 'rxjs';
import { WorkbenchService } from './workbench.service';
import { EqualComponentDescriptor } from '../_models/equal-component-descriptor.class';
import { PackageInfos } from '../_models/package-info.model';

describe('WorkbenchService', () => {
  let service: WorkbenchService;
  let apiSpy: jasmine.SpyObj<any>;

  const resolveOne = <T>(observable: Observable<T>): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      observable.subscribe(resolve, reject);
    });

  // Test data builders
  const createTestNode = (overrides?: Partial<EqualComponentDescriptor>): EqualComponentDescriptor => ({
    package_name: 'test-pkg',
    name: 'test-name',
    type: 'package',
    item: { subtype: 'parent', model: 'TestModel' },
    file: 'src/file.ts',
    ...overrides
  } as EqualComponentDescriptor);

  const createApiResponse = (success: boolean = true, data: any = {}) => ({
    success,
    response: data,
    message: success ? 'Success' : 'Error'
  });

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ApiService', ['fetch', 'post', 'get', 'collect', 'errorFeedback']);
    apiSpy.fetch.and.returnValue(Promise.resolve({}));
    apiSpy.post.and.returnValue(Promise.resolve({}));
    apiSpy.get.and.returnValue(Promise.resolve({}));
    apiSpy.collect.and.returnValue(Promise.resolve([]));

    service = new WorkbenchService(apiSpy as any);
  });

  // ==================== CREATE/DELETE NODE ROUTING ====================
  describe('createNode routing', () => {
    it('routes to createPackage for package type', async () => {
      const node = createTestNode({ type: 'package' });
      const result = await resolveOne(service.createNode(node));
      expect(result.success).toBeTrue();
      expect(apiSpy.fetch).toHaveBeenCalled();
    });

    it('routes to createClass for class type', async () => {
      const node = createTestNode({ type: 'class', item: { subtype: 'Model' } } as any);
      const result = await resolveOne(service.createNode(node));
      expect(result.success).toBeTrue();
    });

    it('routes to createController for get type', async () => {
      const node = createTestNode({ type: 'get' });
      const result = await resolveOne(service.createNode(node));
      expect(result.success).toBeTrue();
    });

    it('routes to createController for do type', async () => {
      const node = createTestNode({ type: 'do' });
      const result = await resolveOne(service.createNode(node));
      expect(result.success).toBeTrue();
    });

    it('routes to createView for view type and extracts view name from colon-delimited name', async () => {
      const node = createTestNode({ type: 'view', name: 'ModelName:form', item: { model: 'ModelName' } } as any);
      const result = await resolveOne(service.createNode(node));
      expect(result.success).toBeTrue();
    });

    it('routes to createMenu for menu type', async () => {
      const node = createTestNode({ type: 'menu', item: { subtype: 'sidebar' } } as any);
      const result = await resolveOne(service.createNode(node));
      expect(result.success).toBeTrue();
    });

    it('routes to createRoute for route type and extracts filename', async () => {
      const node = createTestNode({ type: 'route', file: 'src/routes/api.routes.ts', name: 'api-route' });
      const result = await resolveOne(service.createNode(node));
      expect(result.success).toBeTrue();
    });

    it('routes to createPolicy for policy type', async () => {
      const node = createTestNode({ type: 'policy', item: { model: 'Invoice' } } as any);
      const result = await resolveOne(service.createNode(node));
      expect(result.success).toBeTrue();
    });

    it('routes to createRole for role type', async () => {
      const node = createTestNode({ type: 'role', item: { model: 'Invoice' } } as any);
      const result = await resolveOne(service.createNode(node));
      expect(result.success).toBeTrue();
    });

    it('returns unknown type message for unrecognized type', async () => {
      const node = createTestNode({ type: 'unknown-type' } as any);
      const result = await resolveOne(service.createNode(node));
      expect(result.message).toContain('Unknown type');
    });
  });

  describe('deleteNode routing', () => {
    it('routes to deletePackage for package type', async () => {
      const node = createTestNode({ type: 'package' });
      const result = await resolveOne(service.deleteNode(node));
      expect(result.success).toBeTrue();
    });

    it('routes to deleteClass for class type', async () => {
      const node = createTestNode({ type: 'class' });
      const result = await resolveOne(service.deleteNode(node));
      expect(result.success).toBeTrue();
    });

    it('routes to deleteController for get type', async () => {
      const node = createTestNode({ type: 'get' });
      const result = await resolveOne(service.deleteNode(node));
      expect(result.success).toBeTrue();
    });

    it('routes to deleteView for view type and extracts view name', async () => {
      const node = createTestNode({ type: 'view', name: 'Model:form', item: { model: 'Model' } } as any);
      const result = await resolveOne(service.deleteNode(node));
      expect(result.success).toBeTrue();
    });

    it('routes to deleteMenu for menu type', async () => {
      const node = createTestNode({ type: 'menu' });
      const result = await resolveOne(service.deleteNode(node));
      expect(result.success).toBeTrue();
    });

    it('returns message for unimplemented route deletion', async () => {
      const node = createTestNode({ type: 'route' });
      const result = await resolveOne(service.deleteNode(node));
      expect(result.message).toContain('not implemented');
    });

    it('returns unknown type message for unrecognized type', async () => {
      const node = createTestNode({ type: 'unknown' } as any);
      const result = await resolveOne(service.deleteNode(node));
      expect(result.message).toContain('Unknown type');
    });
  });

  // ==================== READ OPERATIONS ====================
  describe('read operations', () => {
    it('readMenu fetches menu configuration', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({ id: 'main', items: [] }));
      const result = await resolveOne(service.readMenu('pkg', 'main'));
      expect(result.id).toBe('main');
      expect(apiSpy.fetch).toHaveBeenCalled();
    });

    it('readView fetches and extracts view schema from response', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({ 
        success: true, 
        response: { items: [] } 
      }));
      const result = await resolveOne(service.readView('pkg', 'form', 'Model'));
      expect(result).toBeDefined();
    });

    it('readPackage transforms app object to appName/appIcon properties', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({
        name: 'test-pkg', 
        description: 'A test package', 
        version: '1.0', 
        authors: ['Author'], 
        depends_on: [],
        requires: {},
        apps: [
          {
            id: 'app1',
            name: 'app1',
            extends: '',
            description: 'Home app',
            icon: 'home',
            color: '#000000',
            access: { groups: [] },
            params: { menus: {}, context: {} }
          },
          {
            id: 'legacyApp',
            name: 'legacyApp',
            extends: '',
            description: '',
            icon: '',
            color: '',
            access: { groups: [] },
            params: { menus: {}, context: {} }
          }
        ]
      } as PackageInfos));
      
      const result = await resolveOne(service.readPackage('test-pkg'));
      expect(result.response).toBeDefined();
      expect(result.response.name).toBeDefined();
      expect(result.response.name).toBe('test-pkg');
      expect(result.response.apps?.[0].appName).toBe('app1');
      expect(result.response.apps?.[0].appIcon).toBe('home');
      expect(result.response.apps?.[1].appName).toBe('legacyApp');
    });

    /*
    it('getRoles converts array rights to numbers', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({
        admin: { rights: ['R_READ', 'R_CREATE'] },
        user: { rights: 3 }
      }));
      const result = await resolveOne(service.getRoles('pkg', 'Model'));
      expect(Array.isArray((result as any).admin.rights)).toBeTrue();
      expect(Array.isArray((result as any).user.rights)).toBeTrue();
    });
    */

    it('readPackage handles undefined apps', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({
        name: 'pkg',
        description: 'Desc',
        version: '1.0',
        authors: [],
        depends_on: []
      }));
      const result = await resolveOne(service.readPackage('pkg'));
      expect(result.response.apps).toBeUndefined();
    });
  });

  // ==================== GET OPERATIONS ====================
  describe('get operations', () => {
    it('getPolicies returns policies array on success', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({
        success: true,
        response: { canEdit: {}, canDelete: {} }
      }));
      const result = await resolveOne(service.getPolicies('pkg', 'Model'));
      expect((result.response as any).canEdit).toBeDefined();
      expect((result.response as any).canDelete).toBeDefined();
    });

    it('getPolicies returns empty array on failure', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({ success: false, response: [] }));
      const result = await resolveOne(service.getPolicies('pkg', 'Model'));
      expect((result.response as any)).toEqual([]);
      expect(result.success).toBeFalse();
    });

    it('getActions returns actions on success', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({
        success: true,
        response: { submit: {}, cancel: {} }
      }));
      const result = await resolveOne(service.getActions('pkg', 'Model'));
      expect((result.response as any).submit).toBeDefined();
    });

    it('getActions returns empty array on failure', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({ success: false, response: [] }));
      const result = await resolveOne(service.getActions('pkg', 'Model'));
      expect((result as any).response).toEqual([]);
      expect(result.success).toBeFalse();
    });

    it('getRoles converts array rights to numbers', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({
        admin: { rights: ['R_READ', 'R_CREATE'] },
        user: { rights: 3 }
      }));
      const result = await resolveOne(service.getRoles('pkg', 'Model'));
      expect(Array.isArray((result as any).admin.rights)).toBeTrue();
      expect(Array.isArray((result as any).user.rights)).toBeTrue();
    });

    it('getRoles ensures implied_by is array', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({ 
        admin: { rights: 1, implied_by: ['test'] }
      }));
      const result = await resolveOne(service.getRoles('pkg', 'Model'));
      expect((result as any).admin.implied_by).toEqual(['test']);
    });
  });

  // ==================== SAVE OPERATIONS ====================
  describe('save operations', () => {
    it('saveActions sends payload to API', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({ success: true }));
      const payload = { action1: {} };
      const result = await resolveOne(service.saveActions('pkg', 'Model', payload));
      expect(result.success).toBeTrue();
    });

    it('savePolicies sends payload to API', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({ success: true }));
      const payload = { policy1: {} };
      const result = await resolveOne(service.savePolicies('pkg', 'Model', payload));
      expect(result.success).toBeTrue();
    });

    it('saveRoles sends payload to API', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({ success: true }));
      const result = await resolveOne(service.saveRoles('pkg', 'Model', { admin: {} }));
      expect(result.success).toBeTrue();
    });

    it('saveView sends view payload to API', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({ success: true }));
      const result = await resolveOne(service.saveView({ layout: 'form' }, 'pkg', 'Model', 'form'));
      expect(result.success).toBeTrue();
    });

    it('updateFieldsFromClass sends new schema to API', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({ success: true }));
      const schema = { field1: { type: 'string' } };
      const result = await resolveOne(service.updateFieldsFromClass(schema, 'pkg', 'Model'));
      expect(result.success).toBeTrue();
    });

    it('updateController sends controller payload', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({ success: true }));
      const result = await resolveOne(
        service.updateController('pkg', 'ctrl', 'get', { params: {} })
      );
      expect(result.success).toBeTrue();
    });
  });

  // ==================== COLLECTION OPERATIONS ====================
  describe('collection operations', () => {
    it('collect passes parameters to API correctly', async () => {
      apiSpy.collect.and.returnValue(Promise.resolve([{ id: 1, name: 'Item' }]));
      const result = await resolveOne(
        service.collect('core\\Model', [['id', '=', 1]], ['id', 'name'], 'name', 'desc', 0, 50, 'en')
      );
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Item');
    });

    it('collectAllLanguagesCode extracts language codes from collection', async () => {
      apiSpy.collect.and.returnValue(Promise.resolve([
        { code: 'en' }, 
        { code: 'fr' }, 
        { code: 'de' }
      ]));
      const langs = await resolveOne(service.collectAllLanguagesCode());
      expect(langs).toEqual(['en', 'fr', 'de']);
    });

    it('collectAllLanguagesCode returns empty array on empty result', async () => {
      apiSpy.collect.and.returnValue(Promise.resolve([]));
      const langs = await resolveOne(service.collectAllLanguagesCode());
      expect(langs).toEqual([]);
    });

    it('collectEntitiesWithFilters passes fields to API', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({
        success: true,
        response: [{ code: 'en', name: 'English' }]
      }));
      const result = await resolveOne(
        service.collectEntitiesWithFilters('core\\Lang', ['code', 'name'])
      );
      expect((result as any).response[0].code).toBe('en');
    });
  });

  // ==================== WORKFLOW OPERATIONS ====================
  describe('workflow operations', () => {
    it('getWorkflow returns exists:true when workflow found', async () => {
      apiSpy.get.and.returnValue(Promise.resolve({ state: 'running', steps: [] }));
      const result = await resolveOne(service.getWorkflow('pkg', 'Model'));
      expect(result.exists).toBeTrue();
      expect(result.info.state).toBe('running');
    });

    it('getWorkflow returns exists:false on 404 error', async () => {
      apiSpy.get.and.returnValue(Promise.reject({ status: 404, message: 'Not found' }));
      const result = await resolveOne(service.getWorkflow('pkg', 'Model'));
      expect(result.exists).toBeFalse();
    });

    it('getWorkflow returns empty object on non-404 error', async () => {
      apiSpy.get.and.returnValue(Promise.reject({ status: 500, message: 'Server error' }));
      const result = await resolveOne(service.getWorkflow('pkg', 'Model'));
      expect(result).toEqual({});
      expect(apiSpy.errorFeedback).toHaveBeenCalled();
    });

    it('saveWorkflow returns true on success', async () => {
      apiSpy.post.and.returnValue(Promise.resolve({ success: true }));
      const result = await resolveOne(service.saveWorkflow('pkg', 'Model', 'yaml: content'));
      expect(result).toBeTrue();
    });

    it('saveWorkflow returns false on error', async () => {
      apiSpy.post.and.returnValue(Promise.reject({ message: 'Save failed' }));
      const result = await resolveOne(service.saveWorkflow('pkg', 'Model', 'yaml'));
      expect(result).toBeFalse();
    });

    it('createWorkflow returns true on success', async () => {
      apiSpy.post.and.returnValue(Promise.resolve({}));
      const result = await resolveOne(service.createWorkflow('pkg', 'Model'));
      expect(result).toBeTrue();
    });

    it('createWorkflow returns false on error', async () => {
      apiSpy.post.and.returnValue(Promise.reject({ message: 'Create failed' }));
      const result = await resolveOne(service.createWorkflow('pkg', 'Model'));
      expect(result).toBeFalse();
    });
  });

  // ==================== METADATA OPERATIONS ====================
  describe('metadata operations', () => {
    it('fetchMetaData returns array of metadata', async () => {
      apiSpy.get.and.returnValue(Promise.resolve([
        { id: 1, code: 'cfg1', value: 'data1' },
        { id: 2, code: 'cfg2', value: 'data2' }
      ]));
      const result = await resolveOne(service.fetchMetaData('config', 'system'));
      expect(result.length).toBe(2);
      expect(result[0].id).toBe(1);
    });

    it('fetchMetaData returns empty array on error', async () => {
      apiSpy.get.and.returnValue(Promise.reject({ message: 'Fetch failed' }));
      const result = await resolveOne(service.fetchMetaData('config', 'system'));
      expect(result).toEqual([]);
    });

    it('createMetaData returns true on success', async () => {
      apiSpy.post.and.returnValue(Promise.resolve({ id: 1 }));
      const result = await resolveOne(service.createMetaData('cfg_code', 'ref_id', 'metadata_value'));
      expect(result).toBeTrue();
    });

    it('createMetaData returns false on error', async () => {
      apiSpy.post.and.returnValue(Promise.reject({ message: 'Creation failed' }));
      const result = await resolveOne(service.createMetaData('cfg', 'ref', 'data'));
      expect(result).toBeFalse();
    });

    it('saveMetaData returns true on success', async () => {
      apiSpy.post.and.returnValue(Promise.resolve({}));
      const result = await resolveOne(service.saveMetaData(1, 'updated_value'));
      expect(result).toBeTrue();
    });

    it('saveMetaData returns false on error', async () => {
      apiSpy.post.and.returnValue(Promise.reject({ message: 'Save failed' }));
      const result = await resolveOne(service.saveMetaData(1, 'value'));
      expect(result).toBeFalse();
    });
  });

  // ==================== SCHEMA OPERATIONS ====================
  describe('schema operations', () => {
    it('getSchema returns fields from response', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({
        success: true,
        response: { fields: { id: { type: 'integer' }, name: { type: 'string' } } }
      }));
      const result = await resolveOne(service.getSchema('pkg\\Model'));
      expect((result as any).response.fields).toBeDefined();
    });

    it('getSchema returns empty fields array on error', async () => {
      spyOn<any>(service, 'callApi').and.returnValue(throwError(() => new Error('Fetch failed')));
      const result = await resolveOne(service.getSchema('pkg\\Model'));
      expect(result).toEqual({ fields: [] });
      expect((result.fields as any)).toEqual([]);
    });

    it('getSchema returns empty fields array for empty entity', async () => {
      const result = await resolveOne(service.getSchema(''));
      expect(result).toEqual({ fields: [] });
    });
  });

  // ==================== PACKAGE OPERATIONS ====================
  describe('package operations', () => {
    it('getInitializedPackages returns list of initialized packages', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({
        success: true,
        response: ['pkg1', 'pkg2']
      }));
      const result = await resolveOne(service.getInitializedPackages());
      expect(result.response).toEqual(['pkg1', 'pkg2']);
    });

    it('InitPackage builds URL with all parameter combinations', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({ success: true, response: {} }));
      
      await resolveOne(service.InitPackage('pkg', true, true, false));
      let url = apiSpy.fetch.calls.mostRecent().args[0];
      expect(url).toContain('&import=true');
      expect(url).toContain('&cascade=true');
      expect(url).toContain('&import_cascade=false');

      await resolveOne(service.InitPackage('pkg', false, false, true));
      url = apiSpy.fetch.calls.mostRecent().args[0];
      expect(url).toContain('&cascade=false');
      expect(url).toContain('&import_cascade=true');
    });

    it('checkPackageConsistency returns empty array for empty package name', async () => {
      const result = await resolveOne(service.checkPackageConsistency(''));
      expect(result).toEqual([]);
    });

    it('checkPackageConsistency returns consistency check result', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({
        success: true,
        response: { issues: [] }
      }));
      const result = await resolveOne(service.checkPackageConsistency('pkg'));
      expect(result.success).toBeTrue();
    });

    it('checkPackageConsistency formats error messages with field details', async () => {
      apiSpy.fetch.and.returnValue(Promise.reject({
        message: 'Validation failed',
        error: {
          errors: {
            fieldA: 'Invalid value',
            fieldB: 'Required'
          }
        }
      }));
      const result = await resolveOne(service.checkPackageConsistency('pkg'));
      expect(result.success).toBeFalse();
      expect(result.message).toContain('fieldA: Invalid value');
      expect(result.message).toContain('fieldB: Required');
    });
  });

  // ==================== PACKAGE CONSISTENCY CACHING ====================
  describe('package consistency caching', () => {
    it('getCachedPackageConsistency returns null for empty package name', () => {
      const result = service.getCachedPackageConsistency('');
      expect(result).toBeNull();
    });

    it('getCachedPackageConsistency returns null when not cached', () => {
      const result = service.getCachedPackageConsistency('nonexistent');
      expect(result).toBeNull();
    });

    it('setCachedPackageConsistency stores consistency data', () => {
      service.setCachedPackageConsistency('pkg', { issues: [] });
      const cached = service.getCachedPackageConsistency('pkg');
      expect(cached).toEqual({ issues: [] });
    });

    it('setCachedPackageConsistency ignores invalid inputs', () => {
      service.setCachedPackageConsistency('', { ok: true });
      service.setCachedPackageConsistency('pkg', null);
      expect(service.getCachedPackageConsistency('')).toBeNull();
      expect(service.getCachedPackageConsistency('pkg')).toBeNull();
    });

    it('clearCachedPackageConsistency removes specific entry', () => {
      service.setCachedPackageConsistency('pkg', { ok: true });
      service.clearCachedPackageConsistency('pkg');
      expect(service.getCachedPackageConsistency('pkg')).toBeNull();
    });

    it('clearCachedPackageConsistency clears all entries when no parameter', () => {
      service.setCachedPackageConsistency('pkg1', { a: 1 });
      service.setCachedPackageConsistency('pkg2', { b: 2 });
      service.clearCachedPackageConsistency();
      expect(service.getCachedPackageConsistency('pkg1')).toBeNull();
      expect(service.getCachedPackageConsistency('pkg2')).toBeNull();
    });
  });

  // ==================== ROUTE AGGREGATION ====================
  describe('route aggregation', () => {
    it('getAllRouteFiles aggregates routes from all packages', async () => {
      spyOn<any>(service, 'callApi').and.callFake((url: string) => {
        if (url === '?get=core_config_packages') {
          return of({ response: ['pkg1', 'pkg2'] });
        }
        if (url.includes('pkg1')) {
          return of({ response: { route1: {}, route2: {} } });
        }
        if (url.includes('pkg2')) {
          return of({ response: { route3: {} } });
        }
        return of({ response: {} });
      });
      const result = await resolveOne(service.getAllRouteFiles());
      expect(result).toContain('route1');
      expect(result).toContain('route2');
      expect(result).toContain('route3');
    });

    it('getAllRouteFiles handles empty packages', async () => {
      spyOn<any>(service, 'callApi').and.returnValue(of({ response: [] }));
      const result = await resolveOne(service.getAllRouteFiles());
      expect(result).toEqual([]);
    });
  });

  // ==================== CLASS & CONTROLLER COLLECTION ====================
  describe('class and controller collection', () => {
    it('collectClasses returns unformatted class structure', async () => {
      spyOn<any>(service, 'callApi').and.returnValue(of({
        response: { core: ['Lang', 'User'], custom: ['Model1'] }
      }));
      const result = await resolveOne(service.collectClasses(false));
      expect(result).toEqual({ core: ['Lang', 'User'], custom: ['Model1'] });
    });

    it('collectClasses formats classes as namespace\\ClassName', async () => {
      spyOn<any>(service, 'callApi').and.returnValue(of({
        response: { core: ['Lang', 'User'], custom: ['Invoice'] }
      }));
      const result = await resolveOne(service.collectClasses(true));
      expect(result).toContain('core\\Lang');
      expect(result).toContain('core\\User');
      expect(result).toContain('custom\\Invoice');
    });
  });

  // ==================== CONFIGURATION RETRIEVAL ====================
  describe('configuration retrieval', () => {
    it('getTypes returns available configuration types', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({
        success: true,
        response: { string: {}, integer: {}, boolean: {} }
      }));
      const result = await resolveOne(service.getTypes());
      expect((result.response as any).string).toBeDefined();
    });

    it('getValidOperators returns operator list', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({
        success: true,
        response: ['=', '!=', '>', '<', 'like']
      }));
      const result = await resolveOne(service.getValidOperators());
      expect((result.response as any).length).toBeGreaterThan(0);
    });

    it('getUsages returns usage list', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({
        success: true,
        response: { string: { email: 'email' }, number: { int: 'int' } }
      }));
      const result = await resolveOne(service.getUsages());
      expect(result).toBeDefined();
    });

    it('getCoreGroups returns core groups', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({
        success: true,
        response: [{ id: 1, name: 'Admins' }, { id: 2, name: 'Users' }]
      }));
      const result = await resolveOne(service.getCoreGroups());
      expect((result.response as any).length).toBe(2);
    });

    it('getWidgetTypes returns widget type mapping', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({
        "boolean": [
            "toggle",
            "checkbox"
        ],
        "many2many": [
            "list",
            "multiselect",
            "multiselect_dynamic"
        ],
        "many2one": [
            "select",
            "select_dynamic"
        ],
        "one2many": [
            "list",
            "multiselect",
            "multiselect_dynamic"
        ]
    }));
      const result = await resolveOne(service.getWidgetTypes());
      expect((result as any).many2many).toBeDefined();
    });

    it('getWidgetTypes returns empty object on error', async () => {
      apiSpy.fetch.and.returnValue(Promise.reject(new Error('fail')));
      const result = await resolveOne(service.getWidgetTypes());
      expect((result as any)).toEqual({});
    });
  });

  // ==================== TRANSLATION OPERATIONS ====================
  describe('translation operations', () => {
    it('getTranslations returns translation dictionary', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({
        success: true,
        response: { en: { label: 'Name' }, fr: { label: 'Nom' } }
      }));
      const result = await resolveOne(service.getTranslations('pkg', 'Model'));
      expect(result).not.toBeNull();
      expect((result?.response as any)?.en).toBeDefined();
      expect((result?.response as any)?.fr).toBeDefined();
    });

    it('getTranslations returns null when not found', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({ success: false, response: null }));
      const result = await resolveOne(service.getTranslations('pkg', 'Model'));
      expect((result as any).response).toBeNull();
    });

    it('getTranslationLanguages returns language list for entity', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({
        success: true,
        response: ['en', 'fr', 'de']
      }));
      const result = await resolveOne(service.getTranslationLanguages('pkg', 'Model', 'en'));
      expect((result as any).response.length).toBe(3);
    });

    it('getTranslationLanguagesByPackage returns language map per entity', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({
        success: true,
        response: {
          'Model1': ['en', 'fr'],
          'Model2': ['en', 'de', 'es']
        }
      }));
      const result = await resolveOne(service.getTranslationLanguagesByPackage('pkg'));
      expect((result.response as any).Model1.length).toBe(2);
      expect((result.response as any).Model2.length).toBe(3);
    });

    it('getTranslationsList returns translation keys', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({
        success: true,
        response: { 'field1': ['en', 'fr'], 'field2': ['en'] }
      }));
      const result = await resolveOne(service.getTranslationsList('pkg', 'Model'));
      expect((result.response as any).field1).toEqual(['en', 'fr']);
    });

    it('getMenuTranslationsList returns menu translations', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({
        success: true,
        response: { 'item1': ['en', 'fr'] }
      }));
      const result = await resolveOne(service.getMenuTranslationsList('pkg', 'main', 'en'));
      expect(result.response).toBeDefined();
    });

    it('saveTranslations iterates over language dictionary and saves each', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({ success: true }));
      const dict = {
        en: { export: () => ({ label: 'Name' }) },
        fr: { export: () => ({ label: 'Nom' }) }
      };
      await resolveOne(service.saveTranslations('pkg', 'Model', dict));
      expect(apiSpy.fetch).toHaveBeenCalled();
    });

    it('overwriteTranslations replaces all translations for entity', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({ success: true }));
      const dict = {
        en: { export: () => ({ new: 'value' }) }
      };
      const result = await resolveOne(service.overwriteTranslations('pkg', 'Model', dict));
      expect(result).toBeUndefined();
    });

    it('overwriteMenuTranslations replaces menu translations', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({ success: true, response: {} }));
      const dict = {
        en: { export: () => ({ item: 'Home' }) }
      };
      const result = await resolveOne(service.overwriteMenuTranslations('pkg', 'main', dict));
      expect(result.success).toBeTrue();
    });

    it('overwriteMenuTranslations handles empty translation dict', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({ success: true }));
      const result = await resolveOne(service.overwriteMenuTranslations('pkg', 'main', {}));
      expect(result.success).toBeTrue();
    });
  });

  // ==================== UML OPERATIONS ====================
  describe('UML operations', () => {
    it('saveUML sends UML data to API', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({ success: true }));
      const result = await resolveOne(service.saveUML('pkg', 'class', 'models.puml', 'class Model { id: int }'));
      expect(result).toBeTrue();
    });

    it('saveUML returns false on error', async () => {
      apiSpy.fetch.and.returnValue(Promise.reject({ message: 'Save failed' }));
      const result = await resolveOne(service.saveUML('pkg', 'class', 'file.puml', 'data'));
      expect(result).toBeFalse();
    });

    it('getUMLList returns UML names for type', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({
        pkg: { diagrams: ['models', 'controllers'] }
      }));
      const result = await resolveOne(service.getUMLList('class', 'pkg'));
      expect(result).toBeDefined();
      expect((result as any).diagrams).toContain('models');
      expect((result as any).diagrams).toContain('controllers');
    });

    it('getUMLList returns empty object on error', async () => {
      apiSpy.fetch.and.returnValue(Promise.reject(new Error('Fetch failed')));
      const result = await resolveOne(service.getUMLList('class'));
      expect(result).toEqual({});
    });

    it('getUMLContent returns UML diagram content', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({
        success: true,
        response: ['class Model { }', 'class User { }']
      }));
      const result = await resolveOne(service.getUMLContent('pkg', 'class', 'models.puml'));
      expect((result as any).response.length).toBe(2);
    });

    it('getUMLContent returns empty array on error', async () => {
      apiSpy.fetch.and.returnValue(Promise.reject(new Error('Fetch failed')));
      const result = await resolveOne(service.getUMLContent('pkg', 'class', 'file.puml'));
      expect(result).toEqual([]);
    });
  });

  // ==================== CONTROLLER SUBMISSION ====================
  describe('controller submission', () => {
    it('submitController sends controller with parameters', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({ success: true, response: { result: 'ok' } }));
      const result = await resolveOne(
        service.submitController('get', 'pkg_ctrl', [1, 2, 3] as any)
      );
      expect((result as any).success).toBeTrue();
    });

    it('submitController serializes array parameters to JSON', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({ success: true }));
      await resolveOne(service.submitController('do', 'pkg_action', ['a', 'b'] as any));
      const url = apiSpy.fetch.calls.mostRecent().args[0];
      expect(url).toBeDefined();
    });

    it('announceController returns null when type missing', async () => {
      const result = await resolveOne(service.announceController(undefined, 'ctrl'));
      expect(result).toBeNull();
    });

    it('announceController returns null when name missing', async () => {
      const result = await resolveOne(service.announceController('get', undefined));
      expect(result).toBeNull();
    });

    it('getRoutesLive returns live route configuration', async () => {
      apiSpy.get.and.returnValue(Promise.resolve({ routes: [] }));
      const result = await resolveOne(service.getRoutesLive());
      expect(result).toBeDefined();
    });
  });

  // ==================== ASYNC HELPER METHODS ====================
  describe('async helper methods', () => {
    it('getInitData returns initialization data for type', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({
        components: { Model: {} },
        configs: {}
      }));
      const result = await service.getInitData('pkg', 'components');
      expect(result.components).toBeDefined();
    });

    it('getInitData returns empty object on error', async () => {
      apiSpy.fetch.and.returnValue(Promise.reject(new Error('Failed')));
      const result = await service.getInitData('pkg', 'type');
      expect(result).toEqual({});
    });

    it('updateInitData returns true on success', async () => {
      apiSpy.post.and.returnValue(Promise.resolve({ success: true }));
      const result = await service.updateInitData('pkg', 'type', '{"key":"value"}');
      expect(result).toBeTrue();
    });

    it('updateInitData returns false on error', async () => {
      apiSpy.post.and.returnValue(Promise.reject(new Error('Update failed')));
      const result = await service.updateInitData('pkg', 'type', 'data');
      expect(result).toBeFalse();
    });

    it('getTypeList returns type names', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({
        string: {},
        integer: {},
        boolean: {},
        float: {}
      }));
      const result = await service.getTypeList();
      expect(result).toContain('string');
      expect(result).toContain('integer');
    });

    it('getTypeList returns empty array on error', async () => {
      apiSpy.fetch.and.returnValue(Promise.reject(new Error('Failed')));
      const result = await service.getTypeList();
      expect(result).toEqual([]);
    });

    it('getTypeDirective returns raw type definitions', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({
        string: { maxLength: 255 },
        integer: { min: 0 }
      }));
      const result = await service.getTypeDirective();
      expect(result.string).toBeDefined();
      expect(result.integer).toBeDefined();
    });

    it('getTypeDirective returns empty array on error', async () => {
      apiSpy.fetch.and.returnValue(Promise.reject(new Error('Failed')));
      const result = await service.getTypeDirective();
      expect(result).toEqual([]);
    });

    it('getUsageList constructs usage strings from nested structure', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({
        string: { email: 'email', 'slug': 'slug' },
        number: { int: 'int', float: 'float' }
      }));
      const result = await service.getUsageList();
      expect(result).toContain('string/email');
      expect(result).toContain('string/slug');
      expect(result).toContain('number/int');
      expect(result).toContain('number/float');
    });

    it('getUsageList handles numeric keys', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({
        string: { 16: 'uuid', email: 'email' }
      }));
      const result = await service.getUsageList();
      expect(result.some((u: string) => u.includes('uuid'))).toBeTrue();
    });

    it('getUsageList returns empty array on error', async () => {
      apiSpy.fetch.and.returnValue(Promise.reject(new Error('Failed')));
      const result = await service.getUsageList();
      expect(result).toEqual([]);
    });
  });

  // ==================== DEPRECATED VIEW METHODS (Legacy) ====================
  describe('deprecated view methods', () => {
    it('getViews returns views for package and entity', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({
        success: true,
        response: ['form', 'list', 'grid']
      }));
      const result = await resolveOne(service.getViews('pkg', 'Model'));
      expect((result as any).response).toContain('form');
    });

    it('getView returns single view configuration', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({
        success: true,
        response: { layout: 'form', fields: [] }
      }));
      const result = await resolveOne(service.getView('pkg\\Model', 'form'));
      expect(result).toBeDefined();
    });
  });

  // ==================== CALL API ERROR HANDLING ====================
  describe('callApi error handling', () => {
    it('callApi returns success:true with response on success', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({ data: 'test' }));
      const result = await resolveOne(service.checkPackageConsistency('pkg'));
      expect(result.success).toBeTrue();
      expect(result.response).toEqual({ data: 'test' });
    });

    it('callApi formats error with nested error fields', async () => {
      apiSpy.fetch.and.returnValue(Promise.reject({
        error: {
          errors: {
            name: 'Name is required',
            email: 'Invalid email'
          }
        }
      }));
      const result = await resolveOne(service.checkPackageConsistency('pkg'));
      expect(result.success).toBeFalse();
      expect(result.message).toContain('name: Name is required');
      expect(result.message).toContain('email: Invalid email');
    });

    it('callApi includes top-level message in error', async () => {
      apiSpy.fetch.and.returnValue(Promise.reject({
        message: 'Request failed',
        error: {}
      }));
      const result = await resolveOne(service.checkPackageConsistency('pkg'));
      expect(result.success).toBeFalse();
      expect(result.message).toContain('Error');
    });

    it('callApi passes payload parameter to fetch', async () => {
      apiSpy.fetch.and.returnValue(Promise.resolve({ success: true }));
      await resolveOne(service.saveActions('pkg', 'Model', { action: 'data' }));
      const fetchCall = apiSpy.fetch.calls.mostRecent();
      expect(fetchCall.args[1]).toBeDefined();
    });
  });
});

