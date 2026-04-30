import { HttpErrorResponse} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, from, Observable, of, } from 'rxjs';
import { catchError, map, mergeMap, switchMap, tap, toArray } from 'rxjs/operators';
import { ApiService } from 'sb-shared-lib';
import { API_ENDPOINTS } from '../_models/api-endpoints';
import { EqualComponentDescriptor } from '../_models/equal-component-descriptor.class';
import { PackageInfos, PackageSummary } from '../_models/package-info.model';
import { ViewSchema } from '../_models/view-schema.model';
import { PolicyResponse } from '../_models/policy.model';
import { Actions } from '../_models/actions.model';
import { convertRights, convertRightsFromStrings, Right, Roles } from '../_models/roles.model';

type CallApiOptions = {
    successMessage?: string;
    errorMessage?: string;
};


@Injectable({
    providedIn: 'root'
})
export class WorkbenchService {

    private packageConsistencyCache: Map<string, any> = new Map<string, any>();

    constructor(
        private api: ApiService,
    ) {}

    /**
     * Creates a new component based on the type specified in the node.
     * It supports creating packages, classes, and controllers (with classes and controllers not implemented yet).
     *
     * @param node The component descriptor containing details of the component to create.
     * @returns An observable that emits a success or error message.
     */
    public createNode(node: EqualComponentDescriptor): Observable<any> {
        const createActions: Record<string, () => Observable<any>> = {
            package: () => this.createPackage(node.name),
            class: () => this.createClass(node.package_name, node.name, node.item.subtype),
            get: () => this.createController(node.package_name, node.name, node.type),
            do: () => this.createController(node.package_name, node.name, node.type),
            view: () => {
                    const viewName = node.name.split(':')[1];
                    return this.createView(node.package_name,node.item.model, viewName);
            },
            menu: () => this.createMenu(node.package_name, node.name, node.item.subtype),
            route: () => {
                        const fileName = node.file.split('/').pop()?.trim() ??'';
                        return this.createRoute(node.package_name,fileName,node.name)
            },
            policy: () =>  this.createPolicy(node.package_name,node.item.model, node.name),
            role: () => this.createRole(node.package_name,node.item.model, node.name)


        };

        // Return the appropriate observable based on the node type, or a default message for unknown types.
        return createActions[node.type]?.() || of({ message: 'Unknown type' });
    }
    private createRole(package_name: string, model: any, name: string): Observable<any> {
        const url = '?do=core_config_create-role';
        const payload = { entity: `${package_name}\\${model}`, name };
        return this.callApi(url, payload, { successMessage: `Role ${name} created` });
    }


    private createPolicy(package_name:string,class_name:string,policy_name:string){
        const url = '?do=core_config_create-policy';
        const payload = { entity: `${package_name}\\${class_name}`, name: policy_name };
        return this.callApi(url, payload, { successMessage: `Policy ${policy_name} created` });
    }


    /**
    * Deletes a component based on the type specified in the node.
    * It supports deleting packages (other types are not implemented).
    *
    * @param node The component descriptor containing details of the component to delete.
    * @returns An observable that emits a success or error message.
    */
    public deleteNode(node: EqualComponentDescriptor): Observable<any> {
        const deleteActions: Record<string, () => Observable<any>> = {
            package: () => this.deletePackage(node.name),
            class: () => this.deleteClass(node.package_name,node.name),
            get: () => this.deleteController(node.package_name, node.name, node.type),
            do: () => this.deleteController(node.package_name, node.name, node.type),
            view: () => {
                const viewName = node.name.split(':')[1];
                return this.deleteView(node.package_name,node.item.model, viewName);
            },
            menu: () => this.deleteMenu(node.package_name,node.name),
            route: () =>this.notImplemented(`Deleting route not implemented`)
        };

        // Return the appropriate observable based on the node type, or a default message for unknown types.
        return deleteActions[node.type]?.() || of({ message: 'Unknown type' });
    }

    /**
     * Reads the menu configuration for a given package and menu name.
     *
     * @param package_name The name of the package containing the menu.
     * @param menu_name The name of the menu to be read.
     * @returns Observable containing the response of the menu read request.
     */
    public readMenu(package_name: string, menu_name: string): Observable<any> {
        const url = API_ENDPOINTS.menu.read(package_name, menu_name);
        return from(this.api.fetch(url)).pipe(
          map((res: any) => res)
        );
      }

    /**
     * Reads the view configuration for a given package, model, and view name.
     *
     * @param package_name The name of the package containing the model.
     * @param view_name The name of the view to be read.
     * @param model_name The name of the model for which the view is configured.
     * @returns Observable containing the response of the view read request.
     */
    public readView(package_name: string, view_name: string, model_name: string): Observable<ViewSchema> {
        const url = '?get=core_model_view';
        const payload = { view_id: view_name, entity: `${package_name}\\${model_name}` };
        return this.callApi(url, payload).pipe(
            map(({ response }) => response)
        );
    }

    public getPolicies(package_name: string, class_name:string): Observable<PolicyResponse>{
        const url = '?get=core_model_policies';
        const payload = { entity: `${package_name}\\${class_name}` };
        return this.callApi(url, payload).pipe(
            map(({success, response})=> success ? response: [])
        );
    }

    public getActions(package_name:string, class_name:string):Observable<Actions>{
        const url = '?get=core_model_actions';
        const payload = { entity: `${package_name}\\${class_name}` };
        return this.callApi(url, payload).pipe(
            map(({success, response})=> success ? response: [])
        );
    }

