import { HttpErrorResponse} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, from, Observable, of, } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ApiService } from 'sb-shared-lib';
import { API_ENDPOINTS } from '../_models/api-endpoints';
import { EqualComponentDescriptor } from '../_models/equal-component-descriptor.class';
import { PackageInfos, PackageSummary } from '../_models/package-info.model';
import { ViewSchema } from '../_models/view-schema.model';
import { PolicyResponse } from '../_models/policy.model';
import { Actions } from '../_models/actions.model';
import { convertRights, Right, Roles } from '../_models/roles.model';


@Injectable({
    providedIn: 'root'
})
export class WorkbenchService {

    constructor(private api: ApiService,) {}




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
                    const view_name = node.name.split(":")[1];
                    return this.createView(node.package_name,node.item.model, view_name)
            },
            menu: () => this.createMenu(node.package_name, node.name, node.item.subtype),
            route:() => {
                        const file_name = node.file.split("/").pop()?.trim() ??""
                        return this.createRoute(node.package_name,file_name,node.name)
            },
            policy:()=>  this.notImplemented("Policy creation not implemented")


        };

        // Return the appropriate observable based on the node type, or a default message for unknown types.
        return createActions[node.type]?.() || of({ message: "Unknown type" });
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
                const view_name = node.name.split(":")[1];
                return this.deleteView(node.package_name,node.item.model, view_name);
            },
            menu: () => this.deleteMenu(node.package_name,node.name),
            route:() =>this.notImplemented(`Deleting route not implemented`)
        };

        // Return the appropriate observable based on the node type, or a default message for unknown types.
        return deleteActions[node.type]?.() || of({ message: "Unknown type" });
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
        return this.callApi(url, '').pipe(
            map(({ response }) => response)
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
        const url = API_ENDPOINTS.view.read(package_name, model_name, view_name);
        return this.callApi(url, '').pipe(
            map(({ response }) => response)
        );
    }

    public getPolicies(package_name: string, class_name:string): Observable<PolicyResponse>{
        const url = API_ENDPOINTS.class.policies.get(package_name,class_name);
        return this.callApi(url,'').pipe(
            map(({response})=> response)
        );
    }

    public getActions(package_name:string, class_name:string):Observable<Actions>{
        const url = API_ENDPOINTS.class.actions.get(package_name,class_name);
        return this.callApi(url,'').pipe(
            map(({response}) => response)
        )
    }

    public getRoles(package_name:string, class_name:string):Observable<Roles>{
        const url = API_ENDPOINTS.class.roles.get(package_name,class_name);
        return this.callApi(url,'').pipe(
            map(({ response }) => {
                Object.keys(response).forEach(roleKey => {
                    const role = response[roleKey];
                    if (role.rights && !Array.isArray(role.rights[0])) {
                        role.rights = convertRights(role.rights as unknown as number);
                    }
                });
                return response;
              })
            );
    }

    public saveActions(package_name:string, class_name:string,payload:any): Observable<any>{
        const url = API_ENDPOINTS.class.actions.save(package_name, class_name);
        return this.callApi(url,'Actions saved', { payload });
    }

    public savePolicies(package_name:string, class_name:string, payload:any): Observable<any>{
        const url = API_ENDPOINTS.class.policies.save(package_name,class_name);
        return this.callApi(url,'Policies saved', { payload });
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
        const url = API_ENDPOINTS.class.update_fields(new_schema, package_name, class_name);
        const successfullyMessage = `Fields from ${package_name}//${class_name} has been updated`;
        return this.callApi(url, successfullyMessage);
    }

    /**
     * Updates a given controller with the provided payload.
     *
     * @param controller_name The name of the controller to be updated.
     * @param controller_type The type of the controller (e.g., 'data', 'actions').
     * @param payload The payload containing the data to update the controller.
     * @returns Observable indicating the success of the update operation.
     */
    public updateController(controller_name: string, controller_type: string, payload: { [id: string]: any }): Observable<any> {
        const url = API_ENDPOINTS.controller.update(controller_name, controller_type, payload);
        const successfullyMessage = `${controller_name} has been updated`;
        return this.callApi(url, successfullyMessage);
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
    public createWorkflow(package_name: string, model: string): Observable<boolean> {
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
    public createMetaData(code: string, reference: string, payload: string): Observable<boolean> {
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
    public saveMetaData(id: number, payload: string): Observable<boolean> {
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
          const url = API_ENDPOINTS.schema.get(entity);
          return this.callApi(url, '').pipe(
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
        const url = API_ENDPOINTS.view.save(payload,package_name,model,view_id)
        const successfullyMessage = `${view_id} has been updated`
        return this.callApi(url, successfullyMessage);
    }

    public readPackage(package_name: string): Observable<{ response: PackageSummary; message: string }> {
        const url = API_ENDPOINTS.package.infos(package_name);
        return this.callApi(url, '').pipe(
            map(({ response, message }) => {
                const packageInfo: PackageInfos = response;

                const transformedResponse: PackageSummary = {
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
        const url = `?do=core_init_package&package=${package_name}` +
          `${do_import ? `&import=true` : ``}` +
          `&cascade=${do_cascade ? `true` : `false`}` +
          `&import_cascade=${do_import_cascade ? `true` : `false`}`;

        return this.callApi(url, ``).pipe(
          map(({ response }) => response)
        );
      }

    public getInitializedPackages(): Observable<any> {
        const url = `?get=core_config_live_packages`;
        return this.callApi(url, ``).pipe(
            map(({ response }) => response)
        );
    }

    public checkPackageConsistency(package_name: string): Observable<any> {
        if (package_name.length <= 0) {
            console.warn(`Ignoring empty package`);
            return of([]);
        }
        const url = `?do=test_package-consistency&package=${package_name}`;
        return this.callApi(url, ``)
        ;
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
        const url = API_ENDPOINTS.package.create(package_name);
        const successfullyMessage=`Package ${package_name} created successfully!`
        return this.callApi(url, successfullyMessage);
    }

    /**
     * Sends a request to delete a package in the backend system.
     *
     * @param package_name The name of the package to delete.
     * @returns An observable that emits the result of the package deletion, including a success or error message.
     */
    private deletePackage(package_name: string): Observable<any> {
        const url = API_ENDPOINTS.package.delete(package_name);
        const successfullyMessage=`Package ${package_name} deleted successfully!`
        return this.callApi(url, successfullyMessage);
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
    private createClass(package_name: string, class_name: string, parent: string) {
    const url = API_ENDPOINTS.class.create(package_name,class_name,parent);
    const successfullyMessage = `Class ${class_name} created successfully!`
    return this.callApi(url,successfullyMessage)
    }

    private deleteClass(package_name:string,class_name:string){
        const url = API_ENDPOINTS.class.delete(package_name,class_name);
        const successfullyMessage = `Class ${class_name} deleted successfully!`
        return this.callApi(url, successfullyMessage);
    }

    private createView(package_name:string, model_name: string, view_name: string): Observable<any> {
        const url = API_ENDPOINTS.view.create(package_name,model_name,view_name);
        const successfullyMessage = `View ${view_name} created successfully!`;
        return this.callApi(url, successfullyMessage);
    }

    private deleteView(package_name:string,model_name:string,view_name:string){
        const url = API_ENDPOINTS.view.delete(package_name,model_name,view_name);
        const successfullyMessage = `View ${model_name}:${view_name} deleted successfully!`;
        return this.callApi(url,successfullyMessage);
    }


    private createController(package_name: string, controller_name: string, controller_type: string): Observable<any> {
        const url = API_ENDPOINTS.controller.create(package_name,controller_name,controller_type)
        const successfullyMessage = `Controller ${controller_name} of type ${controller_type} created successfully!`
        return this.callApi(url,successfullyMessage);
    }

    private deleteController(package_name: string, controller_name: string, controller_type: string): Observable<any> {
        const url = API_ENDPOINTS.controller.delete(package_name,controller_name, controller_type);
        const successfullyMessage = `Controller ${controller_name} of type ${controller_type} deleted successfully!`
        return this.callApi(url, successfullyMessage);
    }

    private createMenu(package_name:string, menu_name:string, menu_type:string) {
        const url = API_ENDPOINTS.menu.create(package_name,menu_name,menu_type)
        const successfullyMessage = `Menu ${menu_name} of type ${menu_type} created successfully!`
        return this.callApi(url,successfullyMessage);
    }

    private deleteMenu(package_name:string,menu_name:string) {
        const url = API_ENDPOINTS.menu.delete(package_name,menu_name)
        const successfullyMessage = `Menu ${menu_name} deleted successfully!`
        return this.callApi(url,successfullyMessage);
    }

    private createRoute(package_name: string, file_name: string, route_name: string): Observable<any> {
        const url = API_ENDPOINTS.route.create(package_name,file_name,route_name)
        const successfullyMessage=`Route ${route_name} created successfully!`
        return this.callApi(url, successfullyMessage)
    }

    /**
     * Calls the API and processes the response.
     *
     * This method makes an API call using the provided URL and request body, then processes the response.
     * On success, it returns the response along with a success message. On failure, it catches the error,
     * logs it to the console, and returns an error message along with the error details.
     *
     * @param {string} url - The URL endpoint for the API request.
     * @param {string} successMessage - A custom success message to be returned upon a successful API call.
     * @param {any} [body={}] - The request body to be sent with the API call (optional). Defaults to an empty object.
     *
     * @returns {Observable<{ success: boolean, message: string, response: any }>} An observable containing the result of the API call.
     *  - success: A boolean indicating whether the API call was successful (`true` if successful, `false` if failed).
     *  - message: A string providing a success or error message.
     *  - response: The response from the API if successful, or the error details if failed.
     *
     * Example usage:
     * ```typescript
     * this.callApi('/endpoint', 'Data fetched successfully')
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
    private callApi(url: string, successMessage: string, payload:any = {}): Observable<{ success: boolean; message: string; response: any; }> {
            return from(this.api.fetch(url,payload)).pipe(
                map((response: any) => ({
                    success: true,
                    message: successMessage,
                    response: response || null
                })),
                catchError(response => { //changer en response
                    console.error("Error details:", response);
                    let errorMessage = `Error: `;
                    if (response.error && response.error.errors) {
                        let errorDetails = response.error.errors;
                        for (const [key, value] of Object.entries(errorDetails)) {
                            errorMessage += `\n${key}: ${value}`;
                        }
                    } else {
                        errorMessage += response.message;
                    }
                    return of({
                        success: false,
                        message: errorMessage,
                        response: response
                    });
                })
            );
        }

///////////////////// Functions that should need refactoring because it can still contain duplication functions
    /**
     * @deprecated
     * @todo for a better centralized logic, try to use equalComponentProviderService
     * @tag EqualComponentProvider to use
     */
    public collectAllPackages(): Observable<string[]> {
        const url = '?get=config_packages';
        return this.callApi(url, '').pipe(
            map((result: any) => result.response || [])
        );
        }

    /**
     * @deprecated
     * @todo use equalComponentProvider
     * @tag EqualComponentProvider
     * */
    public collectViews(package_name: string, entity?: string): Observable<string[]> {
        const url = entity === undefined
            ? `?get=core_config_views&package=${package_name}`
            : `?get=core_config_views&entity=${package_name}\\${entity}`;
        return this.callApi(url, '').pipe(
            map((result: any) => result.response || [])
        );
        }





    /**
     * @deprecated
     * @todo use equalComponentProvider
     * @tag EqualComponentProvider
     */
    public getMenusByPackage(package_name: string): Observable<string[]> {
        const url = `?get=core_config_menus&package=${package_name}`;
        return this.callApi(url, '').pipe(
            map((result: any) => result.response || [])
        );
        }


    /**
     * @deprecated
     * @todo use equalComponentProvider
     * @tag EqualComponentProvider
     */
    public getRoutesByPackage(package_name: string): Observable<any> {
        const url = `?get=core_config_routes&package=${package_name}`;
        return this.callApi(url, '').pipe(
            map((result: any) => result.response)
        );
        }



    public getAllRouteFiles(): Observable<string[]> {
        const packagesUrl = '?get=core_config_packages';
        return this.callApi(packagesUrl, '').pipe(
            switchMap((result: any) => {
            const packs: string[] = result.response || [];
            const observables = packs.map(package_name => {
                const url = `?get=core_config_routes&package=${package_name}`;
                return this.callApi(url, '').pipe(
                map((res: any) => Object.keys(res.response || {}))
                );
            });
            return forkJoin(observables);
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
        let stringParams = '';
        for (let key in params) {
            if (Array.isArray(params[key])) {
                stringParams += `&${key}=${JSON.stringify(params[key])}`;
            } else {
                stringParams += `&${key}=${params[key]}`;
            }
        }

        const url = `?${type_controller}=${controller_name}${stringParams}`;
        return this.callApi(url, '').pipe();
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
        return this.callApi(url, '').pipe(
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
        return this.callApi(url, '').pipe(
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
        return this.callApi(url, '').pipe(
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
        return this.callApi(url, '').pipe(
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
        const url = `?get=core_model_collect&entity=${entity}&fields=${JSON.stringify(fields)}`;
        return this.callApi(url, '').pipe(
            map(({ response }) => response)
        );
    }


    /**
     * @deprecated
     * @todo use equalComponentProvider
     * @returns
     */
    public getViews(package_name: string, entity: string): Observable<string[]> {
        const url = `?get=core_config_views&package=${package_name}&entity=${entity}`;
        return this.callApi(url, '').pipe(
            map(({response}) => response || []));
    }


    /**
     * @deprecated
     * @todo use readView
     * @returns
     */
    public getView(entity: string, name: string): Observable<any> {
        const url = `?get=core_model_view&view_id=${name}&entity=${entity}`;
        return this.callApi(url, '').pipe(
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
        const url = '?get=core_model_collect&fields=[name]&lang=en&domain=[]&order=id&sort=asc&entity=core\\Group';
        return this.callApi(url, '').pipe(
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
     * @param {string} lang - The language code (e.g., "en", "fr").
     *
     * @returns {Observable<{ [id: string]: any } | null>} An observable that emits the translations if available, or `null` if no translations are found.
     */
    public getTranslations(package_name: string, entity: string, lang: string): Observable<{ [id: string]: any } | null> {
        const url = `?get=core_config_translation&lang=${lang}&entity=${package_name}\\${entity}`;
        return this.callApi(url, '').pipe(
            map((response: any) => response.success ? response.response : null)
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
        const url = `?get=core_config_translations&entity=${package_name}\\${entity}`;
        return this.callApi(url, '').pipe(
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
    public saveTranslations(package_name: string, entity: string, dict: any): Observable<void> {
        const requests = Object.keys(dict).map((lang) => {
            const url = `?do=core_config_update-translation&package=${package_name}&entity=${entity}&lang=${lang}&create_lang=true&payload=${JSON.stringify(dict[lang].export())}`;
            return this.callApi(url, 'Translation updated').pipe(
                catchError((err) => {
                    console.error(`Error saving translation for ${lang}:`, err);
                    return of(null); // Continue even if there's an error
                })
            );
        });
        return forkJoin(requests).pipe(map(() => {})); // Wait for all the requests to finish
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
        const url = `?do=core_config_update-uml&package=${package_name}&type=${type}&filename=${path}`;
        return this.callApi(url, '', { payload: payload }).pipe(
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
        const url = `?get=core_config_umls&type=${type}&package=${package_name}`;
        if(package_name){
            return this.callApi(url, '').pipe(
                map(({ success, response }) => success ? response[package_name] || [] : [])
            );
        }
        else{
            return this.callApi(url, '').pipe(
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
        const url = `?get=core_config_uml&package=${package_name}&type=${type}&path=${path}`;
        return this.callApi(url, '').pipe(
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
        const url = `?${type_controller}=${name}&announce=true`;
        return this.callApi(url, '').pipe(
            map(({response}) => response),
            catchError(() => {
                return of(null);
            })
        );
    }

    public getRoutesLive(): Observable<any> {
        const url = '?get=config_live_routes';
        return this.callApi(url, '').pipe(
            map(({response}) => response)
        );
    }

    //////////////////////////////////////////////////////////////////////////Private method///////////////////////////////////////////////////////////////////////////////

    private collectControllersForPackage(
        package_name: string,
        controller_type: '' | 'data' | 'actions',
        format: boolean
    ): Observable<string[]> {
        const url = `?get=core_config_controllers&package=${package_name}`;

        return this.callApi(url, `Fetched controllers for package ${package_name}`).pipe(
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
        })
        return result;
    }

}
