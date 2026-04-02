import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { ApiService } from 'sb-shared-lib';
import { API_ENDPOINTS } from '../_models/api-endpoints';

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

    constructor(private api: ApiService) { }

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
        console.log('Validating JSON against schema:', schemaId, 'Package:', packageName, 'Strict mode:', strict);
        const url = API_ENDPOINTS.json.validate(json, schemaId, packageName, strict);

        return this.callValidateApi(url);
    }

    /**
     * Validate a View structure
     */
    public validateView(viewData: any, schema_id: string, packageName?: string): Observable<ValidationResult> {
        return this.validate(viewData, schema_id, packageName);
    }

    /**
     * Validate an Action structure
     */
    public validateAction(actionData: any, packageName?: string): Observable<ValidationResult> {
        return this.validate(actionData, 'action.schema', packageName);
    }

    /**
     * Validate a Policy structure
     */
    public validatePolicy(policyData: any, packageName?: string): Observable<ValidationResult> {
        return this.validate(policyData, 'policy.schema', packageName);
    }

    /**
     * Validate a Field structure
     */
    public validateField(fieldData: any, packageName?: string): Observable<ValidationResult> {
        return this.validate(fieldData, 'field.schema', packageName);
    }

    /**
     * Validate a Menu structure
     */
    public validateMenu(menuData: any, packageName?: string): Observable<ValidationResult> {
        return this.validate(menuData, 'menu.schema', packageName);
    }

    /**
     * Validate a Role structure
     */
    public validateRole(roleData: any, packageName?: string): Observable<ValidationResult> {
        return this.validate(roleData, 'role.schema', packageName);
    }

    /**
     * Validate a Workflow structure
     */
    public validateWorkflow(workflowData: any, packageName?: string): Observable<ValidationResult> {
        return this.validate(workflowData, 'workflow.schema', packageName);
    }

    /**
     * Validate a Route structure
     */
    public validateRoute(routeData: any, packageName?: string): Observable<ValidationResult> {
        return this.validate(routeData, 'route.schema', packageName);
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
        console.log('Validation failed with errors:', result.errors);
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
        console.log('Formatting validation errors for display:', normalizedErrors);
        for (const error of normalizedErrors) {
            const fieldInfo = error.field ? `Field: ${error.field}` : '';
            const pathInfo = error.path ? `Path: ${error.path}` : '';
            const messageInfo = error.message ? `Message: ${error.message}` : '';
            const codeInfo = error.code ? `Code: ${error.code}` : '';
            const errorDetails = [fieldInfo, pathInfo, messageInfo, codeInfo].filter(info => info).join(' | ');
            console.log('Formatted error details:', errorDetails);
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
                    console.log('Validation API response:', response, 'Is valid:', valid, 'Result object:', result);
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
