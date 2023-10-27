import { Injectable } from '@angular/core';
import { ApiService } from 'sb-shared-lib';


@Injectable({
    providedIn: 'root'
})
export class WorkbenchService {
    public cached_schema:any

    constructor(private api: ApiService) { }


    /**
     * // TODO
     * 
     * @param entity 
     * @returns 
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
     * Return all the usages
     *
     * @returns a JSON with all the usages
     */
    public async getUsages() {
        try {
            return await this.api.fetch('?get=config_usage');
        } catch (response: any) {
            console.warn('request error', response);
        }
    }
}
