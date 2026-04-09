import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { ApiService } from 'sb-shared-lib';
import { API_ENDPOINTS } from '../_models/api-endpoints';
import { NotificationService } from './notification.service';

/**
 * JSON Schema Validation Service
 * Validates JSON structures against backend schemas before saving
 * Uses backend endpoint: ?get=core_json-validate
 */

export interface ValidationError {
    field?: string;
    path?: string;
    message: string;
    code?: string;
}

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
}

export interface ValidationStatusInfo {
    icon?: string;
    tooltip?: string;
    label: string;
    value: string;
    code?: string[];
    field?: string[];
    message?: string[];
    path?: string[];
}

export type SchemaType = 'view' | 'field' | 'action' | 'policy' | 'role' | 'workflow' | 'menu' | 'route';

@Injectable({
    providedIn: 'root'
})
export class JsonValidationService {

    constructor(private api: ApiService, private notificationService: NotificationService) { }

    /**
     * Validate JSON against a schema, then call a save function if valid.
     * Handles isSaving state, notifications on success/failure/error.
     *
     * @param validate$ - Observable from any validateXxx() method
     * @param saveFn - Factory returning the save Observable (called only if validation passes)
     * @param setIsSaving - Callback to toggle the component's isSaving flag
     */
    public validateAndSave(
        validate$: Observable<ValidationResult>,
        saveFn: () => Observable<{ success?: boolean; message?: string } | void>,
        setIsSaving: (saving: boolean) => void
    ): void {
        setIsSaving(true);
        validate$.subscribe(
            (validationResult) => {
                if (validationResult.valid) {
                    saveFn().subscribe(
                        (result) => {
                            setIsSaving(false);
                            const saveResult = result || {};
                            const wasSuccessful = typeof saveResult.success === 'boolean' ? saveResult.success : true;
                            const saveMessage = saveResult.message || (wasSuccessful ? 'Saved successfully' : 'Save failed');

                            if (wasSuccessful) {
                                this.notificationService.showSuccess(saveMessage);
                            } else {
                                this.notificationService.showError(saveMessage);
                            }
                        },
                        (error) => {
                            setIsSaving(false);
                            this.notificationService.showError('Save error: ' + (error.message || 'Unknown error'));
                        }
                    );
                } else {
                    setIsSaving(false);
                    const summary = this.getErrorSummary(validationResult);
                    const details = this.formatErrorsForDisplay(validationResult.errors);
                    this.notificationService.showError(summary + '\n\n' + details);
                }
            },
            (error) => {
                setIsSaving(false);
                this.notificationService.showError('Validation error: ' + (error.message || 'Failed to validate'));
            }
        );
    }

    /**
     * Validate JSON against a schema
     * @param json - The JSON data to validate
     * @param schemaId - The schema identifier (e.g., 'view.form', 'controller')
     * @param packageName - Optional package name for context-based validation
     * @param strict - Optional strict validation mode
     * @returns Observable<ValidationResult>
     */
    public validate(
        json: any,
        schemaId: string,
        packageName?: string,
        strict?: boolean
    ): Observable<ValidationResult> {
        const normalizedSchemaId = this.normalizeSchemaId(schemaId);
        const url = API_ENDPOINTS.json.validate(json, normalizedSchemaId, packageName, strict);

        return this.callValidateApi(url);
    }

    /**
     * Validate a View structure
     */
    public validateView(viewData: any, schema_id: string, packageName?: string): Observable<ValidationResult> {
        return this.validate(viewData, schema_id, packageName);
    }

    /**
     * Validate a structure for a given schema type
     */
    public validateBySchemaType(data: any, schemaType: string, packageName?: string): Observable<ValidationResult> {
        return this.validate(data, schemaType, packageName);
    }

    private normalizeSchemaId(schemaId: string): string {
        if (!schemaId) {
            return schemaId;
        }

        if (schemaId.startsWith('urn:')) {
            return schemaId;
        }

        const normalizedKey = schemaId.endsWith('.schema')
            ? schemaId.slice(0, -'.schema'.length)
            : schemaId;

        const mapped: { [id: string]: string } = {
            model: 'urn:equal:json-schema:core:model',
            controller: 'urn:equal:json-schema:core:controller',
            view: 'urn:equal:json-schema:core:view',
            menu: 'urn:equal:json-schema:core:menu',
            'model-translations': 'urn:equal:json-schema:core:model-translations',
            'menu-translations': 'urn:equal:json-schema:core:menu-translations',
        };

        return mapped[normalizedKey] || schemaId;
    }

