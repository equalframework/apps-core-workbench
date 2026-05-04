import { TestBed } from '@angular/core/testing';
import { ApiService } from 'sb-shared-lib';
import { TypeUsageService } from './type-usage.service';
import { cloneDeep } from 'lodash';

describe('TypeUsageService', () => {
  let service: TypeUsageService;
  let mockApiService: jasmine.SpyObj<ApiService>;

  const mockScheme = {
    string: { name: 'String Type' },
    integer: { name: 'Integer Type' },
    date: { name: 'Date Type' }
  };

  beforeEach(() => {
    mockApiService = jasmine.createSpyObj('ApiService', ['fetch']);
    mockApiService.fetch.and.returnValue(Promise.resolve(mockScheme));

    TestBed.configureTestingModule({
      providers: [
        TypeUsageService,
        { provide: ApiService, useValue: mockApiService }
      ]
    });

    service = TestBed.inject(TypeUsageService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('initialization', () => {
    it('should fetch config usages on creation', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          TypeUsageService,
          { provide: ApiService, useValue: mockApiService }
        ]
      });

      new TypeUsageService(mockApiService);

      expect(mockApiService.fetch).toHaveBeenCalledWith('?get=core_config_usages');
    });

    it('should call correct API endpoint', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          TypeUsageService,
          { provide: ApiService, useValue: mockApiService }
        ]
      });

      new TypeUsageService(mockApiService);

      const calls = mockApiService.fetch.calls.all();
      expect(calls.some(call => call.args[0] === '?get=core_config_usages')).toBe(true);
    });

    it('should set scheme property with API response', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(service['scheme']).toEqual(mockScheme);
    });
  });

  describe('usages getter', () => {
    it('should return the fetched scheme', async () => {
      // Wait for async initialization
      await new Promise(resolve => setTimeout(resolve, 50));

      const usages = service.usages;
      expect(usages).toBeDefined();
      expect(usages).toEqual(mockScheme);
    });

    it('should return undefined initially if fetch not complete', () => {
      // Create fresh service instance
      TestBed.resetTestingModule();
      const asyncMock = jasmine.createSpyObj('ApiService', ['fetch']);
      asyncMock.fetch.and.returnValue(new Promise(resolve => {
        // Never resolve - simulate slow API
        setTimeout(() => resolve(mockScheme), 10000);
      }));

      TestBed.configureTestingModule({
        providers: [
          TypeUsageService,
          { provide: ApiService, useValue: asyncMock }
        ]
      });

      const newService = TestBed.inject(TypeUsageService);
      // Immediately check usages (before promise resolves)
      expect(newService.usages).toBeUndefined();
    });

    it('should return updated scheme after fetch completes', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));

      const usages = service.usages;
      expect(usages).toEqual({
        string: { name: 'String Type' },
        integer: { name: 'Integer Type' },
        date: { name: 'Date Type' }
      });
    });
  });

  describe('typeIcon getter', () => {
    it('should return icon mapping object', () => {
      const icons = service.typeIcon;

      expect(icons).toBeDefined();
      expect(typeof icons).toBe('object');
    });

    it('should have all expected type icons', () => {
      const icons = service.typeIcon;

      expect(icons['string']).toBe('format_quote');
      expect(icons['integer']).toBe('123');
      expect(icons['array']).toBe('data_array');
      expect(icons['float']).toBe('money');
      expect(icons['boolean']).toBe('question_mark');
      expect(icons['computed']).toBe('functions');
      expect(icons['alias']).toBe('type_specimen');
      expect(icons['binary']).toBe('looks_one');
      expect(icons['date']).toBe('today');
      expect(icons['datetime']).toBe('event');
      expect(icons['time']).toBe('access_time');
      expect(icons['text']).toBe('article');
      expect(icons['many2one']).toBe('call_merge');
      expect(icons['one2many']).toBe('call_split');
      expect(icons['many2many']).toBe('height');
    });

    it('should return a clone of the icon list', () => {
      const icons1 = service.typeIcon;
      const icons2 = service.typeIcon;

      // Should be different object instances (deep clone)
      expect(icons1).not.toBe(icons2);
      // But with same content
      expect(icons1).toEqual(icons2);
    });

    it('should allow modification without affecting original', () => {
      const icons = service.typeIcon;
      icons['string'] = 'modified_icon';

      const icons2 = service.typeIcon;
      expect(icons2['string']).toBe('format_quote');
    });

    it('should contain common Material Design Icons names', () => {
      const icons = service.typeIcon;

      // Verify icon names follow Material Design naming
      const materialIconNames = Object.values(icons) as string[];

      // Common Material icon patterns (snake_case, numbers, or single word)
      const validPattern = /^[a-z0-9_]+$/;
      materialIconNames.forEach(name => {
        expect(validPattern.test(name)).toBe(true);
      });
    });
  });

  describe('typeIcon getter consistency', () => {
    it('should return consistent data across multiple calls', () => {
      const icons1 = service.typeIcon;
      const icons2 = service.typeIcon;
      const icons3 = service.typeIcon;

      expect(icons1).toEqual(icons2);
      expect(icons2).toEqual(icons3);
    });

    it('should handle all 15 standard field types', () => {
      const expectedTypes = [
        'string', 'integer', 'array', 'float', 'boolean', 'computed',
        'alias', 'binary', 'date', 'datetime', 'time', 'text',
        'many2one', 'one2many', 'many2many'
      ];

      const icons = service.typeIcon;

      expectedTypes.forEach(type => {
        expect(icons[type]).toBeDefined();
        expect(icons[type]).not.toBe('');
      });
    });
  });

  describe('API error handling', () => {
    it('should handle fetch error gracefully', async () => {
      TestBed.resetTestingModule();
      const errorMock = jasmine.createSpyObj('ApiService', ['fetch']);
      errorMock.fetch.and.returnValue(Promise.reject(new Error('API Error')));

      TestBed.configureTestingModule({
        providers: [
          TypeUsageService,
          { provide: ApiService, useValue: errorMock }
        ]
      });

      const newService = TestBed.inject(TypeUsageService);

      // Should not throw on creation despite API error
      expect(newService).toBeTruthy();

      // usages should be undefined after error
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(newService.usages).toBeUndefined();
    });

    it('should still provide typeIcon even if API fails', async () => {
      TestBed.resetTestingModule();
      const errorMock = jasmine.createSpyObj('ApiService', ['fetch']);
      errorMock.fetch.and.returnValue(Promise.reject(new Error('API Error')));

      TestBed.configureTestingModule({
        providers: [
          TypeUsageService,
          { provide: ApiService, useValue: errorMock }
        ]
      });

      const newService = TestBed.inject(TypeUsageService);

      // typeIcon should still be available
      const icons = newService.typeIcon;
      expect(icons['string']).toBe('format_quote');
      expect(icons['date']).toBe('today');
    });
  });

  describe('edge cases', () => {
    it('should handle null API response', async () => {
      TestBed.resetTestingModule();
      const nullMock = jasmine.createSpyObj('ApiService', ['fetch']);
      nullMock.fetch.and.returnValue(Promise.resolve(null));

      TestBed.configureTestingModule({
        providers: [
          TypeUsageService,
          { provide: ApiService, useValue: nullMock }
        ]
      });

      const newService = TestBed.inject(TypeUsageService);

      await new Promise(resolve => setTimeout(resolve, 50));
      expect(newService.usages).toBeNull();

      // typeIcon should still work
      expect(newService.typeIcon['string']).toBe('format_quote');
    });

    it('should handle empty API response', async () => {
      TestBed.resetTestingModule();
      const emptyMock = jasmine.createSpyObj('ApiService', ['fetch']);
      emptyMock.fetch.and.returnValue(Promise.resolve({}));

      TestBed.configureTestingModule({
        providers: [
          TypeUsageService,
          { provide: ApiService, useValue: emptyMock }
        ]
      });

      const newService = TestBed.inject(TypeUsageService);

      await new Promise(resolve => setTimeout(resolve, 50));
      expect(newService.usages).toEqual({});
    });

    it('should handle API response with unexpected structure', async () => {
      TestBed.resetTestingModule();
      const unexpectedMock = jasmine.createSpyObj('ApiService', ['fetch']);
      unexpectedMock.fetch.and.returnValue(Promise.resolve({ unexpected: 'data' }));

      TestBed.configureTestingModule({
        providers: [
          TypeUsageService,
          { provide: ApiService, useValue: unexpectedMock }
        ]
      });

      const newService = TestBed.inject(TypeUsageService);

      await new Promise(resolve => setTimeout(resolve, 50));
      expect(newService.usages).toEqual({ unexpected: 'data' });

      // typeIcon should still work regardless
      expect(newService.typeIcon['string']).toBe('format_quote');
    });
  });

  describe('memory and performance', () => {
    it('should use cloneDeep to prevent external modifications', () => {
      const icons1 = service.typeIcon;
      icons1['string'] = 'completely_different';

      const icons2 = service.typeIcon;
      expect(icons2['string']).toBe('format_quote');
    });

    it('should not leak references to internal data', () => {
      const icons = service.typeIcon;

      // Modify returned object
      icons['custom_type'] = 'custom_icon';

      // Get icons again
      const icons2 = service.typeIcon;

      // Should not have the custom type
      expect(icons2['custom_type']).toBeUndefined();
    });

    it('should handle multiple rapid calls', () => {
      const results: any[] = [];
      for (let i = 0; i < 100; i++) {
        results.push(service.typeIcon);
      }

      // All should be equal
      results.forEach(result => {
        expect(result).toEqual(results[0]);
      });

      // But different instances
      expect(results[0]).not.toBe(results[1]);
    });
  });

  describe('API contract verification', () => {
    it('should call API with exact endpoint specification', () => {
      mockApiService.fetch.calls.reset();

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          TypeUsageService,
          { provide: ApiService, useValue: mockApiService }
        ]
      });

      new TypeUsageService(mockApiService);

      expect(mockApiService.fetch).toHaveBeenCalledWith('?get=core_config_usages');
    });

    it('should accept promise-based API response', async () => {
      const promisedResponse = new Promise(resolve => {
        setTimeout(() => resolve(mockScheme), 10);
      });

      TestBed.resetTestingModule();
      const asyncMock = jasmine.createSpyObj('ApiService', ['fetch']);
      asyncMock.fetch.and.returnValue(promisedResponse);

      TestBed.configureTestingModule({
        providers: [
          TypeUsageService,
          { provide: ApiService, useValue: asyncMock }
        ]
      });

      const newService = TestBed.inject(TypeUsageService);

      await new Promise(resolve => setTimeout(resolve, 50));
      expect(newService.usages).toEqual(mockScheme);
    });
  });
});
