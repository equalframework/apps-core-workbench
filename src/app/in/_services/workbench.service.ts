import { HttpErrorResponse} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, from, Observable, of, } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ApiService } from 'sb-shared-lib';
import { API_ENDPOINTS } from '../_models/api-endpoints';
import { EqualComponentDescriptor } from '../_models/equal-component-descriptor.class';



@Injectable({
    providedIn: 'root'
})
export class WorkbenchService {
    updatePackage(old_node: string, new_node: string) {
        throw new Error('Method not implemented.');
    }

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
            }
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
        console.log("node : ", node);
        const deleteActions: Record<string, () => Observable<any>> = {
            package: () => this.deletePackage(node.name),
            class: () => this.deleteClass(node.package_name,node.name),
            get: () => this.deleteController(node.package_name, node.name.split("_")[1], node.type),
            do: () => this.deleteController(node.package_name, node.name.split("_")[1], node.type),
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

    public readMenu(package_name:string, menu_name:string){
        const url = API_ENDPOINTS.menu.read(package_name, menu_name)
        return this.callApi(url, '').pipe(
            map(({response}) => response)
        );
    }

    public readView(package_name:string,view_name:string,model_name:string){
        const url =API_ENDPOINTS.view.read(package_name,model_name,view_name);
        return this.callApi(url, '').pipe(
            map(({response}) => response)
        );
    }

    public updateFieldsFromClass(new_schema: {}, package_name: string, class_name: string){
        const url = `?do=config_update-model&part=class&entity=${package_name}\\${class_name}&payload=${JSON.stringify(new_schema)}`
        const successfullyMessage = `Fields from ${package_name}//${class_name} has been updated`
        return this.callApi(url,successfullyMessage);
    }

    public updateController(controller_name: string, controller_type: string, payload : {[id:string]:any}){
        const url = `?do=core_config_update-controller&controller=${controller_name}&operation=${controller_type}&payload=${JSON.stringify(payload)}`
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
        return from(this.api.get(`?get=core_model_workflow&entity=${package_name}\\${model}`)).pipe(
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
        return from(this.api.post(`?do=core_config_update-workflow&entity=${package_name}\\${model}`, { payload })).pipe(
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
        return from(this.api.post(`?do=core_config_create-workflow&entity=${package_name}\\${model}`)).pipe(
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
        return from(this.api.get(`?get=core_model_collect&entity=core\\Meta&fields=[value]&domain=[[code,=,${code}],[reference,=,${reference}]]`)).pipe(
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
          const url = '?get=core_model_schema&entity=' + entity;
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



    public async InitPackage(package_name:string, do_import: boolean, do_cascade:boolean, do_import_cascade:boolean): Promise<boolean> {
        try {
            await this.api.fetch("?do=core_init_package&package="+package_name+(do_import ? "&import=true":"")+"&cascade="+(do_cascade ? "true" : "false")+"&import_cascade="+(do_import_cascade ? "true" : "false"))
            return true;
        }
        catch {
            return false;
        }
    }


    public async getInitializedPackages(): Promise<string[]> {
        let result = [];
            try {
                result = await this.api.fetch('?get=core_config_live_packages');
            }
            catch (response: any) {
                console.warn('fetch package error', response);
            }
        return result;
    }

    public async getPackageConsistency(package_name: string ): Promise<any> {
        let result = []
            try {
                if(package_name.length <= 0) {
                    throw 'ignoring empty package';
                }
                result = await this.api.fetch('?do=test_package-consistency&package='+package_name);
            }
            catch (response: any) {
                console.warn('fetch package error', response);
            }

        return result;
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

    private callApi(url: string, successMessage: string, body:any = {}) {
            return from(this.api.fetch(url,body)).pipe(
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

///////////////////// Functions that should be delete because of duplication but if we delete them now, nothing will work and it will be too much work to do
        /**
         * @deprecated
         * @todo use equalComponentProvider
         * @returns
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
         * @returns
         */
        public listModelFrom(package_name: string): Observable<string[]> {
            const url = '?get=core_config_classes';
            return this.callApi(url, '').pipe(
              map((result: any) => result.response[package_name] || [])
            );
          }

        /**
         * @deprecated
         * @todo use equalComponentProvider
         * @returns
         */
        public listControllerFromPackageAndByType(pkg: string, type: "data" | "actions" | "apps", pkname: boolean = false): Observable<string[]> {
            const url = `?get=core_config_controllers&package=${pkg}`;
            return this.callApi(url, '').pipe(
              map((result: any) => {
                const temp: string[] = result.response[type] || [];
                return pkname ? temp : temp.map(item => item.split("_").slice(1).join("_"));
              })
            );
          }


        /**
         * @deprecated
         * @todo use equalComponentProvider
         * @returns
         */
        public listControllersByType(type: "data" | "actions" | "apps"): Observable<string[]> {
            return this.collectAllPackages().pipe(
              switchMap((pkgs: string[]) => {
                const observables = pkgs.map(pkg => {
                  const url = `?get=core_config_controllers&package=${pkg}`;
                  return this.callApi(url, '').pipe(
                    map((result: any) => result.response[type] || [])
                  );
                });
                return forkJoin(observables);
              }),
              map((arrays: string[][]) => arrays.flat())
            );
          }


        /**
         * @deprecated
         * @todo use equalComponentProvider
         * @returns
         */
        public listViewFrom(pkg: string, entity?: string): Observable<string[]> {
            const url = entity === undefined
              ? `?get=core_config_views&package=${pkg}`
              : `?get=core_config_views&entity=${pkg}\\${entity}`;
            return this.callApi(url, '').pipe(
              map((result: any) => result.response || [])
            );
          }


        /**
         * @deprecated
         * @todo use equalComponentProvider
         * @returns
         */
        public listAllModels(): Observable<string[]> {
            const url = '?get=core_config_classes';
            return this.callApi(url, '').pipe(
              map((result: any) => {
                const x = result.response;
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
         * @deprecated
         * @todo use equalComponentProvider
         * @returns
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
         * @returns
         */
        public getRoutesByPackage(pkg: string): Observable<any> {
            const url = `?get=core_config_routes&package=${pkg}`;
            return this.callApi(url, '').pipe(
              map((result: any) => result.response)
            );
          }



        public getAllRouteFiles(): Observable<string[]> {
            const packagesUrl = '?get=core_config_packages';
            return this.callApi(packagesUrl, '').pipe(
                switchMap((result: any) => {
                const packs: string[] = result.response || [];
                const observables = packs.map(pkg => {
                    const url = `?get=core_config_routes&package=${pkg}`;
                    return this.callApi(url, '').pipe(
                    map((res: any) => Object.keys(res.response || {}))
                    );
                });
                return forkJoin(observables);
                }),
                map((arrays: string[][]) => arrays.flat())
            );
        }




        // Method from embedded Api, I just copied them here to delete embedded api need a refactoring


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
        return this.callApi(url, '');
    }

      public getControllers(eq_package: string): Observable<any> {
        const url = `?get=core_config_controllers&package=${eq_package}`;
        return this.callApi(url, '').pipe(
            map(({response}) => response)
        );
      }

      public getClasses(): Observable<any> {
        const url = '?get=core_config_classes';
        return this.callApi(url, '').pipe(
            map(({response}) => response)
        );
      }

      public getTypes(): Observable<any> {
        const url = '?get=config_types';
        return this.callApi(url, '').pipe(
            map(({response}) => response)
        );
      }

      public getValidOperators(): Observable<any> {
        const url = '?get=core_config_domain-operators';
        return this.callApi(url, '').pipe(
            map(({response}) => response)
        );
      }

      public getUsages(): Observable<any> {
        const url = '?get=config_usage';
        return this.callApi(url, '').pipe(
            map(({response}) => response)
        );
      }

    public getAllInstanceFrom(entity: string, fields: string[] = []): Observable<any> {
        const url = `?get=core_model_collect&entity=${entity}&fields=${JSON.stringify(fields)}`;
        return this.callApi(url, '').pipe(
            map(({response}) => response)
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
            map((result: any) => result.response || [])
        );
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

    public async getInitData(pkg:string, type:string):Promise<{[id:string]:any}> {
        try {
            return (await this.api.fetch(`?get=core_config_init-data&package=${pkg}&type=${type}`));
        }
        catch {
            return {};
        }
    }

    public async updateInitData(pkg:string,type:string,payload:string): Promise<boolean> {
        try {
            await this.api.post(`?do=core_config_update-init-data&package=${pkg}&type=${type}`,{payload:payload});
            return true;
        }
        catch(e) {
            console.log(e);
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

    public getCoreGroups(): Observable<any> {
        const url = '?get=core_model_collect&fields=[name]&lang=en&domain=[]&order=id&sort=asc&entity=core\\Group';
        return this.callApi(url, '').pipe(
            map(({response}) => response)
        );;
    }



    public getTranslations(pkg: string, entity: string, lang: string): Observable<{ [id: string]: any } | null> {
        const url = `?get=core_config_translation&lang=${lang}&entity=${pkg}\\${entity}`;
        return this.callApi(url, '').pipe(
            map((response: any) => response.success ? response.response : null) // Si success est true, retourne la réponse, sinon null
        );
    }


    public getTranslationsList(pkg: string, entity: string): Observable<{ [id: string]: string[] }> {
        const url = `?get=core_config_translations&entity=${pkg}\\${entity}`;
        return this.callApi(url, '').pipe(
            map((response: any) => response.success ? response.response : {}) // Si success est true, retourne la réponse, sinon un objet vide
        );
    }


    public saveTranslations(pkg: string, entity: string, dict: any): Observable<void> {
        const requests = Object.keys(dict).map((lang) => {
            const url = `?do=core_config_update-translation&package=${pkg}&entity=${entity}&lang=${lang}&create_lang=true&payload=${JSON.stringify(dict[lang].export())}`;
            return this.callApi(url, 'Translation updated').pipe(
                catchError((err) => {
                    console.error(`Error saving translation for ${lang}:`, err);
                    return of(null); // Continue even if there's an error
                })
            );
        });
        return forkJoin(requests).pipe(map(() => {})); // Wait for all the requests to finish
    }


    public async getDataControllerList(pkg:string):Promise<string[]> {
        try {
        return (await this.api.fetch("?get=core_config_controllers&package="+pkg))['data']
        } catch {
        return []
        }
    }

    public getAllActionControllers(): Observable<string[]> {
        const packagesUrl = '?get=core_config_packages';
        return this.callApi(packagesUrl, 'Fetched packages').pipe(
          switchMap((pkgResponse: any) => {
            const packs: string[] = pkgResponse.response || [];
            const controllerObservables = packs.map(pkg => {
              const url = `?get=core_config_controllers&package=${pkg}`;
              return this.callApi(url, `Fetched controllers for package ${pkg}`).pipe(
                map((ctrlResponse: any) => ctrlResponse.response?.['actions'] || [])
              );
            });
            return forkJoin(controllerObservables);
          }),
          map((controllersArray: string[][]) => controllersArray.flat())
        );
      }





    public saveUML(pkg: string, type: string, path: string, payload: string): Observable<boolean> {
        const url = `?do=core_config_update-uml&package=${pkg}&type=${type}&filename=${path}`;
        return this.callApi(url, '', {payload : payload}).pipe(
            map(({success}) => success)
        );
    }


    public getUMLList(type: string): Observable<{ [id: string]: string[] }> {
        const url = `?get=core_config_umls&type=${type}`;
        return this.callApi(url, '').pipe(
            map(({ success, response }) => success ? response : {})
        );
    }


    public getUMLContent(pkg: string, type: string, path: string): Observable<any[]> {
        const url = `?get=core_config_uml&package=${pkg}&type=${type}&path=${path}`;
        return this.callApi(url, '').pipe(
            map(({ success, response }) => success ? response : [])
        );

    }


    public getWidgetTypes(): Observable<{ [id: string]: string[] }> {
        return from(this.api.fetch("?get=core_config_widget-types")).pipe(
            catchError(() => of({}))
        );
    }


     /**
     * Return the announcement of a controller
     *
     * @param string type_controller the action of the controller(do or get)
     * @param string eq_package name of the package
     * @param string name of the controller
     * @returns array with the announcement of a controller
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
        );;
    }


}