    public getRoles(package_name: string, class_name: string): Observable<Roles> {
        const url = '?get=core_model_roles';
        const payload = { entity: `${package_name}\\${class_name}` };
        return this.callApi(url, payload).pipe(
            map(({ response }) => {
                Object.keys(response).forEach(roleKey => {
                    const role = response[roleKey];

                    if (Array.isArray(role.rights)) {
                        role.rights = convertRightsFromStrings(role.rights);
                    } else if (typeof role.rights === 'number') {
                        role.rights = convertRights(role.rights);
                    }

                    if (!role.implied_by) {
                        role.implied_by = [];
                    }
                });
                return response;
            })
        );
    }

    public collect(
        entity:string, 
        domain:any[], 
        fields:any[], 
        order:string='id', 
        sort:string='asc', 
        start:number=0, 
        limit:number=25, 
        lang: string = ''): Observable<any> {
        return from(this.api.collect(entity, domain, fields, order, sort, start, limit, lang));
    }

    public collectAllLanguagesCode(): Observable<string[]> {
        return this.collect('core\\Lang',[],['code']).pipe(
            map(response => response.map((lang: { code: string }) => lang.code))
        );
    }
    public saveActions(package_name:string, class_name:string,payload:any): Observable<any>{
        const url = '?do=core_config_update-actions';
        return this.callApi(url, { entity: `${package_name}\\${class_name}`, payload }, { successMessage: 'Actions saved' });
    }

    public savePolicies(package_name:string, class_name:string, payload:any): Observable<any>{
        const url = '?do=core_config_update-policies';
        return this.callApi(url, { entity: `${package_name}\\${class_name}`, payload }, { successMessage: 'Policies saved' });
    }

    public saveRoles(package_name:string, class_name:string, payload:any): Observable<any>{
        const url = '?do=core_config_update-roles';
        return this.callApi(url, { entity: `${package_name}\\${class_name}`, payload }, { successMessage: 'Roles saved' });
    }
    /**
     * Updates the fields for a given class in a specified package.
     *
     * @param new_schema The new schema to be applied to the class fields.
     * @param package_name The name of the package containing the class.
     * @param class_name The name of the class whose fields need to be updated.
     * @returns Observable indicating the success of the update operation.
     */
    public updateFieldsFromClass(new_schema: {}, package_name: string, class_name: string): Observable<any> {
        const url = '?do=config_update-model';
        const payload = {
            part: 'class',
            entity: `${package_name}\\${class_name}`,
            payload: JSON.stringify(new_schema)
        };
        const successfullyMessage = `Fields from ${package_name}//${class_name} has been updated`;
        return this.callApi(url, payload, { successMessage: successfullyMessage });
    }

    /**
     * Updates a given controller with the provided payload.
     *
     * @param controller_name The name of the controller to be updated.
     * @param controller_type The type of the controller (e.g., 'data', 'actions').
     * @param payload The payload containing the data to update the controller.
     * @returns Observable indicating the success of the update operation.
     */
    public updateController(
        package_name: string, 
        controller_name: string, 
        controller_type: string, 
        payload: { [id: string]: any }): Observable<any> {
        const url = '?do=core_config_update-controller';
        const requestPayload = {
            controller: `${package_name}_${controller_name}`,
            operation: controller_type,
            payload: JSON.stringify(payload)
        };
        const successfullyMessage = `${controller_name} has been updated`;
        return this.callApi(url, requestPayload, { successMessage: successfullyMessage });
    }


    /**
     * Fetches the workflow data.
     * @param package_name The package name.
     * @param model The model name.
     * @returns An Observable containing the workflow data.
     */
    public getWorkflow(package_name: string, model: string): Observable<any> {
        const url = API_ENDPOINTS.workflow.get(package_name,model)
        return from(this.api.get(url)).pipe(
            switchMap(info => of({ exists: true, info })),
            catchError((e: any) => {
            const cast: HttpErrorResponse = e;
            if (cast.status === 404) {
                return of({ exists: false, info: {} });
            } else {
                this.api.errorFeedback(e);
                return of({});
            }
            })
        );
        }

    /**
     * Saves the workflow data.
     * @param package_name The package name.
     * @param model The model name.
     * @param payload The payload to save.
     * @returns An Observable that resolves to a boolean indicating success.
     */
    public saveWorkflow(package_name: string, model: string, payload: string): Observable<boolean> {
        const url = API_ENDPOINTS.workflow.save(package_name,model);
        return from(this.api.post(url, { payload })).pipe(
            switchMap(() => of(true)),
            catchError(e => {
            console.error(e);
            this.api.errorFeedback(e);
            return of(false);
            })
        );
    }

    /**
     * Creates a new workflow.
     * @param package_name The package name.
     * @param model The model name.
     * @returns An Observable that resolves to a boolean indicating success.
     */
    public createWorkflow(package_name: string, model: string): Observable<any> {
        const url = API_ENDPOINTS.workflow.create(package_name,model);
        return from(this.api.post(url)).pipe(
            switchMap(() => of(true)),
            catchError(e => {
            console.error(e);
            this.api.errorFeedback(e);
            return of(false);
            })
        );
    }

