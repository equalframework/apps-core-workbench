import { Injectable } from '@angular/core';
import { ApiService } from 'sb-shared-lib';

// TODO add refresh function

@Injectable({
    providedIn: 'root'
})
export class EmbbedApiService {
    constructor(
        protected api: ApiService
    ) {}

    public async createView(model:string,view_id:string) {
        this.api.fetch("?do=core_config_create-view&view_id="+view_id+"&entity="+model)
    }

    public async createPackage(packagename:string) {
        this.api.fetch("?do=core_config_create-package&package="+packagename)
    }

    public async listPackages():Promise<string[]|undefined> {
        try {
            return await this.api.fetch("?get=core_config_packages")
        } catch(response) {
            console.error(response)
            return undefined
        }
        
    }

    public async listModelFrom(pkg:string):Promise<string[]|undefined> {
        try {
            return (await this.api.fetch('?get=core_config_classes'))[pkg];
        }
        catch (response: any) {
            console.warn('fetch class error', response);
        }
        return []
    }

    public async listViewFrom(pkg:string,entity:string|undefined=undefined):Promise<string[]|undefined> {
        if(entity === undefined) {
            try {
                return (await this.api.fetch('?get=core_config_views&package='+pkg));
            }
            catch (response: any) {
                console.warn('fetch class error', response);
            }
            return []
        } else {
            try {
                return (await this.api.fetch('?get=core_config_views&entity='+pkg+'\\'+entity));
            }
            catch (response: any) {
                console.warn('fetch class error', response);
            }
            return []
        }
        
    }

}
