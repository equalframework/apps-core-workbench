import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { EqualComponentDescriptor } from '../_models/equal-component-descriptor.class';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from 'sb-shared-lib';

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
            class: () => this.createClass(node.package_name, node.name, node.item.class_parent),
            get: () => this.notImplemented(`Adding controller ${node.name} not implemented`),
            do: () => this.notImplemented(`Adding controller ${node.name} not implemented`),
            view: () =>{
                    const view_name = node.name.split(":")[1];
                    return this.createView(`${node.package_name}\\${node.item.model}`, view_name)
            },
            menu: () => this.notImplemented(`Adding menu ${node.name} not implemented`),
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
            get: () => this.notImplemented(`Deleting controller ${node.name} not implemented`),
            do: () => this.notImplemented(`Deleting controller ${node.name} not implemented`),
            view: () => {
                const model_name =`${node.package_name}\\${node.item.model}`;
                const view_name = node.name.split(":")[1];
                return this.deleteView(model_name, view_name);
            },
            menu: () => this.notImplemented(`Deleting menu ${node.name} not implemented`),
            route:() =>this.notImplemented(`Deleting route ${node.name} not implemented`)
        };

        // Return the appropriate observable based on the node type, or a default message for unknown types.
        return deleteActions[node.type]?.() || of({ message: "Unknown type" });
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
        const url = `?do=core_config_create-package&package=${package_name}`;
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
        const url = `?do=core_config_delete-package&package=${package_name}`;
        const successfullyMessage=`Package ${package_name} deleted successfully!`
       return this.callApi(url,successfullyMessage)
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
    const url = `?do=core_config_create-model&model=${class_name}&package=${package_name}${parent === "equal\\orm\\Model" ? "" : `&extends=${parent.replace(/\\/g, '\\\\')}`}`;
    const successfullyMessage = `Class ${class_name} created successfully!`
    return this.callApi(url,successfullyMessage)
}

    private deleteClass(package_name:string,class_name:string){
        const url = `?do=core_config_delete-model&package=${package_name}&model=${class_name}`;
        const successfullyMessage = `Class ${class_name} deleted successfully!`
        return this.callApi(url, successfullyMessage);    
    }


    private createView(model_name: string, view_name: string): Observable<any> {
        const url = `?do=core_config_create-view&view_id=${view_name}&entity=${model_name}`;
        const successfullyMessage = `View ${view_name} created successfully!`;
        return this.callApi(url, successfullyMessage);
    }

    private deleteView(model_name:string,view_name:string){
        const url = `?do=core_config_delete-view&entity=${model_name}&view_id=${view_name}`
        const successfullyMessage = `View ${model_name}:${view_name} deleted successfully!`;
        return this.callApi(url,successfullyMessage);
    }


    private callApi(url: string, successMessage: string) {
        return from(this.api.fetch(url)).pipe(
            map(response => ({
                success: true,
                message: successMessage,
                response: response || null
            })),
            catchError(error => {
                console.error("Error details:", error);
                let errorMessage = `Error: `;
                if (error.error && error.error.errors) {
                    let errorDetails = error.error.errors;
                    for (const [key, value] of Object.entries(errorDetails)) {
                        errorMessage += `\n${key}: ${value}`;
                    }
                } else {
                    errorMessage += error.message;
                }
                return of({
                    success: false,
                    message: errorMessage,
                    error
                });
            })
        );
    }
}
