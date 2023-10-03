import { HttpErrorResponse } from '@angular/common/http';
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

    public getErrorstring(x:any):string {
        let res = "{"
        for(let key in x) {
            res += " "+key +" : "+x[key]+" "
        }
        return res + "}"
    }

    public async deleteView(entity:string,view_id:string):Promise<string|undefined>{
        try {
            await this.api.fetch("?do=core_config_delete-view&entity="+entity+"&view_id="+view_id)
            return undefined
        } catch(resp:any) {
            return this.getErrorstring(resp.error.errors)
        }
        
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

    public async listAllModels():Promise<string[]> {
        try {
            let x = (await this.api.fetch('?get=core_config_classes'))
            let ret:string[] = []
            for(let key in x) {
                for(let item of x[key]){
                    ret.push(key+"\\"+item)
                }
            }
            return ret
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

    public async createModel(pkg:string,name:string,parent:string){
        this.api.fetch("?do=core_config_create-model&model="+name+"&package="+pkg+(parent === "equal\\orm\\Model" ? "" : "&extends="+parent))
    }

}
 