    /**
     * Fetches metadata for a given code and reference.
     * @param code The code for the metadata.
     * @param reference The reference for the metadata.
     * @returns An Observable containing the metadata.
     */
    public fetchMetaData(code: string, reference: string): Observable<any[]> {
        const url = API_ENDPOINTS.metadata.collect(code,reference);
        return from(this.api.get(url)).pipe(
            switchMap((data: any[]) => of(data)),
            catchError(e => {
            console.error(e);
            this.api.errorFeedback(e);
            return of([]);
            })
        );
    }

    /**
     * Creates metadata for a given code and reference.
     * @param code The code for the metadata.
     * @param reference The reference for the metadata.
     * @param payload The payload for the metadata.
     * @returns An Observable that resolves to a boolean indicating success.
     */
    public createMetaData(code: string, reference: string, payload: string): Observable<any> {
        return from(this.api.post(`?do=core_model_create&entity=core\\Meta`, { fields: { value: payload, code: code, reference: reference } })).pipe(
            switchMap(() => of(true)),
            catchError(e => {
                console.error(e);
                this.api.errorFeedback(e);
                return of(false);
            })
        );
    }

    /**
     * Saves the metadata.
     * @param id The ID of the metadata.
     * @param payload The payload for the metadata.
     * @returns An Observable that resolves to a boolean indicating success.
     */
    public saveMetaData(id: number, payload: string): Observable<any> {
        return from(this.api.post(`?do=core_model_update&entity=core\\Meta&id=${id}`, { fields: { value: payload } })).pipe(
            switchMap(() => of(true)),
            catchError(e => {
                console.error(e);
                this.api.errorFeedback(e);
                return of(false);
            })
        );
    }

    /**
     * Fetches the schema for a given entity.
     * @param entity The entity name.
     * @returns An Observable containing the schema or an empty object in case of error.
     */
    public getSchema(entity: string): Observable<any> {
        if (entity) {
          const url = '?get=core_model_schema';
          return this.callApi(url, { entity }).pipe(
            map(result => result.response),
            catchError((response: any) => {
              console.warn('Request error:', response);
              return of({ fields: [] });
            })
          );
        }
        return of({ fields: [] });
      }



    public saveView(payload:any, package_name: string, model:string,view_id:string):Observable<any>{
        const url = '?do=core_config_update-view';
        const requestPayload = {
            entity: `${package_name}\\${model}`,
            view_id,
            payload: JSON.stringify(payload)
        };
        const successfullyMessage = `${view_id} has been updated`
        return this.callApi(url, requestPayload, { successMessage: successfullyMessage });
    }

    public readPackage(package_name: string): Observable<{ response: PackageSummary; message: string }> {
        const url = '?get=packageinfo';
        return this.callApi(url, { package: package_name }).pipe(
            map(({ response, message }) => {
                const packageInfo: PackageInfos = response;

                const transformedResponse: PackageSummary = {
                    name: packageInfo.name,
                    description: packageInfo.description,
                    version: packageInfo.version,
                    authors: packageInfo.authors,
                    depends_on: packageInfo.depends_on,
                    apps: packageInfo.apps?.map(app => ({
                        appName: app.name?? app,
                        appIcon: app.icon,
                        appDescription: app.description
                    }))
                };

                return { response: transformedResponse || null, message };
            })
        );
    }



    public InitPackage(
        package_name: string,
        do_import: boolean,
        do_cascade: boolean,
        do_import_cascade: boolean
      ): Observable<any> {
        const url = '?do=core_init_package';
        const payload: any = {
            package: package_name,
            cascade: do_cascade ? 'true' : 'false',
            import_cascade: do_import_cascade ? 'true' : 'false',
            force: 'true'
        };

        if (do_import) {
            payload.import = 'true';
        }

        return this.callApi(url, payload).pipe(
          map(({ response }) => response)
        );
      }

    public getInitializedPackages(): Observable<any> {
        const url = `?get=core_config_live_packages`;
        return this.callApi(url).pipe(
            map(({ response }) => response)
        );
    }

    public checkPackageConsistency(package_name: string): Observable<any> {
        if (package_name.length <= 0) {
            console.warn(`Ignoring empty package`);
            return of([]);
        }
        const url = '?do=test_package-consistency';
        return this.callApi(url, { package: package_name, force: 'true' });
    }

    public getCachedPackageConsistency(package_name: string): any | null {
        if (!package_name || package_name.length <= 0) {
            return null;
        }

        return this.packageConsistencyCache.get(package_name) ?? null;
    }

    public setCachedPackageConsistency(package_name: string, result: any): void {
        if (!package_name || package_name.length <= 0 || !result) {
            return;
        }

        this.packageConsistencyCache.set(package_name, result);
    }

    public clearCachedPackageConsistency(package_name?: string): void {
        if (!package_name) {
            this.packageConsistencyCache.clear();
            return;
        }

        this.packageConsistencyCache.delete(package_name);
    }

    /**
     * Handles cases where a feature has not been implemented.
     * Logs a warning and returns an observable with the given message.
     *
     * @param message The message to log and return in the observable.
     * @returns An observable containing the message.
     */
    private notImplemented(message: string): Observable<any> {
        console.warn(message);
        return of({ message });
    }

    /**
     * Sends a request to create a package in the backend system.
     *
     * @param package_name The name of the package to create.
     * @returns An observable that emits the result of the package creation, including a success or error message.
     */
    private createPackage(package_name: string): Observable<any> {
        const url = '?do=core_config_create-package';
        const successfullyMessage=`Package ${package_name} created successfully!`
        return this.callApi(url, { package: package_name }, { successMessage: successfullyMessage });
    }

