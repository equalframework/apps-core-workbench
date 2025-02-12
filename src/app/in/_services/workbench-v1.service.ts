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
            class: () => this.notImplemented(`Adding class ${node.name} not implemented`),
            get: () => this.notImplemented(`Adding controller ${node.name} not implemented`)
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
            class: () => this.notImplemented(`Deleting class ${node.name} not implemented`),
            get: () => this.notImplemented(`Deleting controller ${node.name} not implemented`)
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
        return from(this.api.call(url)).pipe(
            // Transform the raw response into a business object with success status and message.
            map(() => ({
                success: true,
                message: `Package ${package_name} created successfully!`,
            })),
            catchError(error =>
                of({
                    success: false,
                    message: `Error during package creation: ${error.message}`,
                    error
                })
            )
        );
    }

    /**
     * Sends a request to delete a package in the backend system.
     *
     * @param package_name The name of the package to delete.
     * @returns An observable that emits the result of the package deletion, including a success or error message.
     */
    private deletePackage(package_name: string): Observable<any> {
        const url = `?do=core_config_delete-package&package=${package_name}`;
        return from(this.api.fetch(url)).pipe(
            map(response => ({
                success: true,
                message: `Package ${package_name} deleted successfully!`,
                response: response || null
            })),
            catchError(error =>
                of({
                    success: false,
                    message: `Error during package deletion: ${error.message}`,
                    error
                })
            )
        );
    }
}
