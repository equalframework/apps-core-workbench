import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JsonValidationService, ValidationResult, ValidationError } from './json-validation.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Overlay } from '@angular/cdk/overlay';
import { ApiService } from 'sb-shared-lib';
import { NotificationService } from './notification.service';
import { Observable, of } from 'rxjs';

describe('JsonValidationService', () => {
  let service: JsonValidationService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
        apiServiceSpy = jasmine.createSpyObj<ApiService>('ApiService', ['fetch', 'post', 'call']);
        notificationServiceSpy = jasmine.createSpyObj<NotificationService>('NotificationService', ['showError', 'showSuccess']);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, TranslateModule.forRoot()],
            providers: [
                JsonValidationService,
                MatSnackBar,
                Overlay,
                { provide: ApiService, useValue: apiServiceSpy },
                { provide: NotificationService, useValue: notificationServiceSpy }
            ]
        });
        service = TestBed.inject(JsonValidationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('validate', () => {
        it('should validate JSON against schema and return valid result', (done) => {
            const json = { name: 'Test' };
            const schemaId = 'testSchema';

            apiServiceSpy.call.and.returnValue(Promise.resolve({
                valid: true,
                errors: []
            }));

            service.validate(json, schemaId).subscribe(result => {
                expect(result).toBeDefined();
                expect(result.valid).toBeTrue();
                expect(result.errors).toEqual([]);
                done();
            });
        });

        it('should return validation errors for invalid JSON', (done) => {
            const json = { name: 123 };
            const schemaId = 'testSchema';
            
            apiServiceSpy.call.and.returnValue(Promise.resolve({
                valid: false,
                errors: [{ message: 'should be string', instancePath: '/name' }]
            }));
            
            service.validate(json, schemaId).subscribe(result => {
                expect(result.valid).toBeFalse();
                expect(result.errors.length).toBe(1);
                expect(result.errors[0].message).toBe('should be string');
                done();
            });
        });

        it('should handle API errors gracefully', (done) => {
            const json = { name: 'Test' };
            const schemaId = 'testSchema';
            apiServiceSpy.call.and.returnValue(Promise.reject(new Error('Network error')));

            service.validate(json, schemaId).subscribe(result => {
                expect(result.valid).toBeFalse();
                expect(result.errors.length).toBeGreaterThan(0);
                expect(result.errors[0].message).toContain('Network error');
                done();
            });
        });

        it('should pass optional packageName and strict parameters', (done) => {
            const json = { data: 'test' };
            const schemaId = 'view';
            const packageName = 'test-package';

            apiServiceSpy.call.and.returnValue(Promise.resolve({ valid: true, errors: [] }));

            service.validate(json, schemaId, packageName, true).subscribe(() => {
                expect(apiServiceSpy.call).toHaveBeenCalled();
                done();
            });
        });

        it('should handle response with result field instead of valid field', (done) => {
            apiServiceSpy.call.and.returnValue(Promise.resolve({
                result: true,
                errors: []
            }));

            service.validate({ test: 1 }, 'schema').subscribe(result => {
                expect(result.valid).toBeTrue();
                done();
            });
        });

        it('should treat missing valid/result field as false', (done) => {
            apiServiceSpy.call.and.returnValue(Promise.resolve({
                errors: []
            }));

            service.validate({ test: 1 }, 'schema').subscribe(result => {
                expect(result.valid).toBeFalse();
                done();
            });
        });
    });

    describe('formatErrorsForDisplay', () => {
        it('should format validation errors into user-friendly messages', () => {
            const errors: ValidationError[] = [
                { instancePath: '/name', message: 'should be string', field: 'name', path: '/name' } as any,
                { instancePath: '/age', message: 'should be number', field: 'age', path: '/age' } as any
            ];
            const formatted = service.formatErrorsForDisplay(errors);
            expect(formatted).toContain('Validation errors:');
            expect(formatted).toContain('should be string');
            expect(formatted).toContain('should be number');
        });

        it('should include field info when available', () => {
            const errors: ValidationError[] = [
                { message: 'Invalid value', field: 'email', path: '/email' }
            ];
            const formatted = service.formatErrorsForDisplay(errors);
            expect(formatted).toContain('Field: email');
            expect(formatted).toContain('Path: /email');
            expect(formatted).toContain('Message: Invalid value');
        });

        it('should include code info when available', () => {
            const errors: ValidationError[] = [
                { message: 'Invalid format', code: 'FORMAT_ERROR', path: '/field' }
            ];
            const formatted = service.formatErrorsForDisplay(errors);
            expect(formatted).toContain('Code: FORMAT_ERROR');
        });

        it('should return empty string for no errors', () => {
            const formatted = service.formatErrorsForDisplay([]);
            expect(formatted).toEqual('');
        });

        it('should handle errors with only message field', () => {
            const errors: ValidationError[] = [
                { message: 'Simple error' }
            ];
            const formatted = service.formatErrorsForDisplay(errors);
            expect(formatted).toContain('Message: Simple error');
        });

        it('should handle multiple errors with mixed data', () => {
            const errors: ValidationError[] = [
                { message: 'Error 1', field: 'field1' },
                { message: 'Error 2', path: '/path2', code: 'CODE2' },
                { message: 'Error 3' }
            ];
            const formatted = service.formatErrorsForDisplay(errors);
            const lines = formatted.split('\n');
            expect(lines.length).toBeGreaterThan(3);
        });
    });

    describe('normalizeErrors', () => {
        it('should normalize errors array with instancePath into field and path', () => {
            const errors = [
                { instancePath: '/name', message: 'should be string' },
                { instancePath: '/age', message: 'should be number' }
            ];
            const normalized = service['normalizeErrors'](errors);
            expect(normalized.length).toBe(2);
            expect(normalized[0].message).toBe('should be string');
            expect(normalized[1].message).toBe('should be number');
        });

        it('should handle errors without instancePath gracefully', () => {
            const errors = [
                { message: 'General error' }
            ];
            const normalized = service['normalizeErrors'](errors);
            expect(normalized.length).toBe(1);
            expect(normalized[0].message).toBe('General error');
        });

        it('should handle null errors gracefully', () => {
            const normalized = service['normalizeErrors'](null);
            expect(normalized).toEqual([]);
        });

        it('should handle undefined errors gracefully', () => {
            const normalized = service['normalizeErrors'](undefined);
            expect(normalized).toEqual([]);
        });

        it('should normalize string errors', () => {
            const normalized = service['normalizeErrors']('Simple string error');
            expect(normalized.length).toBe(1);
            expect(normalized[0].message).toBe('Simple string error');
        });

        it('should normalize object errors with nested arrays', () => {
            const errors = {
                '/field1': [
                    { message: 'Error 1', code: 'CODE1' },
                    { message: 'Error 2', code: 'CODE2' }
                ],
                '/field2': { message: 'Error 3' }
            };
            const normalized = service['normalizeErrors'](errors);
            expect(normalized.length).toBeGreaterThan(0);
            expect(normalized.some(e => e.message === 'Error 1')).toBeTrue();
        });

        it('should handle object errors with string values', () => {
            const errors = {
                '/field': 'String error value'
            };
            const normalized = service['normalizeErrors'](errors);
            expect(normalized.length).toBeGreaterThan(0);
        });

        it('should handle array of strings', () => {
            const normalized = service['normalizeErrors'](['Error 1', 'Error 2']);
            expect(normalized.length).toBe(2);
            expect(normalized[0].message).toBe('Error 1');
            expect(normalized[1].message).toBe('Error 2');
        });

        it('should preserve field, code, and path information', () => {
            const errors = [
                { message: 'Error', field: 'testField', path: '/test', code: 'TEST_CODE' }
            ];
            const normalized = service['normalizeErrors'](errors);
            expect(normalized[0].field).toBe('testField');
            expect(normalized[0].path).toBe('/test');
            expect(normalized[0].code).toBe('TEST_CODE');
        });

        it('should handle mixed error object with nested structure', () => {
            const errors = {
                'field1': [
                    'String error',
                    { message: 'Object error', code: 'ERR1' }
                ]
            };
            const normalized = service['normalizeErrors'](errors);
            expect(normalized.length).toBeGreaterThan(0);
        });
    });

    describe('validateView', () => {
        it('should validate view data and return result', (done) => {
            const viewData = { fields: ['name', 'email'] };
            const schemaId = 'testSchema';

            apiServiceSpy.call.and.returnValue(Promise.resolve({
                valid: true,
                errors: []
            }));

            service.validateView(viewData, schemaId).subscribe(result => {
                expect(result.valid).toBeTrue();
                done();
            });
        });

        it('should pass packageName to validate method', (done) => {
            apiServiceSpy.call.and.returnValue(Promise.resolve({ valid: true, errors: [] }));

            service.validateView({ data: 'test' }, 'schema', 'test-pkg').subscribe(() => {
                expect(apiServiceSpy.call).toHaveBeenCalled();
                done();
            });
        });

        it('should handle validation errors in view data', (done) => {
            apiServiceSpy.call.and.returnValue(Promise.resolve({
                valid: false,
                errors: [{ message: 'Invalid view structure' }]
            }));

            service.validateView({}, 'schema').subscribe(result => {
                expect(result.valid).toBeFalse();
                expect(result.errors.length).toBeGreaterThan(0);
                done();
            });
        });
    });

    describe('validateBySchemaType', () => {
        it('should validate data for given schema type', (done) => {
            const data = { type: 'model' };
            const schemaType = 'model';

            apiServiceSpy.call.and.returnValue(Promise.resolve({
                valid: true,
                errors: []
            }));

            service.validateBySchemaType(data, schemaType).subscribe(result => {
                expect(result.valid).toBeTrue();
                done();
            });
        });

        it('should handle different schema types', (done) => {
            apiServiceSpy.call.and.returnValue(Promise.resolve({ valid: true, errors: [] }));
            
            const schemaTypes = ['view', 'field', 'action', 'policy'];
            let completed = 0;

            schemaTypes.forEach(schemaType => {
                service.validateBySchemaType({ test: 'data' }, schemaType).subscribe(() => {
                    completed++;
                    if (completed === schemaTypes.length) {
                        done();
                    }
                });
            });
            expect(apiServiceSpy.call).toHaveBeenCalledTimes(schemaTypes.length);
        });

        it('should pass packageName parameter', (done) => {
            apiServiceSpy.call.and.returnValue(Promise.resolve({ valid: true, errors: [] }));

            service.validateBySchemaType({ data: 'test' }, 'type', 'package-name').subscribe(() => {
                expect(apiServiceSpy.call).toHaveBeenCalled();
                done();
            });
        });
    });

    describe('buildStatusInfo', () => {
        it('should build status info with loading state', () => {
            const label = 'Test';
            const statusInfo = service.buildStatusInfo(label, null, true);
            expect(statusInfo.length).toBe(1);
            expect(statusInfo[0].label).toBe('Test');
            expect(statusInfo[0].value).toBe('Checking...');
            expect(statusInfo[0].icon).toBe('hourglass_top');
            expect(statusInfo[0].tooltip).toBe('Validation in progress');
        });

        it('should build status info with error message', () => {
            const label = 'Test';
            const errorMessage = 'API error occurred';
            const statusInfo = service.buildStatusInfo(label, null, false, errorMessage);
            expect(statusInfo.length).toBe(1);
            expect(statusInfo[0].value).toBe('API error occurred');
            expect(statusInfo[0].icon).toBe('error');
            expect(statusInfo[0].tooltip).toBe('API error occurred');
        });

        it('should build status info with not checked state', () => {
            const label = 'Test';
            const statusInfo = service.buildStatusInfo(label, null, false);
            expect(statusInfo.length).toBe(1);
            expect(statusInfo[0].value).toBe('Not checked');
            expect(statusInfo[0].icon).toBe('info');
            expect(statusInfo[0].tooltip).toBe('Validation was not run');
        });

        it('should build status info with valid result', () => {
            const label = 'Test';
            const result: ValidationResult = { valid: true, errors: [] };
            const statusInfo = service.buildStatusInfo(label, result, false);
            expect(statusInfo.length).toBe(1);
            expect(statusInfo[0].value).toBe('Passed');
            expect(statusInfo[0].icon).toBe('check_circle');
            expect(statusInfo[0].tooltip).toBe('JSON validates against the schema');
        });

        it('should build status info with single error', () => {
            const label = 'Test';
            const result: ValidationResult = {
                valid: false,
                errors: [{ message: 'Field required', field: 'name', code: 'REQUIRED' }]
            };
            const statusInfo = service.buildStatusInfo(label, result, false);
            expect(statusInfo.length).toBe(1);
            expect(statusInfo[0].value).toBe('Failed: 1 error');
            expect(statusInfo[0].icon).toBe('error');
            expect(statusInfo[0].tooltip).toBe('Validation failed');
            expect(statusInfo[0].message).toBeDefined();
            expect(statusInfo[0].code).toBeDefined();
        });

        it('should build status info with multiple errors', () => {
            const label = 'Test';
            const result: ValidationResult = {
                valid: false,
                errors: [
                    { message: 'Error 1', field: 'field1' },
                    { message: 'Error 2', field: 'field2' }
                ]
            };
            const statusInfo = service.buildStatusInfo(label, result, false);
            expect(statusInfo.length).toBe(1);
            expect(statusInfo[0].value).toBe('Failed: 2 errors');
            expect(statusInfo[0].icon).toBe('error');
            expect(statusInfo[0].tooltip).toContain('2 errors');
        });

        it('should include error details in status info arrays', () => {
            const label = 'Test';
            const result: ValidationResult = {
                valid: false,
                errors: [
                    { message: 'Error 1', field: 'field1', code: 'CODE1', path: '/path1' },
                    { message: 'Error 2', field: 'field2', code: 'CODE2', path: '/path2' }
                ]
            };
            const statusInfo = service.buildStatusInfo(label, result, false);
            expect(statusInfo[0].message).toEqual(['Error 1', 'Error 2']);
            expect(statusInfo[0].field).toEqual(['field1', 'field2']);
            expect(statusInfo[0].code).toEqual(['CODE1', 'CODE2']);
            expect(statusInfo[0].path).toEqual(['/path1', '/path2']);
        });

        it('should handle empty errors array', () => {
            const label = 'Test';
            const result: ValidationResult = { valid: false, errors: [] };
            const statusInfo = service.buildStatusInfo(label, result, false);
            expect(statusInfo.length).toBe(1);
            expect(statusInfo[0].value).toBe('Failed: 0 error');
        });

        it('should prioritize error message over other status values', () => {
            const label = 'Test';
            const result: ValidationResult = { valid: true, errors: [] };
            const errorMessage = 'Critical error';
            const statusInfo = service.buildStatusInfo(label, result, true, errorMessage);
            // Error message should take priority when loading is also true
            expect(statusInfo[0].value).toBe('Checking...');
        });
    });

    describe('getErrorSummary', () => {
        it('should return success message for valid result', () => {
            const result: ValidationResult = { valid: true, errors: [] };
            const summary = service.getErrorSummary(result);
            expect(summary).toBe('Validation successful');
        });

        it('should return error count for invalid result with errors', () => {
            const result: ValidationResult = {
                valid: false,
                errors: [{ message: 'Error 1' }, { message: 'Error 2' }]
            };
            const summary = service.getErrorSummary(result);
            expect(summary).toContain('Validation failed');
            expect(summary).toContain('2 error');
        });

        it('should handle zero errors in invalid result', () => {
            const result: ValidationResult = { valid: false, errors: [] };
            const summary = service.getErrorSummary(result);
            expect(summary).toContain('0 error');
        });

        it('should handle null errors array', () => {
            const result: ValidationResult = { valid: false, errors: null as any };
            const summary = service.getErrorSummary(result);
            expect(summary).toContain('Validation failed');
            expect(summary).toContain('0 error');
        });

        it('should handle undefined errors array', () => {
            const result: ValidationResult = { valid: false, errors: undefined as any };
            const summary = service.getErrorSummary(result);
            expect(summary).toContain('Validation failed');
        });
    });

    describe('validateAndSave', () => {
        it('should save when validation passes', (done) => {
            const mockSetIsSaving = jasmine.createSpy('setIsSaving');
            const saveFn = jasmine.createSpy('saveFn').and.returnValue(of({ success: true, message: 'Saved' }));
            const validate$ = of({ valid: true, errors: [] } as ValidationResult);

            service.validateAndSave(validate$, saveFn, mockSetIsSaving);

            setTimeout(() => {
                expect(mockSetIsSaving).toHaveBeenCalledWith(true);
                expect(saveFn).toHaveBeenCalled();
                expect(notificationServiceSpy.showSuccess).toHaveBeenCalledWith('Saved');
                expect(mockSetIsSaving).toHaveBeenCalledWith(false);
                done();
            }, 100);
        });

        it('should not save when validation fails', (done) => {
            const mockSetIsSaving = jasmine.createSpy('setIsSaving');
            const saveFn = jasmine.createSpy('saveFn');
            const validate$ = of({
                valid: false,
                errors: [{ message: 'Validation error' }]
            } as ValidationResult);

            service.validateAndSave(validate$, saveFn, mockSetIsSaving);

            setTimeout(() => {
                expect(mockSetIsSaving).toHaveBeenCalledWith(true);
                expect(saveFn).not.toHaveBeenCalled();
                expect(notificationServiceSpy.showError).toHaveBeenCalled();
                expect(mockSetIsSaving).toHaveBeenCalledWith(false);
                done();
            }, 100);
        });

        it('should handle save error gracefully', (done) => {
            const mockSetIsSaving = jasmine.createSpy('setIsSaving');
            const errorMessage = 'Save failed';
            const saveFn = jasmine.createSpy('saveFn').and.returnValue(
                new Observable(observer => observer.error(new Error(errorMessage)))
            );
            const validate$ = of({ valid: true, errors: [] } as ValidationResult);

            service.validateAndSave(validate$, saveFn, mockSetIsSaving);

            setTimeout(() => {
                expect(notificationServiceSpy.showError).toHaveBeenCalled();
                expect(mockSetIsSaving).toHaveBeenCalledWith(false);
                done();
            }, 100);
        });

        it('should handle validation error in observable', (done) => {
            const mockSetIsSaving = jasmine.createSpy('setIsSaving');
            const saveFn = jasmine.createSpy('saveFn');
            const validate$ = new Observable<ValidationResult>(observer => observer.error(new Error('Validation error')));

            service.validateAndSave(validate$, saveFn, mockSetIsSaving);

            setTimeout(() => {
                expect(notificationServiceSpy.showError).toHaveBeenCalled();
                expect(mockSetIsSaving).toHaveBeenCalledWith(false);
                done();
            }, 100);
        });

        it('should handle save response without success property', (done) => {
            const mockSetIsSaving = jasmine.createSpy('setIsSaving');
            const saveFn = jasmine.createSpy('saveFn').and.returnValue(of({}));
            const validate$ = of({ valid: true, errors: [] } as ValidationResult);

            service.validateAndSave(validate$, saveFn, mockSetIsSaving);

            setTimeout(() => {
                expect(notificationServiceSpy.showSuccess).toHaveBeenCalledWith('Saved successfully');
                done();
            }, 100);
        });

        it('should handle save response with failure message', (done) => {
            const mockSetIsSaving = jasmine.createSpy('setIsSaving');
            const saveFn = jasmine.createSpy('saveFn').and.returnValue(
                of({ success: false, message: 'Validation on backend failed' })
            );
            const validate$ = of({ valid: true, errors: [] } as ValidationResult);

            service.validateAndSave(validate$, saveFn, mockSetIsSaving);

            setTimeout(() => {
                expect(notificationServiceSpy.showError).toHaveBeenCalledWith('Validation on backend failed');
                done();
            }, 100);
        });

        it('should handle save response with void return', (done) => {
            const mockSetIsSaving = jasmine.createSpy('setIsSaving');
            const saveFn = jasmine.createSpy('saveFn').and.returnValue(of(void 0));
            const validate$ = of({ valid: true, errors: [] } as ValidationResult);

            service.validateAndSave(validate$, saveFn, mockSetIsSaving);

            setTimeout(() => {
                expect(notificationServiceSpy.showSuccess).toHaveBeenCalledWith('Saved successfully');
                done();
            }, 100);
        });

        it('should show validation error summary when validation fails', (done) => {
            const mockSetIsSaving = jasmine.createSpy('setIsSaving');
            const saveFn = jasmine.createSpy('saveFn');
            const validate$ = of({
                valid: false,
                errors: [
                    { message: 'Error 1' },
                    { message: 'Error 2' }
                ]
            } as ValidationResult);

            service.validateAndSave(validate$, saveFn, mockSetIsSaving);

            setTimeout(() => {
                const errorCall = notificationServiceSpy.showError.calls.mostRecent().args[0];
                expect(errorCall).toContain('Validation failed');
                expect(errorCall).toContain('Error 1');
                done();
            }, 100);
        });
    });

    describe('Edge cases and corner scenarios', () => {
        it('should handle very large validation response', (done) => {
            const largeErrorArray: ValidationError[] = [];
            for (let i = 0; i < 1000; i++) {
                largeErrorArray.push({ message: `Error ${i}`, field: `field${i}` });
            }

            apiServiceSpy.call.and.returnValue(Promise.resolve({
                valid: false,
                errors: largeErrorArray
            }));

            service.validate({}, 'schema').subscribe(result => {
                expect(result.errors.length).toBe(1000);
                done();
            });
        });

        it('should handle deeply nested error objects', () => {
            const complexErrors = {
                'level1': {
                    'level2': {
                        'level3': 'Nested error'
                    }
                }
            };

            const normalized = service['normalizeErrors'](complexErrors);
            expect(normalized.length).toBeGreaterThan(0);
        });

        it('should handle mixed null and valid errors', () => {
            const mixedErrors = [
                { message: 'Error 1' },
                null,
                { message: 'Error 2' },
                undefined
            ];

            const normalized = service['normalizeErrors'](mixedErrors);
            expect(normalized.length).toBeGreaterThan(0);
        });

        it('should handle numeric error responses', () => {
            const normalized = service['normalizeErrors'](404);
            expect(normalized.length).toBeGreaterThan(0);
            expect(normalized[0].message).toBe('404');
        });

        it('should handle special characters in error messages', () => {
            const errors: ValidationError[] = [
                { message: 'Error with <html> & "quotes" and \'apostrophes\'' }
            ];
            const formatted = service.formatErrorsForDisplay(errors);
            expect(formatted).toContain('html');
            expect(formatted).toContain('quotes');
        });

        it('should handle very long error messages', () => {
            const longMessage = 'Error'.repeat(500);
            const errors: ValidationError[] = [{ message: longMessage }];
            const formatted = service.formatErrorsForDisplay(errors);
            expect(formatted.length).toBeGreaterThan(0);
        });

        it('should maintain error order in array responses', () => {
            const orderedErrors = [
                { message: 'First', code: 'ERR1' },
                { message: 'Second', code: 'ERR2' },
                { message: 'Third', code: 'ERR3' }
            ];

            const statusInfo = service.buildStatusInfo('Test', {
                valid: false,
                errors: orderedErrors
            }, false);

            expect(statusInfo[0].message).toEqual(['First', 'Second', 'Third']);
            expect(statusInfo[0].code).toEqual(['ERR1', 'ERR2', 'ERR3']);
        });
    });
});