    /**
     * Sends a request to delete a package in the backend system.
     *
     * @param package_name The name of the package to delete.
     * @returns An observable that emits the result of the package deletion, including a success or error message.
     */
    private deletePackage(package_name: string): Observable<any> {
        const url = '?do=core_config_delete-package';
        const successfullyMessage=`Package ${package_name} deleted successfully!`
        return this.callApi(url, { package: package_name }, { successMessage: successfullyMessage });
    }


    /**
    * Creates a new class within the specified package, potentially inheriting from a parent class.
    *
    * @param {string} package_name - The name of the package where the new class will be created.
    * @param {string} class_name - The name of the new class to be created.
    * @param {string} parent - The name of the parent class that the new class will extend. Defaults to "equal\\orm\\Model".
    *
    * @returns {Observable<{ success: boolean, message: string, response?: string, error?: any }>}
    * An observable that emits an object containing the success status, a message, and optionally,
    * the response or error details if the class creation fails.
    *
    */
    private createClass(package_name: string, class_name: string, parent: string): Observable<any> {
    const url = '?do=core_config_create-model';
    const payload: any = { model: class_name, package: package_name };
    if (parent !== 'equal\\orm\\Model') {
        payload.extends = parent.replace(/\\/g, '\\\\');
    }
    const successfullyMessage = `Class ${class_name} created successfully!`;
    return this.callApi(url, payload, { successMessage: successfullyMessage });
    }

    private deleteClass(package_name: string, class_name: string): Observable<any> {
        const url = '?do=core_config_delete-model';
        const successfullyMessage = `Class ${class_name} deleted successfully!`;
        return this.callApi(url, { package: package_name, model: class_name }, { successMessage: successfullyMessage });
    }

    private createView(package_name:string, model_name: string, view_name: string): Observable<any> {
        const url = '?do=core_config_create-view';
        const payload = { view_id: view_name, entity: `${package_name}\\${model_name}` };
        const successfullyMessage = `View ${view_name} created successfully!`;
        return this.callApi(url, payload, { successMessage: successfullyMessage });
    }

    private deleteView(package_name: string, model_name: string, view_name: string): Observable<any>{
        const url = '?do=core_config_delete-view';
        const payload = { entity: `${package_name}\\${model_name}`, view_id: view_name };
        const successfullyMessage = `View ${model_name}:${view_name} deleted successfully!`;
        return this.callApi(url, payload, { successMessage: successfullyMessage });
    }


    private createController(package_name: string, controller_name: string, controller_type: string): Observable<any> {
        const url = '?do=core_config_create-controller';
        const payload = {
            controller_name,
            controller_type,
            package: package_name
        };
        const successfullyMessage = `Controller ${controller_name} of type ${controller_type} created successfully!`;
        return this.callApi(url, payload, { successMessage: successfullyMessage });
    }

    private deleteController(package_name: string, controller_name: string, controller_type: string): Observable<any> {
        const url = '?do=core_config_delete-controller';
        const payload = {
            package: package_name,
            controller_name,
            controller_type
        };
        const successfullyMessage = `Controller ${controller_name} of type ${controller_type} deleted successfully!`;
        return this.callApi(url, payload, { successMessage: successfullyMessage });
    }

    private createMenu(package_name: string, menu_name: string, menu_type: string): Observable<any> {
        const url = '?do=core_config_create-view';
        const payload = { view_id: `${menu_name}.${menu_type}`, entity: `${package_name}\\menu` };
        const successfullyMessage = `Menu ${menu_name} of type ${menu_type} created successfully!`;
        return this.callApi(url, payload, { successMessage: successfullyMessage });
    }

    private deleteMenu(package_name: string, menu_name: string): Observable<any> {
        const url = '?do=core_config_delete-view';
        const payload = { entity: `${package_name}\\menu`, view_id: menu_name };
        const successfullyMessage = `Menu ${menu_name} deleted successfully!`;
        return this.callApi(url, payload, { successMessage: successfullyMessage });
    }

    private createRoute(package_name: string, file_name: string, route_name: string): Observable<any> {
        const url = '?do=core_config_create-route';
        const payload = { package: package_name, file: file_name, url: route_name };
        const successfullyMessage=`Route ${route_name} created successfully!`;
        return this.callApi(url, payload, { successMessage: successfullyMessage });
    }

