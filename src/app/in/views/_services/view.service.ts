import { Injectable } from '@angular/core';
import { ApiService } from 'sb-shared-lib';


@Injectable({
    providedIn: 'root'
})
export class ViewService {
    public cached_schema:any

    constructor(private api: ApiService) { }

    public async getViews(type:string,entity:string):Promise<string[]> {
        try {
            return await this.api.fetch("?get=core_config_views&"+type+"="+entity)
        } catch(response) {
            return []
        }
    }

    public async getView(entity:string,name:string):Promise<any> {
        try {
            return await this.api.fetch("?get=core_model_view&view_id="+name+"&entity="+entity)
        } catch (response) {
            return null
        }
    }

    public async getSchema(entity: string) {
        try {
            return await this.api.fetch('?get=core_model_schema&entity=' + entity);
        }
        catch (response: any) {
            console.warn('request error', response);
        }
    }
}
