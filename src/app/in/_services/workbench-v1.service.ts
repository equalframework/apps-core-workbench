import { Injectable } from '@angular/core';
import {from, Observable, of } from 'rxjs';
import { EqualComponentDescriptor } from '../_models/equal-component-descriptor.class';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ApiService } from 'sb-shared-lib';
import { WorkflowNode } from '../package/model/workflow/_components/workflow-displayer/_objects/WorkflowNode';
import { Anchor, WorkflowLink } from '../package/model/workflow/_components/workflow-displayer/_objects/WorkflowLink';
import { cloneDeep } from 'lodash';
import { HttpErrorResponse } from '@angular/common/http';
import { API_ENDPOINTS } from '../_models/api-endpoints';
/**
 * WorkbenchV1Service is responsible for managing the creation and deletion of various components
 * such as packages, classes, and controllers within the system.
 * It handles requests to the backend API to create and delete components and provides relevant feedback.
 */
@Injectable({
    providedIn: 'root'
})
export class WorkbenchV1Service {
    constructor(private api: ApiService) { }

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
            view: () =>{
                    const view_name = node.name.split(":")[1];
                    return this.createView(node.package_name,node.item.model, view_name)
            },
            menu: () => this.createMenu(node.package_name, node.name, node.item.subtype),
            route:() =>this.notImplemented(`Adding route ${node.name} not implemented`)
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
            route:() =>this.notImplemented(`Deleting route ${node.name} not implemented`)
        };

        // Return the appropriate observable based on the node type, or a default message for unknown types.
        return deleteActions[node.type]?.() || of({ message: "Unknown type" });
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
    * @example
    * // Usage example
    * createClass('myPackage', 'MyNewClass', 'equal\\orm\\Model')
    *   .subscribe(result => {
    *     if (result.success) {
    *       console.log(result.message); // Class MyNewClass created successfully!
    *     } else {
    *       console.error(result.message); // Error during class creation
    *     }
    *   });
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




    public async updateSchema(new_schema: {}, package_name: string, class_name: string) {
        try {
            return await this.api.fetch('?do=config_update-model&part=class&entity=' + package_name + "\\" + class_name + '&payload=' + JSON.stringify(new_schema));
        }
        catch (response: any) {
            console.warn('request error', response);
        }
        console.log('#### schema updated', new_schema);
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

    private deleteMenu(package_name:string,menu_name:string){
        const url = API_ENDPOINTS.menu.delete(package_name,menu_name)
        const successfullyMessage = `Menu ${menu_name} deleted successfully!`
        return this.callApi(url,successfullyMessage);
        }



    private callApi(url: string, successMessage: string) {
        return from(this.api.fetch(url)).pipe(
            map(response => ({
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
 /**
  * //Doesn't work 
   * Fetches workflow data and prepares it in an Observable pattern. 
   * @param packageName The package name.
   * @param model The class name (model).
   * @returns An Observable containing nodes, links, metadata, and other data.
   */
 /*public getWorkflowData(packageName: string, model: string): Observable<{
    nodes: WorkflowNode[],
    links: WorkflowLink[],
    exists: boolean,
    hasMetaData: number | undefined,
    modelScheme: any
  }> {
    return this.getWorkflow(packageName, model).pipe(
      switchMap((r: any) => {
        if (!r.exists) {
          // If workflow does not exist, return an observable with default empty values
          return of({
            nodes: [],
            links: [],
            exists: false,
            hasMetaData: undefined,
            modelScheme: {}
          });
        }

        // Fetch metadata and schema if workflow exists
        return this.fetchMetaData('workflow', `${packageName}.${model}`).pipe(
          switchMap(metadata => {
            const hasMetaData = metadata && Object.keys(metadata).length > 0 ? metadata[0].id : undefined;
            return this.getSchema(`${packageName}\\${model}`).pipe(
              map(modelScheme => {
                return this.prepareWorkflowData(r.info, metadata, hasMetaData, modelScheme);
              })
            );
          })
        );
      }),
      catchError((error) => {
        console.error('Error loading workflow data:', error);
        // In case of error, return default values for nodes, links, etc.
        return of({
          nodes: [],
          links: [],
          exists: false,
          hasMetaData: undefined,
          modelScheme: {}
        });
      })
    );
  }*/


  /**
   * Prepares the workflow data from the API response and metadata.
   * @param workflowData The workflow data (nodes).
   * @param metadata The metadata.
   * @param hasMetaData Whether metadata exists.
   * @param modelScheme The model schema.
   * @returns An object containing nodes, links, metadata, etc.
   */
  private prepareWorkflowData(workflowData: any, metadata: any[], hasMetaData: number, modelScheme: any) {
    const result = {
      nodes: [] as WorkflowNode[],
      links: [] as WorkflowLink[],
      exists: true,
      hasMetaData: hasMetaData,
      modelScheme: modelScheme
    };
    console.log("Metadata  : ", metadata);
    let orig = { x: 200, y: 200 };
    let mdt: any = {};
    if (hasMetaData) {
      mdt = JSON.parse(metadata[0].value);
    }
    // For positioning nodes
    let offset_x = 0;
    let offset_y = 0;
    let is_first = true;
    for (let node in workflowData) {
      let pos = (!hasMetaData || !mdt[node] || !mdt[node].position)
        ? cloneDeep(orig)
        : mdt[node].position;

      if (is_first && pos.x < 200) {
        offset_x = -pos.x + 200;
      }
      if (is_first && pos.y < 200) {
        offset_y = -pos.y + 200;
      }
      pos.x += offset_x;
      pos.y += offset_y;
      result.nodes.push(new WorkflowNode(node, {
        description: workflowData[node].description,
        position: pos,
        help: workflowData[node].help,
        icon: workflowData[node].icon
      }));
      orig.y += 100;
      orig.x += 100;
      is_first = false;
    }
    // Creating links (transitions)
    for (let node in workflowData) {
      for (let link in workflowData[node].transitions) {
        let a = this.getNodeByName(result.nodes, node);
        let b = this.getNodeByName(result.nodes, workflowData[node].transitions[link].status);
        if (!b) {
          b = new WorkflowNode(workflowData[node].transitions[link].status, { position: cloneDeep(orig) });
          result.nodes.push(b);
          orig.y += 100;
          orig.x += 300;
        }
        if (a && b) {
          const anch1 = (!mdt[a.name] || !mdt[a.name].transitions || !mdt[a.name].transitions[link] || !mdt[a.name].transitions[link].anchorFrom)
            ? Anchor.MiddleRight
            : mdt[a.name].transitions[link].anchorFrom;
          const anch2 = (!mdt[a.name] || !mdt[a.name].transitions || !mdt[a.name].transitions[link] || !mdt[a.name].transitions[link].anchorTo)
            ? Anchor.MiddleLeft
            : mdt[a.name].transitions[link].anchorTo;
          result.links.push(new WorkflowLink(a, b, anch1, anch2, Object.assign(workflowData[node].transitions[link], { name: link })));
        }
      }
    }
    console.log("préapration : ", result);
    return result;
  }

  private getNodeByName(nodes: WorkflowNode[], name: string): WorkflowNode | null {
    return nodes.find(node => node.name === name) || null;
  }

    /**
   * Fetches the workflow data.
   * @param pkg The package name.
   * @param model The model name.
   * @returns An Observable containing the workflow data.
   */
    public getWorkflow(pkg: string, model: string): Observable<any> {
        return from(this.api.get(`?get=core_model_workflow&entity=${pkg}\\${model}`)).pipe(
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
       * @param pkg The package name.
       * @param model The model name.
       * @param payload The payload to save.
       * @returns An Observable that resolves to a boolean indicating success.
       */
      public saveWorkflow(pkg: string, model: string, payload: string): Observable<boolean> {
        return from(this.api.post(`?do=core_config_update-workflow&entity=${pkg}\\${model}`, { payload })).pipe(
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
       * @param pkg The package name.
       * @param model The model name.
       * @returns An Observable that resolves to a boolean indicating success.
       */
      public createWorkflow(pkg: string, model: string): Observable<boolean> {
        return from(this.api.post(`?do=core_config_create-workflow&entity=${pkg}\\${model}`)).pipe(
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
      return from(this.api.fetch('?get=core_model_schema&entity=' + entity)).pipe(
        switchMap(schema => of(schema)),
        catchError((response: any) => {
          console.warn('Request error:', response);
          return of({ fields: [] });
        })
      );
    }
    return of({ fields: [] }); // Return an observable with default schema if no entity is provided
  }



  public saveView(payload:any, package_name: string, entity:string,viewid:string):Observable<any>{
    console.log("save view : ", payload);
    console.log("save view: ", viewid);
    const url = `?do=core_config_update-view&entity=${package_name}\\${entity}&view_id=${viewid}&payload=${JSON.stringify(payload)}`;
    const successfullyMessage = `${viewid} has been updated`
    return this.callApi(url, successfullyMessage);
}
    }