    /**
     * Calls the API and processes the response.
     *
     * This method makes an API call using the provided URL and request body, then processes the response.
     * On success, it returns the response along with a success message. On failure, it catches the error,
     * logs it to the console, and returns an error message along with the error details.
     *
     * @param {string} url - The URL endpoint for the API request.
     * @param {any} [payload={}] - The request payload to be sent with the API call. Defaults to an empty object.
     * @param {CallApiOptions} [options={}] - Optional success and error messages for the API call.
     *
     * @returns {Observable<{ success: boolean, message: string, response: any }>} An observable containing the result of the API call.
     *  - success: A boolean indicating whether the API call was successful (`true` if successful, `false` if failed).
     *  - message: A string providing a success or error message.
     *  - response: The response from the API if successful, or the error details if failed.
     *
     * Example usage:
     * ```typescript
     * this.callApi('/endpoint', {}, { successMessage: 'Data fetched successfully' })
     *   .subscribe(result => {
     *     if (result.success) {
     *       console.log(result.message); // Success message
     *       console.log(result.response); // API response
     *     } else {
     *       console.error(result.message); // Error message
     *       console.error(result.response); // Error details
     *     }
     *   });
     * ```
     */
    private callApi(
        url: string,
        payload: any = {},
        options: CallApiOptions = {}
    ): Observable<{ success: boolean; message: string; response: any; }> {
        const { successMessage = '', errorMessage } = options;
        return new Observable(observer => {
            this.api.call(url, payload).then(
                (response: any) => {
                    observer.next({
                        success: true,
                        message: successMessage,
                        response: response || null
                    });
                    observer.complete();
                },
                (response: any) => {
                    console.error("Error details:", response);
                    let message = errorMessage ?? 'Error: ';
                    if (response.error && response.error.errors) {
                        let errorDetails = response.error.errors;
                        const details: string[] = [];
                        for (const [key, value] of Object.entries(errorDetails)) {
                            details.push(`${key}: ${value}`);
                        }
                        message = `${message}\n${details.join('\n')}`;
                    } else {
                        message = errorMessage ?? `Error: ${response.message}`;
                    }
                    observer.next({
                        success: false,
                        message,
                        response: response
                    });
                    observer.complete();
                }
            );
        });
    }

///////////////////// Functions that should need refactoring because it can still contain duplication functions
    /**
     * @deprecated
     * @todo for a better centralized logic, try to use equalComponentProviderService
     * @tag EqualComponentProvider to use
     */
    public collectAllPackages(): Observable<string[]> {
        const url = '?get=config_packages';
        return this.callApi(url).pipe(
            map((result: any) => result.response || [])
        );
        }

    /**
     * @deprecated
     * @todo use equalComponentProvider
     * @tag EqualComponentProvider
     * */
    public collectViews(package_name: string, entity?: string): Observable<string[]> {
        const url = '?get=core_config_views';
        const payload = entity === undefined
            ? { package: package_name }
            : { entity: `${package_name}\\${entity}` };
        return this.callApi(url, payload).pipe(
            map((result: any) => result.response || [])
        );
        }





    /**
     * @deprecated
     * @todo use equalComponentProvider
     * @tag EqualComponentProvider
     */
    public getMenusByPackage(package_name: string): Observable<string[]> {
        const url = '?get=core_config_menus';
        return this.callApi(url, { package: package_name }).pipe(
            map((result: any) => result.response || [])
        );
        }


    /**
     * @deprecated
     * @todo use equalComponentProvider
     * @tag EqualComponentProvider
     */
    public getRoutesByPackage(package_name: string): Observable<any> {
        const url = '?get=core_config_routes';
        return this.callApi(url, { package: package_name }).pipe(
            map((result: any) => result.response)
        );
        }



    public getAllRouteFiles(): Observable<string[]> {
        const packagesUrl = '?get=core_config_packages';
        return this.callApi(packagesUrl).pipe(
            switchMap((result: any) => {
            const packs: string[] = result.response || [];
            const observables = packs.map(package_name => {
                const url = '?get=core_config_routes';
                return this.callApi(url, { package: package_name }).pipe(
                map((res: any) => Object.keys(res.response || {}))
                );
            });
            return observables.length > 0 ? forkJoin(observables) : of([]);
            }),
            map((arrays: string[][]) => arrays.flat())
        );
    }




 //////////////////////////////////////// // Method from embedded Api, I just copied them here to delete embedded api need a refactoring (currently in refactoring step)


    /**
     * Return the respond of a controller after execution
     *
     * @param string type_controller the act
     * @param string eq_package name of the
     * @param string name of the controller
     * @param array all the parameters for the controller
     * @returns array with the respond of a controller's execution
     */
    public submitController(type_controller: string, controller_name: string, params: any[]): Observable<any> {
        const payload: any = {};
        for (let key in params) {
            payload[key] = Array.isArray(params[key])
                ? JSON.stringify(params[key])
                : params[key];
        }

        const url = `?${type_controller}=${controller_name}`;
        return this.callApi(url, payload).pipe();
    }


    /**
     * Collects core configuration classes or lists all models with optional formatting.
     *
     * This method can either fetch the core configuration classes or list all models depending on the passed parameters.
     * It applies formatting if the `format` flag is set to `true`.
     *
     * @param {boolean} format - If `true`, the result will be formatted by combining the model type and model name.
     * @returns {Observable<any>} An observable that emits the response or formatted models list.
     */
    public collectClasses(format: boolean = false): Observable<any> {
        const url = '?get=core_config_classes';
        return this.callApi(url).pipe(
            map((result: any) => {
                const x = result.response;

                // If format is false, return the raw response
                if (!format) {
                    return x;
                }

                // If format is true, return a list of formatted models
                let ret: string[] = [];
                for (const key in x) {
                    for (const item of x[key]) {
                        ret.push(`${key}\\${item}`);
                    }
                }
                return ret;
            })
        );
    }


    /**
     * Fetches the available configuration types.
     *
     * This method retrieves the list of configuration types from the backend.
     *
     * @returns {Observable<any>} An observable that emits the response containing the configuration types.
     */
    public getTypes(): Observable<any> {
        const url = '?get=config_types';
        return this.callApi(url).pipe(
            map(({ response }) => response)
        );
    }