    /**
     * Build a compact status payload for the shared info header.
     */
    public buildStatusInfo(
        label: string,
        result: ValidationResult | null,
        loading: boolean = false,
        errorMessage: string = ''
    ): ValidationStatusInfo[] {
        if (loading) {
            return [{
                label,
                value: 'Checking...',
                icon: 'hourglass_top',
                tooltip: 'Validation in progress'
            }];
        }

        if (errorMessage) {
            return [{
                label,
                value: errorMessage,
                icon: 'error',
                tooltip: errorMessage,
            }];
        }

        if (!result) {
            return [{
                label,
                value: 'Not checked',
                icon: 'info',
                tooltip: 'Validation was not run'
            }];
        }

        if (result.valid) {
            return [{
                label,
                value: 'Passed',
                icon: 'check_circle',
                tooltip: 'JSON validates against the schema'
            }];
        }

        const errorCount = result.errors?.length || 0;
        if (errorCount > 1) {
            return [{
                label,
                value: `Failed: ${errorCount} errors`,
                icon: 'error',
                tooltip: `Validation failed with ${errorCount} errors.`,
                code: result.errors?.map(e => e.code || '') || [],
                field: result.errors?.map(e => e.field || '') || [],
                message: result.errors?.map(e => e.message || '') || [],
                path: result.errors?.map(e => e.path || '') || []
            }];
        }
        return [{
            label,
            value: `Failed: ${errorCount} error`,
            icon: 'error',
            tooltip: 'Validation failed',
            code: [result.errors?.[0]?.code || ''],
            field: [result.errors?.[0]?.field || ''],
            message: [result.errors?.[0]?.message || ''],
            path: [result.errors?.[0]?.path || '']
        }];
    }

    /**
     * Format validation errors for display to user
     */
    public formatErrorsForDisplay(errors: ValidationError[]): string {
        const normalizedErrors = this.normalizeErrors(errors);

        if (normalizedErrors.length === 0) {
            return '';
        }
        let formatted = 'Validation errors:\n';
        for (const error of normalizedErrors) {
            const fieldInfo = error.field ? `Field: ${error.field}` : '';
            const pathInfo = error.path ? `Path: ${error.path}` : '';
            const messageInfo = error.message ? `Message: ${error.message}` : '';
            const codeInfo = error.code ? `Code: ${error.code}` : '';
            const errorDetails = [fieldInfo, pathInfo, messageInfo, codeInfo].filter(info => info).join(' | ');
            formatted += `- ${errorDetails}\n`;
        }
        return formatted;
    }

    /**
     * Get a summary of all errors
     */
    public getErrorSummary(result: ValidationResult): string {
        if (result.valid) {
            return 'Validation successful';
        }
        const errorCount = result.errors?.length || 0;
        return `Validation failed: ${errorCount} error(s)`;
    }

    /**
     * Call the validation API
     */
    private callValidateApi(url: string): Observable<ValidationResult> {
        return new Observable(observer => {
            this.api.fetch(url, {}).then(
                (response: any) => {
                    const valid = (typeof response.valid !== 'undefined')
                        ? !!response.valid
                        : (typeof response.result !== 'undefined')
                            ? !!response.result
                            : false;

                    const result: ValidationResult = {
                        valid,
                        errors: this.normalizeErrors(response.errors),
                    };
                    observer.next(result);
                    observer.complete();
                },
                (error: any) => {
                    console.error('Validation API error:', error);
                    const result: ValidationResult = {
                        valid: false,
                        errors: [{ message: error.message || 'Validation request failed' }],
                    };
                    observer.next(result);
                    observer.complete();
                }
            );
        });
    }

    private normalizeErrors(errors: unknown): ValidationError[] {
        if (!errors) {
            return [];
        }

        if (Array.isArray(errors)) {
            return errors.flatMap((error: any) => this.normalizeSingleError(error));
        }

        if (typeof errors === 'string') {
            return [{ message: errors }];
        }

        if (typeof errors === 'object') {
            return Object.entries(errors as Record<string, unknown>).flatMap(([path, value]) => {
                if (Array.isArray(value)) {
                    return value.flatMap((entry: any) => {
                        if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
                            return this.normalizeSingleError({ ...entry, path: (entry as any).path || path });
                        }
                        return this.normalizeSingleError({ path, message: String(entry) });
                    });
                }

                if (value && typeof value === 'object') {
                    return this.normalizeSingleError({ ...(value as Record<string, unknown>), path });
                }

                return this.normalizeSingleError({ path, message: String(value) });
            });
        }

        return [{ message: String(errors) }];
    }

    private normalizeSingleError(error: any): ValidationError[] {
        if (!error) {
            return [];
        }

        if (typeof error === 'string') {
            return [{ message: error }];
        }

        if (typeof error === 'object' && !Array.isArray(error)) {
            const message = typeof error.message === 'string'
                ? error.message
                : typeof error.detail === 'string'
                    ? error.detail
                    : typeof error.error === 'string'
                        ? error.error
                        : JSON.stringify(error);

            return [{
                field: typeof error.field === 'string' ? error.field : undefined,
                path: typeof error.path === 'string' ? error.path : undefined,
                message,
                code: typeof error.code === 'string' ? error.code : undefined,
            }];
        }

        return [{ message: String(error) }];
    }
}
