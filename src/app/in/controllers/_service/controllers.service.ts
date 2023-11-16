import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { isArray } from 'lodash';
import { ApiService } from 'sb-shared-lib';
import { EmbbedApiService } from 'src/app/_services/embbedapi.service';

@Injectable({
    providedIn: 'root'
})
export class ControllersService extends EmbbedApiService {

    

    constructor(api: ApiService) {
        super(api)
     }

    /**
     * Return all the packages available.
     *
     * @returns A array with all packages
     */
    public async getPackages() {
        try {
            return await this.api.fetch('?get=config_packages');
        }
        catch (response: any) {
            console.warn('fetch package error', response);
        }
    }

    public async getControllers(eq_package: string) {
        try {
            return await this.api.fetch('?get=core_config_controllers&package=' + eq_package);
        }
        catch (response: any) {
            console.warn('request error', response);
        }
    }

    /**
     * Return the announcement of a controller
     *
     * @param string type_controller the action of the controller(do or get)
     * @param string eq_package name of the package
     * @param string name of the controller
     * @returns array with the announcement of a controller
     */
    public async getAnnounceController(type_controller: string, name: string) {
        try {
            return await this.api.fetch('?' + type_controller + '='+ name + '&announce=true');
        }
        catch (response: any) {
            return null;
        }
    }

    /**
     * Return the respond of a controller after execution
     *
     * @param string type_controller the act
     * @param string eq_package name of the
     * @param string name of the controller
     * @param array all the parameters for the controller
     * @returns array with the respond of a controller's execution
     */
    public async submitController(type_controller: string, controller_name: string, params: []):Promise<{err:boolean,resp:any}> {
        let stringParams = '';
        for(let key in params) {
            if(isArray(params[key])) {
                stringParams += '&' + key + '=' + JSON.stringify(params[key])
            } else {
                stringParams += '&' + key + '=' + params[key];
            }
        }
        try {
            return {err : false, resp: (await this.api.fetch('?' + type_controller + '=' + controller_name + stringParams))};
        }
        catch (response) {
            return {err : true, resp:response}
        }
    }

    /**
     * Get all the domain's operators for each type.
     *
     * @returns An object with key-values.
     */
    public async getValidOperators() {
        try {
            return await this.api.fetch('?get=core_config_domain-operators');
        } catch (response: any) {
            console.warn('request error', response);
        }
    }

    /**
     * Return the schema of the specified entity.
     *
     * @param entity - The namespace of the schema.
     * @returns A JSON of the schema with key-values.
     */
    public async getSchema(entity: string) {
        try {
            return await this.api.fetch('?get=core_model_schema&entity=' + entity);
        }
        catch (response: any) {
            console.warn('request error', response);
        }
    }

    /**
     * Return all the routes available.
     *
     * @return A array with all routes
     */
    public async getRoutes() {
        try {
            return await this.api.fetch('?get=config_live_routes');
        }
        catch (response: any) {
            console.warn('fetch package error', response);
        }
    }
}