    /**
     * Fetches the valid operators.
     *
     * This method retrieves a list of valid operators from the backend.
     *
     * @returns {Observable<any>} An observable that emits the response containing the valid operators.
     */
    public getValidOperators(): Observable<any> {
        const url = '?get=core_config_domain-operators';
        return this.callApi(url).pipe(
            map(({ response }) => response)
        );
    }

    /**
     * Fetches the available usages.
     *
     * This method retrieves a list of usages available in the configuration.
     *
     * @returns {Observable<any>} An observable that emits the response containing the available usages.
     */
    public getUsages(): Observable<any> {
        const url = '?get=config_usage';
        return this.callApi(url).pipe(
            map(({ response }) => response)
        );
    }

    /**
     * Fetches all instances of a specific entity with selected fields.
     *
     * This method retrieves instances of a specific entity from the backend and can filter by specific fields if provided.
     *
     * @param {string} entity - The entity to fetch instances from.
     * @param {string[]} [fields=[]] - An optional array of fields to fetch for each instance.
     * @returns {Observable<any>} An observable that emits the response containing the instances of the entity.
     */
    public collectEntitiesWithFilters(entity: string, fields: string[] = []): Observable<any> {
        const url = '?get=core_model_collect';
        return this.callApi(url, { entity, fields: JSON.stringify(fields) }).pipe(
            map(({ response }) => response)
        );
    }


    /**
     * @deprecated
     * @todo use equalComponentProvider
     * @returns
     */
    public getViews(package_name: string, entity: string): Observable<string[]> {
        const url = '?get=core_config_views';
        return this.callApi(url, { package: package_name, entity }).pipe(
            map(({response}) => response || []));
    }


    /**
     * @deprecated
     * @todo use readView
     * @returns
     */
    public getView(entity: string, name: string): Observable<any> {
        const url = '?get=core_model_view';
        return this.callApi(url, { view_id: name, entity }).pipe(
            map((result: any) => result.response || {})
        );
    }

    public async getInitData(package_name:string, type:string):Promise<{[id:string]:any}> {
        try {
            return (await this.api.fetch(`?get=core_config_init-data&package=${package_name}&type=${type}`));
        }
        catch {
            return {};
        }
    }

    public async updateInitData(package_name:string,type:string,payload:string): Promise<boolean> {
        try {
            await this.api.post(`?do=core_config_update-init-data&package=${package_name}&type=${type}`,{payload:payload});
            return true;
        }
        catch(e) {
            this.api.errorFeedback(e);
            return false;
        }
    }

    public async getTypeList() {
        try {
            return Object.keys(await this.api.fetch("?get=core_config_types"));
        }
        catch {
            return [];
        }
    }

    public async getTypeDirective() {
        try {
            return await this.api.fetch("?get=core_config_types");
        }
        catch {
            return [];
        }
    }

    public async getUsageList() {
        try {
            let x = await this.api.fetch("?get=core_config_usage");
            let y = this.construct_usage_list(x);
            return y.filter((v:string) => !v.endsWith("/")).sort((a:string,b:string) => {
                for(let i = 0; i < a.length && i < b.length ; i++) {
                    if( a < b ) return -1;
                    if( a > b ) return 1;
                }
                return a.length - b.length;
            })
        }
        catch {
            return [];
        }
    }



    /**
     * Fetches core groups from the API.
     *
     * This method retrieves a list of core groups with specific fields, sorted in ascending order.
     *
     * @returns {Observable<any>} An observable that emits the response containing the core groups.
     */
    public getCoreGroups(): Observable<any> {
        const url = '?get=core_model_collect';
        const payload = {
            fields: '[name]',
            lang: 'en',
            domain: '[]',
            order: 'id',
            sort: 'asc',
            entity: 'core\\Group'
        };
        return this.callApi(url, payload).pipe(
            map(({ response }) => response)
        );
    }


    /**
     * Fetches translations for a specific package, entity, and language.
     *
     * This method retrieves translations for a given package and entity, filtered by the specified language.
     *
     * @param {string} package_name - The name of the package.
     * @param {string} entity - The entity within the package.
     *
     * @returns {Observable<{ [id: string]: any } | null>} An observable that emits the translations if available, or `null` if no translations are found.
     */
    public getTranslations(package_name: string, entity: string) : Observable<{ [id: string]: any } | null> {
        const url = '?get=core_config_translations';
        return this.callApi(url, { entity: `${package_name}\\${entity}` }).pipe(
            map((response: any) => response.success ? response.response : null)
        );
    }

    public getTranslationLanguages(package_name: string, entity: string, language: string): Observable<string[]> {
        const url = '?get=core_config_translation';
        return this.callApi(url, { entity: `${package_name}\\${entity}`, lang: language }).pipe(
            map((response: any) => response.success ? response.response : [])
        );
    }

    public getTranslationLanguagesByPackage(package_name: string): Observable<{ [entity: string]: string[] }> {
        const url = '?get=core_config_translations';
        return this.callApi(url, { package: package_name }).pipe(
            map((response: any) => response.success ? response.response : {})
        );
    }


    /**
     * Fetches a list of available translations for a specific package and entity.
     *
     * This method retrieves a list of translation keys for the specified package and entity.
     *
     * @param {string} package_name - The name of the package.
     * @param {string} entity - The entity within the package.
     *
     * @returns {Observable<{ [id: string]: string[] }>} An observable that emits a mapping of translation IDs to their keys.
     */
    public getTranslationsList(package_name: string, entity: string): Observable<{ [id: string]: string[] }> {
        const url = '?get=core_config_translations';
        return this.callApi(url, { entity: `${package_name}\\${entity}` }).pipe(
            map(({ response }) => response ? response : {})
        );
    }

    /**
     * Saves translations for a specific package, entity, and language dictionary.
     *
     * This method updates translations for a given package and entity for each language in the dictionary.
     *
     * @param {string} package_name - The name of the package.
     * @param {string} entity - The entity within the package.
     * @param {any} dict - The translation dictionary, where keys are language codes and values are translation data.
     *
     * @returns {Observable<void>} An observable that emits when all translation updates have been completed.
     */
    public saveTranslations(package_name: string, entity: string, dict: any): Observable<any> {
        const requests = Object.keys(dict).map((lang) => {
            const url = '?do=core_config_update-translation';
            const payload = {
                package: package_name,
                entity,
                lang,
                create_lang: 'true',
                payload: JSON.stringify(dict[lang].export())
            };
            return this.callApi(url, payload, { successMessage: 'Translation updated' }).pipe(
                catchError((err) => {
                    console.error(`Error saving translation for ${lang}:`, err);
                    return of(null); // Continue even if there's an error
                })
            );
        });
        return forkJoin(requests).pipe(map(() => {})); // Wait for all the requests to finish
    }

    /**
     * Fetches translations for a specific menu.
     *
     * This method retrieves translations for a given package and menu id.
     *
     * @param {string} package_name - The name of the package.
     * @param {string} menu_id - The menu's id within the package.
     * @param {string} lang The menu's language to fetch.
     *
     * @returns {Observable<{ [id: string]: any } | null>} An observable that emits the translations if available, or `null` if no translations are found.
     */
    //#memo: This method should be updated to handle a list of translations instead of a single one, to be consistent with the other translation methods
    public getMenuTranslationsList(package_name: string, menu_id: string, lang: string): Observable<{ [id: string]: string[] }> {
        const url = '?get=core_config_i18n-menu';
        return this.callApi(url, { package: package_name, menu_id, lang }).pipe(
            map(({ response }) => response ? response : {})
        );
    }

    /**
     * Saves translations for a specific package, entity, and language dictionary.
     *
     * This method overwrites translations for a given package and entity for each language in the dictionary.
     *
     * @param {string} package_name - The name of the package.
     * @param {string} entity - The entity within the package.
     * @param {any} dict - The translation dictionary, where keys are language codes and values are translation data.
     *
     * @returns {Observable<void>} An observable that emits when all translation updates have been completed.
     */
    public overwriteTranslations(package_name: string, entity: string, dict: any): Observable<void> {
        const requests = Object.keys(dict).map((lang) => {
            const payload = dict[lang].export ? dict[lang].export() : dict[lang];
            const url = '?do=core_config_generate-i18n';
            const requestPayload = {
                package: package_name,
                entity,
                overwrite: 'true',
                lang,
                create_lang: 'true',
                payload: JSON.stringify(payload)
            };
            return this.callApi(url, requestPayload, { successMessage: 'Translation updated' }).pipe(
                catchError((err) => {
                    console.error(`Error saving translation for ${lang}:`, err);
                    return of(null); // Continue even if there's an error
                })
            );
        });

        if (requests.length === 0) {
            return of(void 0);
        }

        return from(requests).pipe(
            mergeMap((request) => request),
            toArray(),
            map(() => void 0)
        );
    }

    /**
     * Saves translations for a specific package, menu, and language dictionary.
     *
     * This method overwrites translations for a given package and menu for each language in the dictionary.
     *
     * @param {string} package_name - The name of the package.
     * @param {string} menu_name - The menu within the package.
     * @param {any} dict - The translation dictionary, where keys are language codes and values are translation data.
     *
     * @returns {Observable<void>} An observable that emits when all translation updates have been completed.
     */
    public overwriteMenuTranslations(package_name: string, menu_name: string, dict: any): Observable<{ success: boolean; message: string }> {
        const requests: Observable<boolean>[] = Object.keys(dict).map((lang) => {
            // Handle both Translator instances and plain objects
            const payload = dict[lang].export ? dict[lang].export() : dict[lang];
            const url = '?do=core_config_generate-menu-i18n';
            const requestPayload = {
                package: package_name,
                menu_name,
                overwrite: 'true',
                lang,
                create_lang: 'true',
                payload: JSON.stringify(payload)
            };

            return this.callApi(url, requestPayload, { successMessage: 'Translation updated' }).pipe(
                map((result) => !!result.success),
                catchError((err) => {
                    console.error(`Error saving translation for ${lang}:`, err);
                    return of(false);
                })
            );
        });

        if (requests.length === 0) {
            return of({ success: true, message: 'No menu translations to save' });
        }

        return forkJoin(requests).pipe(
            map((results) => {
                const success = results.every((result) => result);
                return {
                    success,
                    message: success
                        ? 'Menu translations updated'
                        : 'Some menu translations failed to update'
                };
            })
        );
    }


    /**
    * @deprecated
    * @todo for a better centralized logic, try to use equalComponentProviderService
    * @tag EqualComponentProvider to use
    */
    public collectControllers(
        controller_type: '' | 'data' | 'actions' = '',
        package_name?: string,
        format: boolean = false
      ): Observable<string[]> {
        //if no package we collect every controller of controller_type from every package
        if (!package_name) {
          return this.collectAllPackages().pipe(
            switchMap((packages) => {
              const controllerObservables = packages.map(name =>
                this.collectControllers(controller_type, name, format)
              );
              return forkJoin(controllerObservables);
            }),
            map((controllerArrays: string[][]) => controllerArrays.flat())
          );
        }
        // we collect controllers of controller_type from a package
        else {
          return this.collectControllersForPackage(package_name, controller_type, format);
        }
      }






    /**
     * Saves the UML for a given package and type.
     *
     * This method sends a request to update the UML for the specified package, type, and path,
     * using the provided payload.
     *
     * @param {string} package_name - The name of the package.
     * @param {string} type - The type of UML to save (e.g., "class", "sequence").
     * @param {string} path - The path where the UML should be saved.
     * @param {string} payload - The UML data in string format.
     *
     * @returns {Observable<boolean>} An observable that emits `true` if the UML was successfully saved, or `false` if failed.
     */
    public saveUML(package_name: string, type: string, path: string, payload: string): Observable<boolean> {
        const url = '?do=core_config_update-uml';
        const requestPayload = { package: package_name, type, filename: path, payload };
        return this.callApi(url, requestPayload).pipe(
            map(({ success }) => success)
        );
    }


    /**
     * Retrieves a list of UMLs for a specific type.
     *
     * This method fetches the list of UMLs based on the specified type.
     *
     * @param {string} type - The type of UMLs to fetch (e.g., "class", "sequence").
     *
     * @returns {Observable<{ [id: string]: string[] }>} An observable that emits a mapping of UML IDs to their associated names.
     *         If the request fails, an empty object is returned.
     */
    public getUMLList(type: string, package_name?: string): Observable<any> {
        const url = '?get=core_config_umls';
        const payload: any = { type };
        if (package_name) {
            payload.package = package_name;
        }
        if(package_name){
            return this.callApi(url, payload).pipe(
                map(({ success, response }) => success ? response[package_name] || [] : [])
            );
        }
        else{
            return this.callApi(url, payload).pipe(
                map(({ success, response }) => success ? response : {})
            );
        }

    }



    /**
     * Retrieves the content of a specific UML for a given package, type, and path.
     *
     * This method fetches the content of a UML based on the specified package name, UML type, and path.
     *
     * @param {string} package_name - The name of the package.
     * @param {string} type - The type of UML (e.g., "class", "sequence").
     * @param {string} path - The path to the UML.
     *
     * @returns {Observable<any[]>} An observable that emits the UML content as an array. If the request fails, an empty array is returned.
     */
    public getUMLContent(package_name: string, type: string, path: string): Observable<any[]> {
        const url = '?get=core_config_uml';
        return this.callApi(url, { package: package_name, type, path }).pipe(
            map(({ success, response }) => success ? response : [])
        );
    }


    /**
     * Retrieves the available widget types.
     *
     * This method fetches the available widget types.
     *
     * @returns {Observable<{ [id: string]: string[] }>} An observable that emits a mapping of widget types to their names.
     *         If the request fails, an empty object is returned.
     */
    public getWidgetTypes(): Observable<{ [id: string]: string[] }> {
        return from(this.api.fetch("?get=core_config_widget-types")).pipe(
            catchError(() => of({}))
        );
    }



    /**
     * Announces a controller action based on its type and name.
     *
     * If either the `type_controller` or `name` is missing, or if the request fails, it returns `null`.
     *
     * @param {string} [type_controller] - The action type of the controller (e.g., "do", "get").
     * @param {string} [name] - The name of the controller.
     *
     * @returns {Observable<string[] | null>} An observable that emits the controller announcement or `null` on failure.
     */
    public announceController(type_controller?: string, name?: string, ): Observable<any> {
        if (!type_controller || !name) {
            return of(null);
        }
        const url = `?${type_controller}=${name}`;
        return this.callApi(url, { announce: 'true' }).pipe(
            map(({response}) => response),
            tap((response) => console.log('announceController response:', response)),
        );
    }

    public getRoutesLive(): Observable<any> {
        const url = '?get=config_live_routes';
        return this.callApi(url).pipe(
            map(({response}) => response)
        );
    }

    //////////////////////////////////////////////////////////////////////////Private method///////////////////////////////////////////////////////////////////////////////

    private collectControllersForPackage(
        package_name: string,
        controller_type: '' | 'data' | 'actions',
        format: boolean
    ): Observable<string[]> {
        const url = '?get=core_config_controllers';

        return this.callApi(url, { package: package_name }, { successMessage: `Fetched controllers for package ${package_name}` }).pipe(
            map(({ response }) => {
                // Step 1: Retrieve controllers based on controller_type
                let controllers: string[] = controller_type
                    ? response?.[controller_type] || []
                    : response;

                // Step 2: If formatting is required, apply the formatControllerName function
                return format
                    ? controllers.map(this.formatControllerName)
                    : controllers;
            })
        );
    }




    private formatControllerName(controller: string): string {
    // Removes the first segment (prefix) of the controller name.
        return controller.split("_").slice(1).join("_");
    }

    private construct_usage_list(object:any,):string[] {
        let result = Object.keys(object);
        Object.keys(object).forEach((element) => {
            result = result.concat(
                Object.keys(object[element])
                    .map((field) => (!isNaN(parseFloat(field)) && isFinite(parseFloat(field))) ? field = `${element}/${object[element][field]}` : `${element}/${field}`)
            )
        });
        return result;
    }

}
